const allowedOrigins = require('./allowedOrigins');

const corsOptions = {
    origin: (origin, callback) => {
        // In development, allow all origins (you can change this as needed)
        if (process.env.NODE_ENV === 'development') {
            callback(null, true);  // Allow all origins in development
        } else if (allowedOrigins.includes(origin) || !origin) {
            // Allow requests from allowed origins or requests with no origin (like Postman or mobile apps)
            callback(null, true);
        } else {
            // Log blocked origins for debugging
            console.error(`Blocked by CORS: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,          // Allow credentials (cookies, headers)
    optionsSuccessStatus: 200,  // For legacy browsers that choke on 204
    allowedHeaders: ['Content-Type', 'Authorization'], // Ensure the headers you want are allowed
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow specific HTTP methods
};

// Export the CORS configuration
module.exports = corsOptions;
