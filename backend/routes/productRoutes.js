const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { verifyAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// Configure multer for file uploads (using memory storage to upload directly to Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Configure Cloudinary
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
router.post('/', verifyAdmin, upload.single('image'), async (req, res) => {
    try {
        const { name, description, price } = req.body;

        // Validate required fields
        if (!name || !description || price === undefined) {
            return res.status(400).json({ message: 'Fields (name, description, price) are required' });
        }

        const result = await cloudinary.uploader.upload_stream(
            { resource_type: 'auto' },
            async (error, result) => {
                if (error) {
                    return res.status(500).json({ error: error.message });
                }

                const imageUrl = result.secure_url; // Save the Cloudinary image URL
                const product = new Product({
                    name,
                    description,
                    price,
                    imageUrl,
                });

                await product.save();
                res.status(201).json({ message: 'Product created successfully', product });
            }
        ).end(req.file.buffer);  
    } catch (error) {
        res.status(500).json({ message: 'Server error while creating product' });
    }
});

// PUT update a product (admin only)
router.put('/:id', verifyAdmin, upload.single('image'), async (req, res) => {
    try {
        const { name, description, price } = req.body;
        const updateData = { name, description, price };

        // If a new image is uploaded, update imageUrl
        if (req.file) {
            // Upload image to Cloudinary and get the URL
            const result = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { resource_type: 'auto' },
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    }
                ).end(req.file.buffer);
            });

            updateData.imageUrl = result.secure_url; // Save the Cloudinary image URL
        }

        // Update the product with the new data
        const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Product updated successfully', product });
    } catch (error) {
        console.error(error);
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