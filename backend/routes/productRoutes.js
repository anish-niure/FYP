const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { verifyAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory to store uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// GET all products (public)
router.get('/', async (req, res) => {
    console.log('GET /api/products hit');
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Server error while fetching products' });
    }
});

// POST a new product (admin only)
router.post('/', verifyAdmin, upload.single('image'), async (req, res) => {
    console.log('POST /api/products hit');
    try {
        const { name, description, price } = req.body;

        // Validate required fields
        if (!name || !description || price === undefined) {
            return res.status(400).json({ message: 'Fields (name, description, price) are required' });
        }

        const imageUrl = req.file ? `/uploads/${req.file.filename}` : ''; // Save image URL if uploaded
        const product = new Product({
            name,
            description,
            price,
            imageUrl,
        });

        await product.save();
        res.status(201).json({ message: 'Product created successfully', product });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Server error while creating product' });
    }
});

// PUT update a product (admin only)
router.put('/:id', verifyAdmin, upload.single('image'), async (req, res) => {
    console.log(`PUT /api/products/${req.params.id} hit`);
    try {
        const { name, description, price } = req.body;
        const updateData = { name, description, price };

        // Update imageUrl if a new image is uploaded
        if (req.file) {
            updateData.imageUrl = `/uploads/${req.file.filename}`;
        }

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
    console.log(`DELETE /api/products/${req.params.id} hit`);
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Server error while deleting product' });
    }
});

module.exports = router;