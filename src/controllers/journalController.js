const Journal = require("../models/journalModel.js");
const mongoose = require('mongoose');

// Helper to get today's date as YYYY-MM-DD
function todayISODate() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

const postSave = async (req, res) => {
    try {
        const { title, content, author } = req.body.data || {};

        if(!title || !content || !author) {
            return res.status(400).json({ message: "Fields 'title', 'content' and 'author' are required." });
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

module.exports = { postSave };