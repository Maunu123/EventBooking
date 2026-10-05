const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    id: { type: String, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.Mixed, required: true },
    key: { type: String, required: true },
    eventId: { type: String, required: true },
    eventTitle: { type: String, required: true },
    date: { type: String },
    venue: { type: String },
    quantity: { type: Number, required: true },
    totalPaise: { type: Number, required: true },
    status: { type: String, default: 'demo' },
    method: { type: String, required: true },
    customer: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        idType: { type: String, default: 'none' },
        idNumber: { type: String, default: '' },
        aadhaar: { type: String, default: '' },
        pan: { type: String, default: '' },
        ticketType: { type: String, default: 'Standard' },
        promoCode: { type: String, default: '' },
        companyName: { type: String, default: '' },
    },
}, { timestamps: true });

bookingSchema.index({ userId: 1, key: 1 }, { unique: true });

const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

module.exports = Booking;
