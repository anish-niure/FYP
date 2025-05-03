const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');
const Notification = require('../models/Notification'); // Import the Notification model
const { authenticate } = require('../middleware/authMiddleware');

// Salon hours
const salonHours = {
    'Monday': { start: 9, end: 19 },
    'Tuesday': { start: 9, end: 19 },
    'Wednesday': { start: 9, end: 19 },
    'Thursday': { start: 9, end: 19 },
    'Friday': { start: 9, end: 19 },
    'Saturday': { start: 10, end: 17 },
    'Sunday': { start: null, end: null },
};

// Generate 1-hour slots
const generateSlots = (date) => {
    const dayName = date.toLocaleString('en-US', { weekday: 'long' });
    const { start, end } = salonHours[dayName];
    if (!start) return [];

    const slots = [];
    for (let hour = start; hour < end; hour++) {
        const time = `${hour.toString().padStart(2, '0')}:00`;
        slots.push(time);
    }
    return slots;
};

// GET all services (public)
router.get('/services', async (req, res) => {
    try {
        const services = await Service.find();
        res.json(services);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch services.' });
    }
});

// GET all stylists (public)
router.get('/stylists', async (req, res) => {
    try {
        // Use the Stylist model instead of User model
        const Stylist = require('../models/Stylist');
        
        // Fetch stylists with their secondary roles
        const stylists = await Stylist.find()
            .populate('userId', 'username email profilePicture');
        
        // Transform the data to match the expected format in the frontend
        const formattedStylists = stylists.map(stylist => ({
            _id: stylist.userId._id, // Use the user ID as the stylist ID for booking
            username: stylist.username || stylist.userId.username,
            email: stylist.email || stylist.userId.email,
            profilePicture: stylist.userId.profilePicture || stylist.imageUrl,
            secondaryRole: stylist.secondaryRole,
            description: stylist.description
        }));
        
        res.json(formattedStylists);
    } catch (err) {
        console.error('Error fetching stylists:', err);
        res.status(500).json({ message: 'Failed to fetch stylists.' });
    }
});

// GET stylists by service category (debugging route)
router.get('/stylists-by-category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const stylists = await User.find({ 
            role: 'stylist',
            secondaryRole: category
        }).select('username email secondaryRole profilePicture');
        
        console.log(`Found ${stylists.length} stylists with secondaryRole "${category}"`);
        res.json(stylists);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch stylists by category.' });
    }
});

// GET available slots for a date
router.get('/availability', authenticate, async (req, res) => {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'Date is required.' });

    try {
        const selectedDate = new Date(date);
        const slots = generateSlots(selectedDate);
        const bookings = await Booking.find({
            dateTime: {
                $gte: new Date(selectedDate.setHours(0, 0, 0, 0)),
                $lt: new Date(selectedDate.setHours(23, 59, 59, 999)),
            },
        });

        const bookedSlots = bookings.map(b => b.dateTime.toTimeString().slice(0, 5));
        const availableSlots = slots.filter(slot => !bookedSlots.includes(slot));
        res.json(availableSlots);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch availability.' });
    }
});

// POST create a booking
router.post('/', authenticate, async (req, res) => {
    const { services, stylist, locationType, dateTime, duration } = req.body;

    if (!services || services.length === 0 || !stylist || !locationType || !dateTime) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // Create a booking with multiple services
        const booking = new Booking({
            userId: req.user.id,
            services, // Array of service IDs
            stylist,
            locationType,
            dateTime: new Date(dateTime),
            duration: duration || services.length * 45, // Default to 45 min per service
        });
        await booking.save();

        // Get details for notifications
        const serviceDetails = await Promise.all(
            services.map(serviceId => Service.findById(serviceId))
        );
        
        const serviceNames = serviceDetails.map(service => service.name).join(', ');
        const stylistDetails = await User.findById(stylist);
        const userDetails = await User.findById(req.user.id);

        // Create notification for user
        const userNotification = new Notification({
            userId: req.user.id,
            message: `You booked ${serviceNames} with ${stylistDetails.username} on ${new Date(dateTime).toLocaleString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric'
            })}.`,
            date: new Date(),
            type: 'booking'
        });
        await userNotification.save();
        
        // Create notification for admin
        const adminNotification = new Notification({
            role: 'admin',
            message: `${userDetails.username} booked ${serviceNames} with ${stylistDetails.username} on ${new Date(dateTime).toLocaleString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric'
            })} at ${locationType}.`,
            date: new Date(),
            type: 'booking',
            link: '/admin/appointments'
        });
        await adminNotification.save();

        res.status(201).json({ message: 'Booking created successfully!', booking });
    } catch (err) {
        console.error('Error creating booking:', err);
        res.status(500).json({ message: 'Failed to create booking.' });
    }
});

// GET user's booking history
router.get('/user', authenticate, async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user.id })
            .populate('services') // Populate services details
            .populate('stylist', 'username email profilePicture') // Populate stylist details
            .sort({ dateTime: 1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch booking history.' });
    }
});

// GET bookings for the logged-in stylist
router.get('/stylist', authenticate, async (req, res) => {
    try {
        const bookings = await Booking.find({ stylist: req.user.id })
            .populate('userId', 'username email')
            .sort({ dateTime: 1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: 'Server error fetching stylist bookings.' });
    }
});

// GET all bookings (Admin access)
router.get('/', authenticate, async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('userId', 'username email')
            .populate('stylist', 'username email'); // Ensure stylist details are populated
        res.json(bookings);
    } catch (err) {
        console.error('Error fetching bookings:', err);
        res.status(500).json({ message: 'Failed to fetch bookings.' });
    }
});

// PUT approve a booking
router.put('/:id/approve', authenticate, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found.' });
        if (booking.stylist !== req.user.id) {
            return res.status(403).json({ message: 'You can only approve your own bookings.' });
        }
        if (booking.status !== 'Pending') {
            return res.status(400).json({ message: 'Only pending bookings can be approved.' });
        }

        booking.status = 'Confirmed';
        await booking.save();
        res.json({ message: 'Booking approved successfully!', booking });
    } catch (err) {
        res.status(500).json({ message: 'Server error approving booking.' });
    }
});

// PUT update a booking
router.put('/:id', authenticate, async (req, res) => {
    const { status, dateTime, locationType, stylist } = req.body;

    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found.' });
        }

        booking.status = status || booking.status;
        booking.dateTime = dateTime ? new Date(dateTime) : booking.dateTime;
        booking.locationType = locationType || booking.locationType;
        booking.stylist = stylist || booking.stylist;

        await booking.save();
        res.json(booking);
    } catch (err) {
        console.error('Error updating booking:', err);
        res.status(500).json({ message: 'Failed to update booking.' });
    }
});

// DELETE a booking
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found.' });
        }
        res.json({ message: 'Booking deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete booking.' });
    }
});

module.exports = router;