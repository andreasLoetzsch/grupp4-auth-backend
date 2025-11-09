const mongoose = require('mongoose');
const { ref } = require('pdfkit');

const auditLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    event: {
        type: String,
        required: true,
        enum: ['LOGIN', 'CONSENT_UPDATE', 'DATA_REQUEST', 'DATA_EXPORT', 'ACCOUNT_DELETE'],
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    metadata: {
        type: Object,
        default: {},
    }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);