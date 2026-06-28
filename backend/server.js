const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./db');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// CORS Middleware config
app.use(cors({
  origin: true, // Allow all origins for easier local development debugging
  credentials: true
}));

// Body parsing middlewares
app.use(express.json());
app.use(cookieParser());

// Mount API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/bookings', require('./routes/bookings'));

// Health check endpoint
app.get('/api/status', (req, res) => {
  res.status(200).json({ success: true, message: 'Hotel Booking API is active.' });
});

// Base Route
app.get('/', (req, res) => {
  res.send('Welcome to the Hotel Room Booking System Server API');
});

// Start listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server successfully started on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
});
