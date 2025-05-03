const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const { authenticate, authorize } = require('../middleware/authMiddleware');

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

module.exports = router;