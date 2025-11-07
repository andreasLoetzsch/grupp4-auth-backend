const express = require("express");
const requireJson = require("../middleware/requireJson.js");
const { postSave } = require("../controllers/journalController.js");

const router = express.Router();

router.post("/upsert", requireJson, postSave);

module.exports = router;