const express = require('express');

// Routes
const authRoutes = require('./src/routes/authRoutes');
const eventRoutes = require('./src/routes/eventRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');
const contactRoutes = require('./src/routes/contactRoutes');

// Middlewares
const { originMiddleware } = require('./src/middlewares/originMiddleware');
const { errorHandler } = require('./src/middlewares/errorHandler');

const app = express();

// Middlewares
app.use(express.json());
app.use('/api', originMiddleware);

// Base Routes
app.get('/', (req, res) => {
    res.json({ message: 'EventBook API is running' });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', database: 'connected' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', eventRoutes);
app.use('/api', bookingRoutes);
app.use('/api', contactRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found.' });
});

// Error Handler
app.use(errorHandler);

module.exports = app;
