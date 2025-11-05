const mongoose = require('mongoose')

const { Schema } = mongoose;

const consentSchema = new Schema({
    uuid: {
        type: String,
        required: true,
        index: true,
        match: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    },
    status: { 
        type: String, 
        enum: ["accept", "reject", "custom"], 
        required: true 
    },
    categories: {
        necessary: { 
            type: Boolean, 
            default: true,
            validate: {
                validator: v => v === true,
                message: "The 'necessary' category must always be true."
            }
        },
        functional: { type: Boolean, default: false },
        analytics: { type: Boolean, default: false },
        marketing: { type: Boolean, default: false },
        personalization: { type: Boolean, default: false }
    },
    version: { type: String, index: true, required: true }
}, { strict: "throw", timestamps: { createdAt: true, updatedAt: false } });

module.exports = mongoose.model('Consent', consentSchema)