// Import required core modules
const express = require('express');
const connectDB = require('./config/db');
require('dotenv').config(); // Loads environment variables from a .env file into process.env

// --- INITIALIZE APP ---
const app = express();

// --- CONNECT TO DATABASE ---
// Establish the connection to MongoDB using the function from our config file.
// The application will exit if the connection fails.
connectDB();

// --- INITIALIZE MIDDLEWARE ---
// This is a crucial piece of Express middleware. It parses incoming requests with JSON payloads.
// Without this, `req.body` would be undefined in your controllers when clients send JSON data.
app.use(express.json({ extended: false }));


// --- DEFINE API ROUTES ---
// We organize our routes into separate files for better maintainability.
// Here, we tell our Express app to use those router files for specific base paths.

// A simple root endpoint to confirm the API is running.
// Accessible at http://localhost:3000/
app.get('/', (req, res) => res.send('EV Charging API is running successfully!'));

// All routes related to user authentication (register, login) will be prefixed with /api/auth
// e.g., POST /api/auth/register
app.use('/api/auth', require('./routes/auth'));

// All routes for managing charging stations (list, details, seed, recommendations, etc.)
// e.g., GET /api/stations, POST /api/stations/seed
app.use('/api/stations', require('./routes/stations'));

// All routes for handling bookings (create, cancel, complete)
// e.g., POST /api/bookings
app.use('/api/bookings', require('./routes/bookings'));

// Routes specific to user data, like retrieving their own bookings
// e.g., GET /api/users/me/bookings
app.use('/api/users', require('./routes/users'));

// Routes for handling user reviews
// e.g., POST /api/reviews
app.use('/api/reviews', require('./routes/reviews'));


// --- START THE SERVER ---
// Get the port from environment variables, or default to 3000 if not specified.
const PORT = process.env.PORT || 3000;

// Start the server and listen for connections on the specified port.
// A confirmation message is logged to the console once the server is up and running.
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));