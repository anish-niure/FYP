// server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const cloudinary = require('cloudinary').v2; // Added for Cloudinary

const app = express();
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// CORS configuration
const allowedOrigins = ['http://localhost:3000'];
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Added for multipart/form-data

// Root route
app.get('/', (req, res) => {
    res.send('Server is running with updated CORS settings');
});

// Import and mount routes with debug
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const stylistRoutes = require('./routes/stylistRoutes');
const adminRoutes = require('./routes/adminRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const productRoutes = require('./routes/productRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

console.log('Loaded routes:', {
    auth: authRoutes.stack.length > 0,
    bookings: bookingRoutes.stack.length > 0,
    users: userRoutes.stack.length > 0,
    stylists: stylistRoutes.stack.length > 0,
    admin: adminRoutes.stack.length > 0,
    services: serviceRoutes.stack.length > 0,
    products: productRoutes.stack.length > 0
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/user', userRoutes); // Fixed mounting path
app.use('/api/stylists', stylistRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/products', productRoutes);

// Debug middleware to log incoming requests
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});

// Connect to MongoDB
connectDB();

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));