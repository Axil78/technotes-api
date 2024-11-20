require('dotenv').config();
require('express-async-errors');
const express = require('express');
const app = express();
const path = require('path');
const { logger, logEvents } = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const connectDB = require('./config/dbConn');
const mongoose = require('mongoose');
const PORT = process.env.PORT || 3500;

// Display current environment
console.log(`Environment: ${process.env.NODE_ENV}`);

// Connect to MongoDB
connectDB().catch(err => {
    console.error("Database connection failed:", err);
    process.exit(1);  // Exit if DB connection fails
});

// Middleware setup
app.use(logger);

// Debug CORS (only log in development)
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log('Request Origin:', req.headers.origin); // Log request origin
        next();
    });
}

// Enable CORS with options
app.use(cors());

// Parse incoming JSON and cookies
app.use(express.json());
app.use(cookieParser());

// Serve static files (adjust the static folder if needed)
app.use('/', express.static(path.join(__dirname, 'public')));

// Route handlers
app.use('/', require('./routes/root'));
app.use('/auth', require('./routes/authRoutes'));
app.use('/users', require('./routes/userRoutes'));
app.use('/notes', require('./routes/noteRoutes'));

// 404 handler for unmatched routes
app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({ message: '404 Not Found' });
    } else {
        res.type('txt').send('404 Not Found');
    }
});

// Custom error handler middleware
app.use(errorHandler);

// MongoDB connection events
mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running at port ${PORT}`));
});

mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
    logEvents(
        `${err.message || err}\t${err.code || ''}\t${err.syscall || ''}\t${err.hostname || ''}`,
        'mongoErrorLog.log'
    );
});
