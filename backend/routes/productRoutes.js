const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { verifyAdmin } = require('../middleware/authMiddleware');

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
router.post('/', verifyAdmin, async (req, res) => {
    console.log('POST /api/products hit');
    try {
        // Validate required fields (imageUrl is optional)
        const { name, description, price, imageUrl } = req.body;
        if (!name || !description || price === undefined) {
            return res.status(400).json({ message: 'Fields (name, description, price) are required' });
        }

        const product = new Product({
            name,
            description,
            price,
            imageUrl: imageUrl || '', // Default to empty string if no imageUrl is provided
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
    console.log(`PUT /api/products/${req.params.id} hit`);
    try {
        const { name, description, price, imageUrl } = req.body;
        const updateData = { 
            name, 
            description, 
            price,
            updatedAt: Date.now() 
        };

        // Update imageUrl if provided
        if (imageUrl !== undefined) {
            updateData.imageUrl = imageUrl;
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