const { randomUUID } = require('node:crypto');
const Booking = require('../models/bookingModel');
const Event = require('../models/eventModel');
const { calculateTierUnitPrice, applyPromoDiscount } = require('../utils');

// Get bookings for the authenticated user
const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user.id })
            .select('-_id -__v -key -userId')
            .sort({ createdAt: -1 })
            .lean();
        res.status(200).json({ bookings });
    } catch (err) {
        res.status(500).json({ error: 'Failed to retrieve bookings.' });
    }
};

// Create a new booking
const createDemoBooking = async (req, res) => {
    try {
        const { key, eventId, quantity, method, customer } = req.validatedBooking;

        // Idempotency: Return existing booking if key matches
        const existing = await Booking.findOne({ userId: req.user.id, key }).select('-_id -__v').lean();
        if (existing) {
            return res.status(200).json({ booking: existing });
        }

        const event = await Event.findOne({ id: String(eventId) });
        if (!event) {
            return res.status(404).json({ error: 'Event not found.' });
        }

        if (event.startDate && Date.parse(event.startDate) <= Date.now()) {
            return res.status(400).json({ error: 'This event has already started.' });
        }

        if (event.capacity && quantity > event.capacity) {
            return res.status(400).json({ error: 'Quantity exceeds event capacity.' });
        }

        const basePricePaise = event.pricePaise ?? Math.round(Number(event.price.replace(/[^0-9.]/g, '')) * 100);
        const unitPricePaise = calculateTierUnitPrice(basePricePaise, customer.ticketType);
        const subtotalPaise = unitPricePaise * quantity;
        const totalPaise = applyPromoDiscount(subtotalPaise, customer.promoCode);

        const newBooking = await Booking.create({
            id: `DEMO-${randomUUID()}`,
            key,
            userId: req.user.id,
            eventId: String(event.id),
            eventTitle: event.title,
            date: event.date,
            venue: event.venue,
            quantity,
            totalPaise,
            status: 'demo',
            method,
            customer,
        });

        res.status(201).json({ booking: newBooking });
    } catch (err) {
        if (err.code === 11000) {
            const existing = await Booking.findOne({ userId: req.user.id, key: req.validatedBooking.key }).lean();
            if (existing) return res.status(200).json({ booking: existing });
        }
        res.status(500).json({ error: 'Failed to complete ticket booking.' });
    }
};

module.exports = {
    getMyBookings,
    createDemoBooking,
};
