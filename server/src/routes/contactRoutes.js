const express = require('express');
const router = express.Router();
const { submitEnquiry } = require('../controllers/contactController');
const { validateContact } = require('../middlewares/validatorMiddleware');

// POST /api/contact - Submit user contact enquiry
router.post('/contact', validateContact, submitEnquiry);

module.exports = router;
