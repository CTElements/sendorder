

const mongoose = require('mongoose')

const Invoice = mongoose.model('Invoice', {
    invoice_id: { type: String, required: true },
    invoice_status: { type: String, required: true },
    operator: { type: String, required: true },
    create_At: { type: Date, default: Date.now },
})

module.exports = Invoice