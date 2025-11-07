const Journal = require("../models/journalModel.js");
const mongoose = require('mongoose');
const { todayISODate } = require("../utils/dates.js");

const postSave = async (req, res) => {
    try {
        const { title, content, author } = req.body.data || {};

        if(!title || !content || !author) {
            return res.status(400).json({ message: "Fields 'title', 'content' and 'author' are required and cant be empty." });
        }

        if(!mongoose.Types.ObjectId.isValid(author)) {
            return res.status(400).json({ message: "Invalid author id." });
        }

        const date = todayISODate();

        // Find existing journal for this author and today's date, or create one
        const update = {
            title,
            content,
            author,
            date,
            updatedAt: new Date()
        };

        const options = { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true };

        // Use findOneAndUpdate so we can return the created/updated document if needed
        const doc = await Journal.findOneAndUpdate(
            { author, date },
            update,
            options
        );

        return res.status(201).json({ success: true, message: "Journal created/updated successfully.", journalId: doc._id });
    } catch(e) {
        // Handle duplicate key (shouldn't happen because we use findOneAndUpdate) and validation errors
        if (e.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation error', details: e.message });
        }
        console.error(e);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const getJournal = async (req, res) => {
    try {
        const { authorId, date } = req.params;

        if(!authorId) {
            return res.status(400).json({ message: "Missing authorId path parameter." });
        }

        if(!mongoose.Types.ObjectId.isValid(authorId)) {
            return res.status(400).json({ message: "Invalid author id." });
        }

        if(!date) {
            return res.status(400).json({ message: "Missing 'date' in path parameter. Format: YYYY-MM-DD" });
        }

        if(!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({ message: "Date must be in YYYY-MM-DD format." });
        }

        const doc = await Journal.findOne({ author: authorId, date }).lean();

        if(!doc) {
            return res.status(404).json({ message: "Journal not found for given author and date." });
        }

        return res.status(200).json({ success: true, journal: doc });
    } catch(e) {
        console.error(e);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { postSave, getJournal };