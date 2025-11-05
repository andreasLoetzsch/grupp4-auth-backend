const express = require("express");
const requireJson = require("../middleware/requireJson.js");
const { storeConsent, getTransparency } = require("../controllers/gdprController.js");

const router = express.Router();

router.post("/consent/store", requireJson, storeConsent);

router.get("/transparency", getTransparency)

module.exports = router;