const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { verifyAdmin } = require('../middleware/authMiddleware');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary (this should match your server.js config)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET all products (public)
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching products' });
    }
});

// POST a new product (admin only)
router.post('/', verifyAdmin, async (req, res) => {
    try {
        const { name, description, price } = req.body;

        // Validate required fields
        if (!name || !description || price === undefined) {
            return res.status(400).json({ message: 'Fields (name, description, price) are required' });
        }

        let imageUrl = '';

        // Check if image file exists in the request
        if (req.files && req.files.image) {
            const file = req.files.image;
            
            // Upload to Cloudinary
            const result = await cloudinary.uploader.upload(file.tempFilePath);
            imageUrl = result.secure_url;
            
            // Clean up the temp file
            fs.unlinkSync(file.tempFilePath);
        }

        // Create and save the product
        const product = new Product({
            name,
            description,
            price: Number(price),
            imageUrl
        });

        await product.save();
        res.status(201).json({ message: 'Product created successfully', product });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Server error while creating product' });
    }
});

// PUT update a product (admin only)
router.put('/:id', verifyAdmin, async (req, res) => {
    try {
        const { name, description, price } = req.body;
        const updateData = { name, description, price: Number(price) };

        // If a new image is uploaded, update imageUrl
        if (req.files && req.files.image) {
            const file = req.files.image;
            
            // Upload to Cloudinary
            const result = await cloudinary.uploader.upload(file.tempFilePath);
            updateData.imageUrl = result.secure_url;
            
            // Clean up the temp file
            fs.unlinkSync(file.tempFilePath);
        }

        // Update the product with the new data
        const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Product updated successfully', product });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Server error while updating product' });
    }
});

// DELETE a product (admin only)
router.delete('/:id', verifyAdmin, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error while deleting product' });
    }
});

module.exports = router;