const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  pricePerUnit: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  purchaseDate: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['Pending', 'Processing', 'Packed', 'Ready for Pickup', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  }
});

module.exports = mongoose.model('Purchase', purchaseSchema);