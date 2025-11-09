const AuditLog = require('../models/auditModel');

const logEvent = async (userId, event, metadata = {}) => {
    try {
        await AuditLog.create({ userId, event, metadata });
        console.log(`Audit log created: ${event} for user ${userId}`);
    } catch (error) {
        console.error('Failed to create audit log:', error);
    }
};

module.exports = { logEvent };