const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

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

// Update user profile (name and profile picture)
router.post('/update', verifyToken, async (req, res) => {
    const { username, profilePicture } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found.' });

        if (username) user.username = username;
        if (profilePicture) user.profilePicture = profilePicture; // In production, handle file upload with Multer

        await user.save();
        res.json({ message: 'Profile updated successfully!', user });
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

module.exports = router;