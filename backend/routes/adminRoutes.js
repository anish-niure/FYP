const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Notification = require('../models/Notification');
const bcrypt = require('bcrypt');
const { authenticate, authorize, verifyAdmin, verifyToken, adminCheck } = require('../middleware/authMiddleware');

// Debug route to confirm the base path is working
router.get('/test', (req, res) => {
    res.status(200).json({ message: 'Admin routes are working' });
});

// GET all stylists
router.get('/stylists', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const stylists = await User.find({ role: 'stylist' }).select('username email');
        res.json(stylists);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch stylists.' });
    }
});

// POST create a new stylist
router.post('/create-stylist', authenticate, authorize(['admin']), async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            username,
            email,
            password: hashedPassword,
            role: 'stylist',
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        await user.save();
        res.status(201).json({
            message: 'Stylist created successfully!',
            user: { id: user._id, username: user.username, email: user.email, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error during stylist creation.' });
    }
});

// Get admin notifications
router.get('/notifications', verifyAdmin, async (req, res) => {
    try {
        const notifications = await Notification.find({ 
            role: 'admin'  // Only get notifications specifically for admin role
        })
        .sort({ date: -1 })
        .limit(20);
        
        res.json(notifications);
    } catch (error) {
        console.error('Error fetching admin notifications:', error);
        res.status(500).json({ message: 'Failed to fetch notifications.' });
    }
});

// Mark admin notifications as read
router.put('/notifications/read', verifyToken, async (req, res) => {
    try {
        // Verify the user is an admin first
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }
        
        await Notification.updateMany(
            { role: 'admin', read: false },
            { $set: { read: true } }
        );
        
        res.status(200).json({ message: 'Notifications marked as read' });
    } catch (error) {
        console.error('Error marking notifications as read:', error);
        res.status(500).json({ message: 'Failed to mark notifications as read.' });
    }
});

module.exports = router;