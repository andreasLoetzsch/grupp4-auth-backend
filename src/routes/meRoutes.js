const express = require("express");
const { exportUserDataZip, exportUserDataPdf, exportUserDataJson } = require("../controllers/meController.js");

const router = express.Router();

router.post("/export/zip", exportUserDataZip);
router.post("/export/pdf", exportUserDataPdf);
router.post("/export/json", exportUserDataJson);

module.exports = router;