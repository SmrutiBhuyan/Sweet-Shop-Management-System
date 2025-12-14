const { body, validationResult } = require('express-validator');

// Validation rules for user registration
const validateUserRegistration = [
  // Validate username
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
  
  // Validate email
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  // Validate password
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  
  // Validate role (required)
  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['customer', 'admin']).withMessage('Role must be either customer or admin')
];

// Validation rules for sweet creation/update
const validateSweet = [
  // Validate name
  body('name')
    .trim()
    .notEmpty().withMessage('Sweet name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  
  // Validate description (optional)
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  
  // Validate category
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required')
    .isIn([
      'Chocolate',
      'Candy',
      'Pastry',
      'Cookie',
      'Cake',
      'Ice Cream',
      'Traditional',
      'Sugar-Free',
      'Other'
    ]).withMessage('Invalid category'),
  
  // Validate price
  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0, max: 1000 }).withMessage('Price must be between 0 and 1000'),
  
  // Validate quantity
  body('quantity')
    .optional()
    .isInt({ min: 0 }).withMessage('Quantity cannot be negative')
];

// Middleware to check validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // If there are validation errors, return them
    return res.status(400).json({
      success: false,
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg
      }))
    });
  }
  
  next(); // No errors, proceed to next middleware
};

module.exports = {
  validateUserRegistration,
  validateSweet,
  handleValidationErrors
};