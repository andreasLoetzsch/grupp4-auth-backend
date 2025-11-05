const Consent = require("../models/consentModel.js");

const KNOWN_CATEGORIES = ["necessary", "functional", "analytics", "marketing", "personalization"];

const storeConsent = async (req, res) => {
    try {
        const { consentBody } = req.body;
        const consentUUID = req.consentUUID;

        if(!consentBody) {
            return res.status(400).json({ message: "Missing consentBody in request body" });
        }

        if(!consentUUID) {
            return res.status(400).json({ message: "Missing consent UUID" });
        }

        const rawCats = consentBody.categories || {};
        const categories = {};
        for (const key of KNOWN_CATEGORIES) {
            if (key in rawCats) categories[key] = !!rawCats[key];
        }

        const consentDoc = new Consent({
            uuid: consentUUID,
            status: consentBody.status,
            categories,
            policyVersion: consentBody.policyVersion
        });

        const saved = await consentDoc.save();

        return res.status(201).json({ success: true, id: saved._id, createdAt: saved.createdAt, message: "Consent stored successfully" });
    } catch(e) {
        if(e.name === "ValidationError") {
            res.status(400).json({ error: "Invalid consent data", details: e.message });
        } else {
            console.error(e);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
};

module.exports = { storeConsent };