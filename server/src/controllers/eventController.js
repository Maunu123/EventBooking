const { randomUUID } = require('node:crypto');
const Event = require('../models/eventModel');
const { formatCurrencyINR, formatIndianDate, formatIndianTime } = require('../utils');

// Get all events
const getEvents = async (req, res) => {
    try {
        const events = await Event.find().select('-_id -__v').lean();
        res.status(200).json({ events, source: 'database' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch events from database.' });
    }
};

// Get organizer's own events
const getOrganizerEvents = async (req, res) => {
    try {
        const events = await Event.find({ ownerId: req.user.id }).select('-_id -__v').lean();
        res.status(200).json({ events });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch organizer events.' });
    }
};

// Create a new event
const createEvent = async (req, res) => {
    try {
        const { title, category, venue, description, startDate, pricePaise, capacity, image } = req.validatedEvent;
        const date = new Date(startDate);

        const newEvent = await Event.create({
            id: randomUUID(),
            ownerId: req.user.id,
            title,
            category,
            venue,
            location: venue,
            description,
            startDate,
            pricePaise,
            capacity,
            price: formatCurrencyINR(pricePaise / 100),
            date: formatIndianDate(date),
            time: formatIndianTime(date),
            organizer: req.user.name,
            image: image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
            highlights: [],
            schedule: [],
        });

        res.status(201).json({ event: newEvent });
    } catch (err) {
        res.status(500).json({ error: 'Failed to publish event.' });
    }
};

module.exports = {
    getEvents,
    getOrganizerEvents,
    createEvent,
};
