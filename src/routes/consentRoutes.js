const express = require("express");
const { updateConsent, getAuditTrail } = require("../controllers/consentController");
const consentUUID = require("../middleware/consentUUID");
const { get } = require("mongoose");

const router = express.Router();

router.post("/update", consentUUID, updateConsent);
router.get("/audit/:userId", getAuditTrail);
router.get("/audit-trail/:userId", getAuditTrail);

module.exports = router;
