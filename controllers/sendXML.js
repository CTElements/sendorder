
const axios = require('axios')
const tokenVapt = require('./vaptToken')
const tokenBling = require('./blingToken')
const orderType = require('./oderType')
const Invoice = require('../controllers/resgiterInvoice')
const sendFiles = require('../controllers/sendDataFtp')

async function sendDataForVapt(res, data, invoice_number){
    try {
        const xmlContent = data.xmlContent
        const token = await tokenVapt()
        const response = await axios.post('https://vector.log.br/api/app/vapt/post-order-elements', xmlContent, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/xml' 
            },
        });
        const invoice = await Invoice.registerInvoice(invoice_number, 'pending', 'vapt')
        return res.status(200).json({ msg: response.data.success, invoice })

    } catch (error) {
        console.log("error data to vapt")
        console.log(error)
        return res.status(200).send(error)
    }
}

async function getXMLToInvoice(id, token, attempt = 1) {
    const maxAttempts = 10; 
    try {
        const link = `https://bling.com.br/Api/v3/nfe/${id}`;
        const response = await axios.get(link, {
            headers: {
                "Authorization": `Bearer ${token.token}`
            }
        });
        var invoice = response.data.data;
        var naturezaOperacao_id = invoice.naturezaOperacao.id;
        var naturezaExist = orderType.find(e => e.id == naturezaOperacao_id)
        if (!naturezaExist) return { msg: "Esse pedido não é um pedido de venda.", status: 500 };
        var xmlUrl = invoice.xml;
        const getXML = await axios.get(xmlUrl, { responseType: 'document' });
        const xmlContent = getXML.data.replace(/<\?xml.*?\?>\s*/, '');
        return { xmlContent, invoice, status: 200 };
    } catch (error) {
        var msg = error.response.data.error.description
        if (attempt < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 600));
            return await getXMLToInvoice(id, token, attempt + 1);
        } else {
            return { msg: msg, status: 500 };
        }
    }
}

async function sendDataForVendemmia(res, chaveAcesso, linkPDF, linkxml, invoice_number) {
   try {
       let key = chaveAcesso 
       var sendFileFtp = await sendFiles(linkPDF, linkxml, key)
       if(sendFileFtp.status !== 200){
           return res.status(200).json({ msg: sendFileFtp.msg })
       }
       const invoice = await Invoice.registerInvoice(invoice_number, 'pending','vendemmia') 
       return res.status(200).json({ msg: sendFileFtp.msg, invoice })
   } catch (error) {
       return res.status(200).send(error) 
   }
}
module.exports = {
 async sendXML(req, res){
    try { 
        const data = req.body
        var invoiceId = req.body?.id
        var invoiceInit = data?.retorno?.notasfiscais[0]?.notafiscal 
        var id = !invoiceId ? invoiceInit.id : invoiceId 
        var token = await tokenBling()
        var xmlData = await getXMLToInvoice(id, token)
        if(xmlData.status !== 200){
            return res.status(200).json({ status: 500, msg: xmlData.msg })
        }
        var invoice = xmlData.invoice
        const situacao = invoice.situacao
        const isOpenBox = invoice?.transporte?.transportador?.nome.includes('OPEN BOX') 
        if (situacao !== 6){
            console.log(`invoice status: ${situacao}`)
            return res.status(200).json({ status: 500, situacao: situacao, msg:"O status da nota deve estar como Emitida." })
        }

        if (isOpenBox) {
            return res.status(200).json({ status: 500, msg: "Esse produto é OPEN BOX não poder ser enviado para operador" })
        }
        var invoice_number = invoice.numero
        var transportName = invoice?.transporte.transportador.nome.toLowerCase()
        if(transportName.includes('vapt')){
            return await sendDataForVapt(res, xmlData, invoice_number) 
        }else{
            var chaveAcesso = invoice.chaveAcesso 
            var linkPDF = invoice.linkPDF 
            var linkxml = invoice.xml
            return await sendDataForVendemmia(res, chaveAcesso, linkPDF, linkxml, invoice_number)
        }
    } catch (error) {
        console.log(error)
        res.status(200).json({ error: error , status: 500})
    }
 }
}
