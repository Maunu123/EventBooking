const { isAllowedOrigin } = require('../utils');

const requestLimits = new Map();

const originMiddleware = (req, res, next) => {
    if (req.method === 'GET') return next();

    const allowedOrigin = process.env.APP_ORIGIN || 'http://localhost:5173';
    if (!isAllowedOrigin(req, allowedOrigin)) {
        return res.status(403).json({ error: 'Request origin is not allowed.' });
    }

    const now = Date.now();
    for (const [key, item] of requestLimits) {
        if (item.until < now) requestLimits.delete(key);
    }

    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const limit = requestLimits.get(ip) || { count: 0, until: now + 60000 };
    requestLimits.set(ip, limit);

    if (++limit.count > 30) {
        return res.status(429).json({ error: 'Too many requests. Please wait a minute.' });
    }

    next();
};

module.exports = { originMiddleware };
