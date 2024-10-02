const mongoose = require('mongoose');
const slugify = require('slugify');
const tenantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    document: {
        type: String,
        required: true,
    },
    document_type: {
        type: String,
        required: true,
        enum: ['CNPJ', 'CPF'],
        default: 'CNPJ',
    },
    domain: {
        type: String,
        required: true,
        unique: true,
    },
    plan: {
        type: String,
        enum: ['basic', 'pro', 'enterprise'],
        default: 'basic',
    },
    settings: {
        theme: { type: String, default: 'default' },
        language: { type: String, default: 'en' },
        timezone: { type: String, default: 'UTC' },
    },
    billing: {
        cardType: String,
        cardLastFour: String,
        subscriptionStart: Date,
        subscriptionEnd: Date,
        status: String
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['active', 'pending', 'suspend', 'test'],
        default: 'test',
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    logo: {
        type: String, // ou Buffer se você armazenar a imagem diretamente
        required: false
    },
    description: {
        type: String,
        required: false
    }
});

tenantSchema.pre('validate', async function (next) {
    if (!this.domain) {
        const slug = slugify(this.name, { lower: true, strict: true });
        this.domain = `${slug}`;
    }
    next();
});

tenantSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const Tenant = mongoose.model('Tenant', tenantSchema);

module.exports = Tenant;
