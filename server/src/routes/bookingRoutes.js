const express = require('express');
const router = express.Router();
const { getMyBookings, createDemoBooking } = require('../controllers/bookingController');
const { authenticateUser } = require('../middlewares/authMiddleware');
const { validateBooking } = require('../middlewares/validatorMiddleware');

// GET /api/bookings - Get authenticated user's bookings
router.get('/bookings', authenticateUser, getMyBookings);

// POST /api/bookings/demo - Create a demo ticket booking
router.post('/bookings/demo', authenticateUser, validateBooking, createDemoBooking);

module.exports = router;
