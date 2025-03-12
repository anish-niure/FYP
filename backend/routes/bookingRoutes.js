const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};

// Salon hours (for validation)
const salonHours = {
    'Monday': { start: 9, end: 19 }, // 9 AM - 7 PM
    'Tuesday': { start: 9, end: 19 },
    'Wednesday': { start: 9, end: 19 },
    'Thursday': { start: 9, end: 19 },
    'Friday': { start: 9, end: 19 },
    'Saturday': { start: 10, end: 17 }, // 10 AM - 5 PM
    'Sunday': { start: null, end: null }, // Closed
};

// Generate 1-hour slots
const generateSlots = (date) => {
    const dayName = date.toLocaleString('en-US', { weekday: 'long' });
    const { start, end } = salonHours[dayName];
    if (!start) return []; // Closed on Sundays

    const slots = [];
    for (let hour = start; hour < end; hour++) {
        const time = `${hour.toString().padStart(2, '0')}:00`;
        slots.push(time);
    }
    return slots;
};

// GET available slots for a date
router.get('/availability', verifyToken, async (req, res) => {
    const { date } = req.query; // e.g., "2025-03-15"
    if (!date) return res.status(400).json({ message: 'Date is required.' });

    const selectedDate = new Date(date);
    const allSlots = generateSlots(selectedDate);

    // Fetch bookings for the date
    const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));
    const bookings = await Booking.find({
        dateTime: { $gte: startOfDay, $lte: endOfDay },
    });

    // Filter out booked slots (considering stylist availability)
    const bookedSlotsByStylist = {};
    bookings.forEach((booking) => {
        const time = booking.dateTime.toTimeString().slice(0, 5); // e.g., "14:00"
        if (!bookedSlotsByStylist[booking.stylist]) {
            bookedSlotsByStylist[booking.stylist] = [];
        }
        bookedSlotsByStylist[booking.stylist].push(time);
    });

    res.json({ allSlots, bookedSlotsByStylist });
});

// POST create a booking
router.post('/', verifyToken, async (req, res) => {
    const { service, stylist, locationType, dateTime } = req.body;

    if (!service || !stylist || !locationType || !dateTime) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    const bookingDateTime = new Date(dateTime);
    const dayName = bookingDateTime.toLocaleString('en-US', { weekday: 'long' });
    const hour = bookingDateTime.getHours();

    // Validate salon hours (skip for Home Service)
    if (locationType === 'Salon') {
        const { start, end } = salonHours[dayName];
        if (!start || hour < start || hour >= end) {
            return res.status(400).json({ message: 'Selected time is outside salon hours.' });
        }
    }

    // Check for existing booking
    const existingBooking = await Booking.findOne({
        stylist,
        dateTime: bookingDateTime,
    });
    if (existingBooking) {
        return res.status(400).json({ message: 'This slot is already booked.' });
    }

    const booking = new Booking({
        userId: req.user.id,
        service,
        stylist,
        locationType,
        dateTime: bookingDateTime,
    });

    await booking.save();
    res.status(201).json({ message: 'Booking created successfully!', booking });
});

// GET user's booking history
router.get('/user', verifyToken, async (req, res) => {
    const bookings = await Booking.find({ userId: req.user.id }).sort({ dateTime: -1 });
    res.json(bookings);
});

module.exports = router;