const Consent = require("../models/consentModel.js");

const KNOWN_CATEGORIES = ["necessary", "functional", "analytics", "marketing", "personalization"];

const storeConsent = async (req, res) => {
    try {
        const { consent } = req.body;
        const consentUUID = req.consentUUID;

        if(!consent) {
            return res.status(400).json({ message: "Missing consent in request body" });
        }

        if(!consentUUID) {
            return res.status(400).json({ message: "Missing consent UUID" });
        }

        const rawCats = consent.categories || {};
        const categories = {};
        for (const key of KNOWN_CATEGORIES) {
            if (key in rawCats) categories[key] = !!rawCats[key];
        }

        const consentDoc = new Consent({
            uuid: consentUUID,
            status: consent.status,
            categories,
            version: consent.version
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

const getTransparency = (req, res) => {
  return res.status(200).json({
    version: "1.0.0",
    lastUpdated: "2025-11-05",
    controller: {
      name: "Example AB",
      contact: "privacy@example.com"
    },
    summary: "This website uses essential cookies for security and session management, and functional cookies to keep you logged in. Essential cookies cannot be disabled. You can accept all cookies or customize your preferences below.",
    dataCategories: [
      {
        type: "Necessary Cookies",
        reason: "Used for essential functions such as session management (sid), CSRF protection against attacks, and tracking your cookie consent preferences (consent UUID).",
        duration: "Session cookie (sid): 1 hour, CSRF token: 7 days, Consent UUID: 1 year",
        legal: "Legitimate Interest (Art. 6(1)(f) GDPR)",
        cookies: ["sid", "csrfToken", "consent_UUID"]
      },
      {
        type: "Functional Cookies",
        reason: "Used to keep you securely logged in through access and refresh tokens.",
        duration: "Access token: 1 hour, Refresh token: 7 days",
        legal: "Consent (Art. 6(1)(a) GDPR)",
        cookies: ["accessToken", "refreshToken"]
      }
    ]
  });
};

module.exports = { storeConsent, getTransparency };