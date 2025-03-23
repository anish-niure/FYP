const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const { verifyAdmin } = require('../middleware/authMiddleware');

// GET all stylists
router.get('/stylists', verifyAdmin, async (req, res) => {
    try {
        const stylists = await User.find({ role: 'stylist' }).select('username email');
        res.json(stylists);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch stylists.' });
    }
});

// POST create a new stylist
router.post('/create-stylist', verifyAdmin, async (req, res) => {
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