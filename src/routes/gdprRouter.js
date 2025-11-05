const express = require("express");
const { storeConsent } = require("../controllers/gdprController.js");

const router = express.Router();

router.post("/consent/store", storeConsent);

module.exports = router;