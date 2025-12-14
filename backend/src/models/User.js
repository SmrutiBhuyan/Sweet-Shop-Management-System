const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const { generateToken } = require('../utils/auth.utils');

/**
 * User Schema Definition
 * Represents a user in the sweet shop system
 * Includes authentication and authorization data
 */
const userSchema = new mongoose.Schema({
  // User's full name for display purposes
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },

  // Email is used as the username for login
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(value) {
        return validator.isEmail(value);
      },
      message: 'Please provide a valid email address'
    },
    index: true
  },

  // Password is hashed for security
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password in queries by default
  },

  // Role determines what the user can do in the system
  role: {
    type: String,
    enum: {
      values: ['customer', 'admin'],
      message: 'Role must be either "customer" or "admin"'
    },
    default: 'customer'
  },

  // When the user account was created
  createdAt: {
    type: Date,
    default: Date.now
  },

  // When the user account was last updated
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false, // We handle timestamps manually
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/**
 * Virtual Property: isAdmin
 * Convenient way to check if user is admin
 */
userSchema.virtual('isAdmin').get(function() {
  return this.role === 'admin';
});

/**
 * Middleware: Hash password before saving
 * Only hash if password was modified
 */
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    
    // Hash the password with the salt
    this.password = await bcrypt.hash(this.password, salt);
    
    // Update updatedAt timestamp
    this.updatedAt = Date.now();
    
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Middleware: Update updatedAt timestamp before updating
 */
userSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

/**
 * Instance Method: Compare entered password with hashed password
 * Used during login to verify credentials
 */
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Instance Method: Generate JWT token
 * Creates a signed token for authentication
 */
userSchema.methods.generateAuthToken = function() {
 return generateToken(this);
};

/**
 * Static Method: Find user by email
 * Useful for login functionality
 */
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase().trim() });
};

/**
 * Static Method: Check if email exists
 * Useful for registration to check if email is taken
 */
userSchema.statics.emailExists = async function(email) {
  const user = await this.findOne({ email: email.toLowerCase().trim() });
  return !!user;
};

/**
 * Create and export the User model
 */
const User = mongoose.model('User', userSchema);

module.exports = User;