const { createHash } = require('node:crypto');
const User = require('../models/userModel');
const Session = require('../models/sessionModel');

const digest = (value) => createHash('sha256').update(value).digest('hex');

const getCookieToken = (req) => {
    const cookies = req.headers.cookie || '';
    const sessionCookie = cookies
        .split(';')
        .map((c) => c.trim())
        .find((c) => c.startsWith('eventbook_session='));
    return sessionCookie ? sessionCookie.slice(18) : '';
};

// Middleware: Authenticates user by session cookie
const authenticateUser = async (req, res, next) => {
    try {
        const token = getCookieToken(req);
        if (!token) {
            return res.status(401).json({ error: 'Please log in to continue.' });
        }

        const tokenHash = digest(token);
        const session = await Session.findOne({ token: tokenHash, expires: { $gt: Date.now() } });
        if (!session) {
            return res.status(401).json({ error: 'Please log in to continue.' });
        }

        const user = await User.findOne({ id: session.userId }).select('-password -salt');
        if (!user) {
            return res.status(401).json({ error: 'Please log in to continue.' });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Please log in to continue.' });
    }
};

// Middleware: Ensures user is an Event Organizer
const requireOrganizer = (req, res, next) => {
    if (!req.user || req.user.role !== 'organizer') {
        return res.status(403).json({ error: 'Organizer access required.' });
    }
    next();
};

module.exports = {
    authenticateUser,
    requireOrganizer,
    getCookieToken,
    digest,
};
