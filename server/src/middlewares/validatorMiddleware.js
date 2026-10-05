const { clean, emailValid, phoneValid, eventImage } = require('../utils');

const validateRegister = (req, res, next) => {
    const { name, email, password, role } = req.body || {};
    const cleanedName = clean(name, 100);
    const cleanedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const pass = typeof password === 'string' ? password : '';
    const userRole = role === 'organizer' ? 'organizer' : 'buyer';

    if (!cleanedName) {
        return res.status(400).json({ error: 'Enter your name (up to 100 characters).' });
    }
    if (!emailValid(cleanedEmail) || cleanedEmail.length > 254) {
        return res.status(400).json({ error: 'Enter a valid email address.' });
    }
    if (pass.length < 8 || pass.length > 128) {
        return res.status(400).json({ error: 'Password must be between 8 and 128 characters.' });
    }

    req.validatedBody = {
        name: cleanedName,
        email: cleanedEmail,
        password: pass,
        role: userRole,
    };
    next();
};

const validateLogin = (req, res, next) => {
    const { email, password, role } = req.body || {};
    const cleanedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const pass = typeof password === 'string' ? password : '';
    const userRole = role === 'organizer' ? 'organizer' : 'buyer';

    if (!emailValid(cleanedEmail) || !pass) {
        return res.status(400).json({ error: 'Enter a valid email and password.' });
    }

    req.validatedBody = {
        email: cleanedEmail,
        password: pass,
        role: userRole,
    };
    next();
};

const validateEvent = (req, res, next) => {
    const body = req.body || {};
    const title = clean(body.title, 120);
    const category = clean(body.category, 50);
    const venue = clean(body.venue, 200);
    const description = clean(body.description, 3000);
    const startDate = clean(body.startDate, 30);
    const pricePaise = body.pricePaise;
    const capacity = body.capacity;

    if (
        !title ||
        !category ||
        !venue ||
        description.length < 20 ||
        !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:[\d.]+Z$/.test(startDate) ||
        !Number.isFinite(Date.parse(startDate)) ||
        Date.parse(startDate) <= Date.now() ||
        !Number.isInteger(pricePaise) ||
        pricePaise < 0 ||
        pricePaise > 100000000 ||
        !Number.isInteger(capacity) ||
        capacity < 1 ||
        capacity > 100000
    ) {
        return res.status(400).json({
            error: 'Provide valid event details, a future date, capacity and ticket price.'
        });
    }

    const submittedImage = clean(body.image, 2000);
    const image = eventImage(submittedImage);
    if (submittedImage && !image) {
        return res.status(400).json({
            error: 'Use a direct HTTPS image URL, not an image-search results page.'
        });
    }

    req.validatedEvent = {
        title,
        category,
        venue,
        description,
        startDate,
        pricePaise,
        capacity,
        image,
    };
    next();
};

const validateBooking = (req, res, next) => {
    const body = req.body || {};
    const key = clean(body.key, 100);
    const quantity = body.quantity;
    const method = body.method;

    const customer = {
        name: clean(body.customer?.name, 100),
        email: clean(body.customer?.email, 254),
        phone: clean(body.customer?.phone, 30),
        idType: clean(body.customer?.idType, 30) || 'none',
        idNumber: clean(body.customer?.idNumber, 40) || '',
        aadhaar: clean(body.customer?.aadhaar, 30) || '',
        pan: clean(body.customer?.pan, 20) || '',
        ticketType: clean(body.customer?.ticketType, 40) || 'Standard',
        promoCode: clean(body.customer?.promoCode, 30) || '',
        companyName: clean(body.customer?.companyName, 100) || '',
    };

    const allowedMethods = ['upi', 'card', 'netbanking', 'aadhaar_pay', 'pan_checkout', 'aeps'];
    if (
        !key ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 10 ||
        !allowedMethods.includes(method) ||
        !customer.name ||
        !emailValid(customer.email) ||
        !phoneValid(customer.phone)
    ) {
        return res.status(400).json({ error: 'Check your ticket quantity and attendee details.' });
    }

    req.validatedBooking = {
        key,
        eventId: String(body.eventId),
        quantity,
        method,
        customer,
    };
    next();
};

const validateContact = (req, res, next) => {
    const body = req.body || {};
    const name = clean(body.name, 100);
    const email = clean(body.email, 254);
    const topic = clean(body.topic, 120);
    const message = clean(body.message, 3000);

    if (!name || !emailValid(email) || !topic || message.length < 10) {
        return res.status(400).json({
            error: 'Enter your name, valid email, topic and a message of at least 10 characters.'
        });
    }

    req.validatedContact = { name, email, topic, message };
    next();
};

module.exports = {
    validateRegister,
    validateLogin,
    validateEvent,
    validateBooking,
    validateContact,
};
