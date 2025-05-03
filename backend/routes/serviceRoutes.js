const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const Service = require('../models/Service');
const { verifyAdmin } = require('../middleware/authMiddleware');
const fs = require('fs');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
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
router.post('/', verifyAdmin, async (req, res) => {
    console.log('POST /api/services hit');
    try {
        const { name, description, priceRange } = req.body;

        // Validate required fields
        if (!name || !description || !priceRange) {
            return res.status(400).json({ message: 'All fields (name, description, priceRange) are required' });
        }

        let imageUrl = 'https://via.placeholder.com/150'; // Default image if none provided

        // Check if image file exists in the request
        if (req.files && req.files.image) {
            const file = req.files.image;
            
            // Upload to Cloudinary
            const result = await cloudinary.uploader.upload(file.tempFilePath);
            imageUrl = result.secure_url;
            
            // Clean up the temp file
            fs.unlinkSync(file.tempFilePath);
        }

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
router.put('/:id', verifyAdmin, async (req, res) => {
    console.log(`PUT /api/services/${req.params.id} hit`);
    try {
        const { name, description, priceRange } = req.body;

        // Validate required fields
        if (!name || !description || !priceRange) {
            return res.status(400).json({ message: 'All fields (name, description, priceRange) are required' });
        }

        const updateData = {
            name,
            description,
            priceRange,
            updatedAt: Date.now(),
        };

        // If a new image is uploaded, update the imageUrl
        if (req.files && req.files.image) {
            const file = req.files.image;
            
            // Upload to Cloudinary
            const result = await cloudinary.uploader.upload(file.tempFilePath);
            updateData.imageUrl = result.secure_url;
            
            // Clean up the temp file
            fs.unlinkSync(file.tempFilePath);
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