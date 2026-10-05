const app = require('./app');
const { connectDB } = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Start Express Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
