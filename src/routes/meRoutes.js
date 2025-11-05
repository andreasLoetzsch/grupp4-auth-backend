const express = require("express");
const { exportUserData } = require("../controllers/meController.js");

const router = express.Router();

router.post("/export", exportUserData);

module.exports = router;