const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Service = require('../models/Service');
const { verifyAdmin } = require('../middleware/authMiddleware');

// Set up multer for image uploads (local storage)
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ 
    storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only images (jpeg, jpg, png) are allowed!'));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

// GET all services (public)
router.get('/', async (req, res) => {
    console.log('GET /api/services hit');
    try {
        const services = await Service.find();
        res.json(services);
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ message: 'Server error while fetching services' });
    }
});

// POST a new service (admin only)
router.post('/', verifyAdmin, upload.single('image'), async (req, res) => {
    console.log('POST /api/services hit');
    try {
        // Validate required fields
        const { name, description, priceRange } = req.body;
        if (!name || !description || !priceRange || !req.file) {
            return res.status(400).json({ message: 'All fields (name, description, priceRange, image) are required' });
        }

        const imageUrl = `/uploads/${req.file.filename}`;
        const service = new Service({
            name,
            description,
            priceRange,
            imageUrl,
        });
        await service.save();
        res.status(201).json({ message: 'Service created successfully', service });
    } catch (error) {
        console.error('Error creating service:', error);
        res.status(500).json({ message: 'Server error while creating service' });
    }
});

// PUT update a service (admin only)
router.put('/:id', verifyAdmin, upload.single('image'), async (req, res) => {
    console.log(`PUT /api/services/${req.params.id} hit`);
    try {
        const { name, description, priceRange } = req.body;
        const updateData = { 
            name, 
            description, 
            priceRange, 
            updatedAt: Date.now() 
        };

        // If a new image is uploaded, update the imageUrl
        if (req.file) {
            updateData.imageUrl = `/uploads/${req.file.filename}`;
        }

        const service = await Service.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        res.json({ message: 'Service updated successfully', service });
    } catch (error) {
        console.error('Error updating service:', error);
        res.status(500).json({ message: 'Server error while updating service' });
    }
});

// DELETE a service (admin only)
router.delete('/:id', verifyAdmin, async (req, res) => {
    console.log(`DELETE /api/services/${req.params.id} hit`);
    try {
        const service = await Service.findByIdAndDelete(req.params.id);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        res.json({ message: 'Service deleted successfully' });
    } catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({ message: 'Server error while deleting service' });
    }
});

module.exports = router;