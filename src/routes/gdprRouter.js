const express = require("express");
const { storeConsent } = require("../controllers/gdprController.js");
const requireJson = require("../middleware/requireJson.js");

const router = express.Router();

router.post("/consent/store", requireJson, storeConsent);

module.exports = router;