const Invoice = require('../models/invoice');

module.exports = {
    async registerInvoice(invoice_id, invoice_status, operator) {
        if (!invoice_id) {
            return { msg: 'Número da nota é obrigatório!', status: 422 };
        }
        if (!invoice_status) {
            return { msg: 'Status da nota é obrigatório!', status: 422 };
        }
        if (!operator) {
            return { msg: 'O operador é obrigatório!', status: 422 };
        }
        const invoiceExist = await Invoice.findOne({ invoice_id: invoice_id });
        if (invoiceExist) {
            return { msg: 'A nota já está cadastrada!', status: 422 };
        }
        const invoice = new Invoice({
            invoice_id,
            invoice_status,
            operator,
        });
        try {
            await invoice.save();
            return { invoice, status: 200, msg: "A nota foi cadastrada com sucesso!" };
        } catch (error) {
            return { msg: 'Erro ao cadastrar a nota', error: error.message, status: 500 };
        }
    },
    async deleteInvoice(invoice_id) {
        if (!invoice_id) {
            return { msg: 'Número da nota é obrigatório para exclusão!', status: 422 };
        }
        try {
            const deletedInvoice = await Invoice.findOneAndDelete({ invoice_id: invoice_id });

            if (!deletedInvoice) {
                return { msg: 'nota não encontrada!', status: 404 };
            }
            return  { msg: 'nota removida com sucesso!', status: 200 };
        } catch (error) {
            return { msg: 'Erro ao remover a nota', error: error.message, status: 500 };
        }
    },
    async listInvoices() {
        try {
            const invoices = await Invoice.find().select('-_id'); 
            if (invoices.length === 0) {
                return { msg: 'Nenhuma nota encontrada!', status: 404 };
            }
           
            return { invoices, status: 200 };
        } catch (error) {
            return { msg: 'Erro ao listar as notas', error: error.message, status: 500 };
        }
    }
};
