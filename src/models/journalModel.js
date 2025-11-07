const mongoose = require('mongoose')

const { Schema } = mongoose;

const journalSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: mongoose.Types.ObjectId, required: true },
    // ISO date string (YYYY-MM-DD) representing the journal day
    date: { type: String, required: true, index: true },
}, { timestamps: { createdAt: true, updatedAt: true } });

// Ensure one journal per author per date
journalSchema.index({ author: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Journal', journalSchema)