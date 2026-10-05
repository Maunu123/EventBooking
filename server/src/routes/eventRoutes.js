const express = require('express');
const router = express.Router();
const { getEvents, getOrganizerEvents, createEvent } = require('../controllers/eventController');
const { authenticateUser, requireOrganizer } = require('../middlewares/authMiddleware');
const { validateEvent } = require('../middlewares/validatorMiddleware');

// GET /api/events - List all events
router.get('/events', getEvents);

// GET /api/organizer/events - List events for logged-in organizer
router.get('/organizer/events', authenticateUser, requireOrganizer, getOrganizerEvents);

// POST /api/events - Publish a new event (organizer only)
router.post('/events', authenticateUser, requireOrganizer, validateEvent, createEvent);

module.exports = router;
