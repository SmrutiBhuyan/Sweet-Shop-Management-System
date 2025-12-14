const mongoose = require('mongoose');

// Define Purchase schema to track user purchases
const purchaseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sweet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sweet',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative']
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['completed', 'pending', 'cancelled'],
    default: 'completed'
  }
});

// Create index for faster queries
purchaseSchema.index({ user: 1, purchaseDate: -1 });
purchaseSchema.index({ sweet: 1 });

// Create the Purchase model
const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;

