const express = require("express");
const requireJson = require("../middleware/requireJson.js");
const { postSave, getJournal } = require("../controllers/journalController.js");

const router = express.Router();

router.post("/upsert", requireJson, postSave);
router.get("/:authorId/:date", getJournal);

module.exports = router;