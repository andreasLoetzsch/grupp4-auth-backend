const express = require("express");
const { exportUserDataZip, exportUserDataPdf } = require("../controllers/meController.js");

const router = express.Router();

router.post("/export/zip", exportUserDataZip);
router.post("/export/pdf", exportUserDataPdf);

module.exports = router;