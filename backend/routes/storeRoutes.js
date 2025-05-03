const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Purchase = require('../models/Purchase');
const Cart = require('../models/Cart');
const Notification = require('../models/Notification');
const { verifyToken } = require('../middleware/authMiddleware');

// Get all products
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products.' });
  }
});

// Add product to cart
router.post('/cart', verifyToken, async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;

  try {
    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Find or create cart for user
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity if product already in cart
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      cart.items.push({
        productId,
        productName: product.name,
        quantity,
        price: product.price,
        imageUrl: product.imageUrl
      });
    }

    cart.updatedAt = Date.now();
    await cart.save();
    
    res.status(200).json({ message: 'Product added to cart', cart });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Failed to add product to cart.' });
  }
});

// Get cart contents
router.get('/cart', verifyToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');
    if (!cart) {
      return res.json({ items: [] });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch cart.' });
  }
});

// Remove item from cart
router.delete('/cart/:itemId', verifyToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found.' });
    }

    cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);
    cart.updatedAt = Date.now();
    await cart.save();

    res.json({ message: 'Item removed from cart', cart });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove item from cart.' });
  }
});

// Checkout - purchase all items in cart
router.post('/checkout', verifyToken, async (req, res) => {
  const userId = req.user.id;
  
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty.' });
    }

    // Create purchase records for each item
    const purchases = [];
    for (const item of cart.items) {
      const purchase = new Purchase({
        userId,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        pricePerUnit: item.price,
        totalPrice: item.price * item.quantity,
      });
      await purchase.save();
      purchases.push(purchase);

      // Create notification for each purchase
      const notification = new Notification({
        userId,
        message: `You purchased ${item.productName} (x${item.quantity}) for $${(item.price * item.quantity).toFixed(2)}.`,
        date: new Date()
      });
      await notification.save();
    }

    // Clear the cart
    await Cart.findOneAndDelete({ userId });

    res.status(200).json({
      message: 'Checkout successful!',
      purchases
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ message: 'Failed to complete checkout.' });
  }
});

// Get user notifications
router.get('/notifications', verifyToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ date: -1 })
      .limit(10);
    
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notifications.' });
  }
});

// Get user purchases
router.get('/purchases', verifyToken, async (req, res) => {
  try {
    const purchases = await Purchase.find({ userId: req.user.id })
      .sort({ purchaseDate: -1 });
    
    res.json(purchases);
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({ message: 'Failed to fetch purchases.' });
  }
});

module.exports = router;