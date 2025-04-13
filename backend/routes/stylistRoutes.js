const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Stylist = require('../models/Stylist');
const bcrypt = require('bcryptjs');
const { verifyAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// Configure Multer for file uploads (memory storage for Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Get all stylists (admin only)
router.get('/', verifyAdmin, async (req, res) => {
    console.log('GET /api/stylists hit');
    try {
        const stylists = await Stylist.find();
        res.json(stylists);
    } catch (error) {
        console.error('Error fetching stylists:', error);
        res.status(500).json({ message: 'Server error while fetching stylists' });
    }
});

// Create a new stylist (admin only)
router.post('/create', verifyAdmin, upload.single('image'), async (req, res) => {
    console.log('POST /api/stylists/create hit');
    const { username, email, password } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields (username, email, password) are required' });
    }

    try {
        // Check for existing user/stylist
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const existingStylist = await Stylist.findOne({ email });
        if (existingStylist) {
            return res.status(400).json({ message: 'Stylist with this email already exists' });
        }

        const existingUsername = await Stylist.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ message: 'Username is already taken' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Upload image to Cloudinary if provided
        let imageUrl = 'https://via.placeholder.com/150'; // Default image
        if (req.file) {
            const result = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { resource_type: 'auto' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                ).end(req.file.buffer);
            });
            imageUrl = result.secure_url;
        }

        // Create new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role: 'stylist',
        });
        await newUser.save();

        // Create new stylist
        const newStylist = new Stylist({
            username,
            email,
            userId: newUser._id,
            imageUrl,
        });
        await newStylist.save();

        res.status(201).json({ message: 'Stylist created successfully' });
    } catch (error) {
        console.error('Error creating stylist:', error);
        res.status(500).json({ message: 'Server error while creating stylist' });
    }
});

// Update a stylist (admin only)
router.put('/:id', verifyAdmin, upload.single('image'), async (req, res) => {
    console.log(`PUT /api/stylists/${req.params.id} hit`);
    try {
        const { username, email } = req.body;

        // Validate required fields
        if (!username || !email) {
            return res.status(400).json({ message: 'Username and email are required' });
        }

        const stylist = await Stylist.findById(req.params.id);
        if (!stylist) {
            return res.status(404).json({ message: 'Stylist not found' });
        }

        const user = await User.findById(stylist.userId);
        if (!user) {
            return res.status(404).json({ message: 'Associated user not found' });
        }

        // Check for email conflicts
        if (email && email !== stylist.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Email is already taken' });
            }
            const existingStylist = await Stylist.findOne({ email });
            if (existingStylist && existingStylist._id.toString() !== stylist._id.toString()) {
                return res.status(400).json({ message: 'Email is already taken by another stylist' });
            }
        }

        // Check for username conflicts
        if (username && username !== stylist.username) {
            const existingUsername = await Stylist.findOne({ username });
            if (existingUsername && existingUsername._id.toString() !== stylist._id.toString()) {
                return res.status(400).json({ message: 'Username is already taken' });
            }
        }

        // Update image if provided
        if (req.file) {
            const result = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { resource_type: 'auto' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                ).end(req.file.buffer);
            });
            stylist.imageUrl = result.secure_url;
        }

        // Update stylist and user
        stylist.username = username;
        stylist.email = email;
        await stylist.save();

        if (email !== user.email) {
            user.email = email;
            user.username = username;
            await user.save();
        }

        res.json({ message: 'Stylist updated successfully' });
    } catch (error) {
        console.error('Error updating stylist:', error);
        res.status(500).json({ message: 'Server error while updating stylist' });
    }
});

// Delete a stylist (admin only)
router.delete('/:id', verifyAdmin, async (req, res) => {
    console.log(`DELETE /api/stylists/${req.params.id} hit`);
    try {
        const stylist = await Stylist.findById(req.params.id);
        if (!stylist) {
            return res.status(404).json({ message: 'Stylist not found' });
        }

        const user = await User.findById(stylist.userId);
        if (!user) {
            return res.status(404).json({ message: 'Associated user not found' });
        }

        await Stylist.findByIdAndDelete(req.params.id);
        await User.findByIdAndDelete(stylist.userId);

        res.json({ message: 'Stylist deleted successfully' });
    } catch (error) {
        console.error('Error deleting stylist:', error);
        res.status(500).json({ message: 'Server error while deleting stylist' });
    }
});

// Reset stylist password (admin only)
router.put('/:id/reset-password', verifyAdmin, async (req, res) => {
    console.log(`PUT /api/stylists/${req.params.id}/reset-password hit`);
    try {
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }

        const stylist = await Stylist.findById(req.params.id);
        if (!stylist) {
            return res.status(404).json({ message: 'Stylist not found' });
        }

        const user = await User.findById(stylist.userId);
        if (!user) {
            return res.status(404).json({ message: 'Associated user not found' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        await user.save();

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'Server error while resetting password' });
    }
});

module.exports = router;