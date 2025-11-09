const Consent = require('../models/consentModel');
const { logEvent } = require('../services/auditLogService');

const updateConsent = async (req, res) => {
  try {
    const uuid = req.consentUUID;
    const { status, categories, version } = req.body;

    const consent = await Consent.findOneAndUpdate(
      { uuid },
      { status, categories, version },
      { new: true, upsert: true }
    );

    await logEvent(uuid, 'CONSENT_UPDATE', { status, categories, version });

    res.status(200).json({ success: true, message: "Consent updated successfully.", consent });
  } catch (error) {
    console.error("Failed to update consent:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { updateConsent };