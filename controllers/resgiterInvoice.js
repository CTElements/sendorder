const Invoice = require('../models/invoice');
const Tenant = require('../models/tenant')

module.exports = {
    async registerInvoice(invoice_id, invoice_status, operator, tenantToken) {
        if (!invoice_id) {
            return { msg: 'Número da nota é obrigatório!', status: 422 };
        }
        if (!invoice_status) {
            return { msg: 'Status da nota é obrigatório!', status: 422 };
        }
        if (!operator) {
            return { msg: 'O operador é obrigatório!', status: 422 };
        }
        const tenant = await Tenant.findOne({ token: tenantToken })
        if (!tenant) {
            return { status: 404, msg: "Empresa não encontrada!" }
        }
        const invoiceExist = await Invoice.findOne({ invoice_id: invoice_id });
        if (invoiceExist) {
            return { msg: 'A nota já está cadastrada!', status: 422 };
        }
        const invoice = new Invoice({
            invoice_id,
            invoice_status,
            operator,
            tenant: tenant._id
        });
        try {
            await invoice.save();
            return { invoice, status: 200, msg: "A nota foi cadastrada com sucesso!" };
        } catch (error) {
            return { msg: 'Erro ao cadastrar a nota', error: error.message, status: 500 };
        }
    },
    async deleteInvoice(invoice_id, tenantToken) {
        try {
            if (!invoice_id) {
                return { msg: 'Número da nota é obrigatório para exclusão!', status: 422 };
            }
            const tenant = await Tenant.findOne({ token: tenantToken })
            if (!tenant) {
                return { status: 404, msg: "Empresa não encontrada!" }
            }
            const deletedInvoice = await Invoice.findOneAndDelete({ invoice_id: invoice_id, tenant: tenant._id });

            if (!deletedInvoice) {
                return { msg: 'nota não encontrada!', status: 404 };
            }
            return { msg: 'nota removida com sucesso!', status: 200 };
        } catch (error) {
            return { msg: 'Erro ao remover a nota', error: error.message, status: 500 };
        }
    },
    async listInvoices(tenantToken) {
        try {
            const tenant = await Tenant.findOne({ token: tenantToken })
            if (!tenant) {
                return { status: 404, msg: "Empresa não encontrada!" }
            }
            const invoices = await Invoice.find({ tenant: tenant._id }).select('-_id');
            if (invoices.length === 0) {
                return { msg: 'Nenhuma nota encontrada!', status: 404 };
            }
            return { invoices, status: 200 };
        } catch (error) {
            return { msg: 'Erro ao listar as notas', error: error.message, status: 500 };
        }
    },
    async getInvoice(invoice_id, tenantToken) {
        try {
            const tenant = await Tenant.findOne({ token: tenantToken })
            if (!tenant) {
                return { status: 404, msg: "Empresa não encontrada!" }
            }
            if (!invoice_id) {
                return { msg: 'Número da nota é obrigatório!', status: 422 };
            }
            const invoice = await Invoice.findOne({ invoice_id: invoice_id, tenant: tenant._id }).select('-_id');
            if (!invoice) {
                return { msg: 'Nota não encontrada!', status: 404 };
            }
            return { invoice, status: 200 };
        } catch (error) {
            return { msg: 'Erro ao buscar a nota', error: error.message, status: 500 };
        }
    }
   
};
