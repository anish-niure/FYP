const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const cloudinary = require('cloudinary').v2;
const connectDB = require('./config/db');
const storeRoutes = require('./routes/storeRoutes');
const path = require('path');
const fs = require('fs');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes'); // Added adminRoutes require statement

// Ensure this is near the top of your file, before any code tries to access env variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Check if critical env variables are loaded (add this after dotenv config)
console.log('Email credentials loaded:', {
  username: process.env.EMAIL_USERNAME ? '✅ Present' : '❌ Missing',
  password: process.env.EMAIL_PASSWORD ? '✅ Present' : '❌ Missing',
});

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
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Fixed typo: '-delete' → 'DELETE'
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create temp directory if it doesn't exist
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// Update fileUpload middleware
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: tempDir,
  limits: { fileSize: 5 * 1024 * 1024 }
}));

// Root route
app.get('/', (req, res) => {
  res.send('Server is running with updated CORS settings and Cloudinary integration');
});

// Import and mount routes with debug
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const stylistRoutes = require('./routes/stylistRoutes');
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
  products: productRoutes.stack.length > 0,
  orders: orderRoutes.stack.length > 0,
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/user', userRoutes);
app.use('/api/stylists', stylistRoutes);
app.use('/api/admin', adminRoutes); // Added adminRoutes mount statement
app.use('/api/services', serviceRoutes);
app.use('/api/products', productRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/orders', orderRoutes);

// Debug middleware to log incoming requests
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Connect to MongoDB
connectDB();

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));