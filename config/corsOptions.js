const allowedOrigins = require('./allowedOrigins');

const corsOptions = {
    origin: (origin, callback) => {
        if (process.env.NODE_ENV === 'development') {
            // Allow all origins during development for easy testing
            callback(null, true);
        } else if (allowedOrigins.includes(origin) || !origin) {
            // Allow requests from allowed origins or requests with no origin (e.g., Postman)
            callback(null, true);
        } else {
            // Block requests from disallowed origins and log them
            console.error(`Blocked by CORS: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,          // Allow cookies and credentials to be sent
    optionsSuccessStatus: 200,  // Respond with status 200 for preflight requests
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
    ],                           // Allow headers required by the frontend
    methods: [
        'GET',
        'POST',
        'PUT',
        'DELETE',
        'OPTIONS',
    ],                           // Support common HTTP methods
};

module.exports = corsOptions;
