const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    token: { type: String, required: true, unique: true, index: true },
    userId: { type: Number, required: true, index: true },
    expires: { type: Number, required: true },
}, { timestamps: true });

const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);

module.exports = Session;
