const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    id: { type: String, unique: true, index: true },
    ownerId: { type: mongoose.Schema.Types.Mixed },
    title: { type: String, required: true },
    category: { type: String, required: true },
    date: { type: String },
    startDate: { type: String, required: true },
    time: { type: String },
    location: { type: String },
    venue: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String },
    organizer: { type: String },
    price: { type: String },
    pricePaise: { type: Number, required: true },
    capacity: { type: Number, required: true },
    highlights: [{ type: String }],
    schedule: [[{ type: String }]],
}, { timestamps: true });

const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

module.exports = Event;
