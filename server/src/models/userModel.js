const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    id: { type: Number, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    salt: { type: String, required: true },
    role: { type: String, enum: ['buyer', 'organizer'], default: 'buyer' },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
