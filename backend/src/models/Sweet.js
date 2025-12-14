const mongoose = require('mongoose');

// Define what a Sweet item looks like in our database
const sweetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name for the sweet'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: [
      'Chocolate',
      'Candy',
      'Pastry',
      'Cookie',
      'Cake',
      'Ice Cream',
      'Traditional',
      'Sugar-Free',
      'Other'
    ]
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: [0, 'Price cannot be negative'],
    max: [1000, 'Price cannot be more than 1000']
  },
  quantity: {
    type: Number,
    required: [true, 'Please provide quantity'],
    min: [0, 'Quantity cannot be negative'],
    default: 0
  },
  imageUrl: {
    type: String,
    default: 'https://via.placeholder.com/300x200?text=Sweet+Image'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

// Create an index for faster searching by name and category
sweetSchema.index({ name: 'text', category: 'text' });

// Create the Sweet model from the schema
const Sweet = mongoose.model('Sweet', sweetSchema);

module.exports = Sweet;