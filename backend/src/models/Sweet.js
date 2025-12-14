const mongoose = require('mongoose');

/**
 * Sweet Schema Definition
 * Represents a sweet/item in the sweet shop
 */
const sweetSchema = new mongoose.Schema({
  // The name of the sweet - like "Chocolate Truffle" or "Strawberry Cheesecake"
  name: {
    type: String,
    required: [true, 'Sweet name is required'],
    trim: true, // Removes extra spaces from beginning and end
    unique: true, // No two sweets can have same name
    minlength: [2, 'Sweet name must be at least 2 characters long'],
    maxlength: [100, 'Sweet name cannot exceed 100 characters'],
    index: true, // Makes searching by name faster
  },

  // Detailed description of the sweet - what it tastes like, ingredients, etc.
  description: {
    type: String,
    required: [true, 'Sweet description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters long'],
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },

  // Category helps organize sweets - like "Chocolates", "Cakes", "Cookies"
  category: {
    type: String,
    required: [true, 'Sweet category is required'],
    trim: true,
    enum: {
      values: ['Chocolates', 'Cakes', 'Cookies', 'Candies', 'Pastries', 'Desserts', 'Ice Cream'],
      message: '{VALUE} is not a valid category. Choose from: Chocolates, Cakes, Cookies, Candies, Pastries, Desserts, Ice Cream'
    },
    index: true, // Makes filtering by category faster
  },

  // Price of one unit of the sweet in rupees (or your local currency)
  price: {
    type: Number,
    required: [true, 'Sweet price is required'],
    min: [1, 'Price must be at least 1 rupee'],
    max: [10000, 'Price cannot exceed 10,000 rupees'],
    validate: {
      validator: function(value) {
        // Price should have at most 2 decimal places
        return /^\d+(\.\d{1,2})?$/.test(value.toString());
      },
      message: 'Price must have at most 2 decimal places'
    }
  },

  // How many of this sweet are available in stock
  quantityInStock: {
    type: Number,
    required: [true, 'Quantity in stock is required'],
    min: [0, 'Quantity cannot be negative'],
    default: 0, // Default to 0 if not specified
  },

  // URL or path to the sweet's image - helps customers see what they're buying
  imageUrl: {
    type: String,
    trim: true,
    default: 'https://placehold.co/400x300/FFE4E1/FF69B4?text=No+Image+Available',
    validate: {
      validator: function(value) {
        // Simple URL validation
        const urlPattern = /^(https?:\/\/).+/;
        return urlPattern.test(value);
      },
      message: 'Image URL must be a valid HTTP/HTTPS URL'
    }
  },

  // Track when the sweet was added to the shop
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set to current date/time
  },

  // Track when the sweet was last updated
  updatedAt: {
    type: Date,
    default: Date.now,
  }
}, {
  // Schema options
  timestamps: false, // We handle timestamps manually
  toJSON: { virtuals: true }, // Include virtual properties when converting to JSON
  toObject: { virtuals: true } // Include virtual properties when converting to object
});

/**
 * Virtual Property: isInStock
 * This is a computed property that tells us if the sweet is available for purchase
 * We don't store this in database, it's calculated when needed
 */
sweetSchema.virtual('isInStock').get(function() {
  return this.quantityInStock > 0;
});

/**
 * Virtual Property: formattedPrice
 * Returns price formatted as currency (e.g., "₹250.00")
 */
sweetSchema.virtual('formattedPrice').get(function() {
  return `₹${this.price.toFixed(2)}`;
});

/**
 * Middleware: Update updatedAt timestamp before saving
 * For Mongoose v7.5.0+, we need to handle async middleware differently
 */
sweetSchema.pre('save', function(next) {
  // Only update updatedAt if the document is being modified
  if (this.isModified()) {
    this.updatedAt = Date.now();
  }
  
  if (next) {
    next();
  }
});

/**
 * Middleware: Update updatedAt timestamp before updating
 * For Mongoose v7.5.0+, we use async function style
 */
sweetSchema.pre('findOneAndUpdate', async function() {
  const update = this.getUpdate();
  
  // If update is an object (not a pipeline), set updatedAt
  if (update && !update.$setPipeline) {
    if (!update.$set) {
      update.$set = {};
    }
    update.$set.updatedAt = Date.now();
  }
});

/**
 * Static Method: Find sweets that are low in stock
 * This helps shop owners know what needs restocking
 */
sweetSchema.statics.findLowStock = function(threshold = 10) {
  return this.find({ quantityInStock: { $lt: threshold } });
};

/**
 * Static Method: Find sweets by category
 * Makes it easy to get all sweets in a specific category
 */
sweetSchema.statics.findByCategory = function(category) {
  return this.find({ category: new RegExp(category, 'i') }); // Case-insensitive
};

/**
 * Instance Method: Purchase sweet
 * Reduces stock quantity when someone buys this sweet
 */
sweetSchema.methods.purchase = async function(quantityToPurchase) {
  if (quantityToPurchase <= 0) {
    throw new Error('Purchase quantity must be greater than 0');
  }
  
  if (this.quantityInStock < quantityToPurchase) {
    throw new Error(`Not enough stock. Only ${this.quantityInStock} items available`);
  }
  
  this.quantityInStock -= quantityToPurchase;
  return await this.save();
};

/**
 * Instance Method: Restock sweet
 * Increases stock quantity when shop owner adds more items
 */
sweetSchema.methods.restock = async function(quantityToAdd) {
  if (quantityToAdd <= 0) {
    throw new Error('Restock quantity must be greater than 0');
  }
  
  this.quantityInStock += quantityToAdd;
  return await this.save();
};

/**
 * Create and export the Sweet model
 * This is what we'll use to interact with the sweets collection in MongoDB
 */
const Sweet = mongoose.model('Sweet', sweetSchema);

module.exports = Sweet;