const { randomBytes, scryptSync, timingSafeEqual } = require('node:crypto');
const User = require('../models/userModel');
const Session = require('../models/sessionModel');
const { getCookieToken, digest } = require('../middlewares/authMiddleware');

const sessionCookie = (token, age) =>
    `eventbook_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${age}${
        process.env.NODE_ENV === 'production' ? '; Secure' : ''
    }`;

// Register a new user
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.validatedBody;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'An account with this email already exists.' });
        }

        const salt = randomBytes(16).toString('hex');
        const hashedPassword = scryptSync(password, salt, 64).toString('hex');
        const userId = Date.now() + Math.floor(Math.random() * 1000);

        const newUser = await User.create({
            id: userId,
            name,
            email,
            password: hashedPassword,
            salt,
            role,
        });

        // Create login session
        const token = randomBytes(32).toString('hex');
        const tokenHash = digest(token);
        const expires = Date.now() + 7 * 24 * 60 * 60 * 1000;

        await Session.create({
            token: tokenHash,
            userId: newUser.id,
            expires,
        });

        res.setHeader('Set-Cookie', sessionCookie(token, 7 * 24 * 60 * 60));
        res.status(201).json({
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
            },
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ error: 'An account with this email already exists.' });
        }
        res.status(500).json({ error: 'Authentication service unavailable.' });
    }
};

// Login user
const login = async (req, res) => {
    try {
        const { email, password, role: selectedRole } = req.validatedBody;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const hashed = scryptSync(password, user.salt, 64).toString('hex');
        if (!timingSafeEqual(Buffer.from(hashed, 'hex'), Buffer.from(user.password, 'hex'))) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // Strict role validation: User must log in with their registered role
        const userRole = user.role || 'buyer';
        if (userRole !== selectedRole) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // Create login session
        const token = randomBytes(32).toString('hex');
        const tokenHash = digest(token);
        const expires = Date.now() + 7 * 24 * 60 * 60 * 1000;

        await Session.create({
            token: tokenHash,
            userId: user.id,
            expires,
        });

        res.setHeader('Set-Cookie', sessionCookie(token, 7 * 24 * 60 * 60));
        res.status(200).json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: userRole,
            },
        });
    } catch (err) {
        res.status(500).json({ error: 'Authentication service unavailable.' });
    }
};

// Get currently authenticated user
const getMe = async (req, res) => {
    try {
        const token = getCookieToken(req);
        if (!token) {
            return res.status(200).json({ user: null });
        }

        const tokenHash = digest(token);
        const session = await Session.findOne({ token: tokenHash, expires: { $gt: Date.now() } });
        if (!session) {
            return res.status(200).json({ user: null });
        }

        const user = await User.findOne({ id: session.userId }).select('-password -salt');
        if (!user) {
            return res.status(200).json({ user: null });
        }

        res.status(200).json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role || 'buyer',
            },
        });
    } catch (err) {
        res.status(200).json({ user: null });
    }
};

// Logout user
const logout = async (req, res) => {
    try {
        const token = getCookieToken(req);
        if (token) {
            const tokenHash = digest(token);
            await Session.deleteOne({ token: tokenHash }).catch(() => {});
        }
        res.setHeader('Set-Cookie', sessionCookie('', 0));
        res.status(200).json({ user: null });
    } catch (err) {
        res.status(200).json({ user: null });
    }
};

module.exports = {
    register,
    login,
    getMe,
    logout,
};
