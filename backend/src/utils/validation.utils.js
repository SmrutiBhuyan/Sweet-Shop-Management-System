/**
 * Validation utilities for request data
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * Requirements: at least 6 characters, 1 uppercase, 1 lowercase, 1 number
 * @param {string} password - Password to validate
 * @returns {Object} - { isValid: boolean, message: string }
 */
const validatePassword = (password) => {
  if (password.length < 6) {
    return {
      isValid: false,
      message: 'Password must be at least 6 characters long'
    };
  }
  
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter'
    };
  }
  
  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one lowercase letter'
    };
  }
  
  if (!/\d/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one number'
    };
  }
  
  return {
    isValid: true,
    message: 'Password is valid'
  };
};

/**
 * Validate price format (positive number with up to 2 decimal places)
 * @param {number} price - Price to validate
 * @returns {Object} - { isValid: boolean, message: string }
 */
const validatePrice = (price) => {
  if (typeof price !== 'number' || isNaN(price)) {
    return {
      isValid: false,
      message: 'Price must be a valid number'
    };
  }
  
  if (price <= 0) {
    return {
      isValid: false,
      message: 'Price must be greater than 0'
    };
  }
  
  // Check decimal places
  const decimalPlaces = price.toString().split('.')[1]?.length || 0;
  if (decimalPlaces > 2) {
    return {
      isValid: false,
      message: 'Price can have at most 2 decimal places'
    };
  }
  
  return {
    isValid: true,
    message: 'Price is valid'
  };
};

/**
 * Validate quantity (positive integer)
 * @param {number} quantity - Quantity to validate
 * @returns {Object} - { isValid: boolean, message: string }
 */
const validateQuantity = (quantity) => {
  if (typeof quantity !== 'number' || isNaN(quantity)) {
    return {
      isValid: false,
      message: 'Quantity must be a valid number'
    };
  }
  
  if (!Number.isInteger(quantity)) {
    return {
      isValid: false,
      message: 'Quantity must be a whole number'
    };
  }
  
  if (quantity < 0) {
    return {
      isValid: false,
      message: 'Quantity cannot be negative'
    };
  }
  
  return {
    isValid: true,
    message: 'Quantity is valid'
  };
};

/**
 * Sanitize string input (trim and remove excessive whitespace)
 * @param {string} input - String to sanitize
 * @returns {string} - Sanitized string
 */
const sanitizeString = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/\s+/g, ' ');
};

/**
 * Validate required fields in request body
 * @param {Object} body - Request body
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object} - { isValid: boolean, missingFields: Array, message: string }
 */
const validateRequiredFields = (body, requiredFields) => {
  const missingFields = [];
  
  requiredFields.forEach(field => {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      missingFields.push(field);
    }
  });
  
  if (missingFields.length > 0) {
    return {
      isValid: false,
      missingFields,
      message: `Missing required fields: ${missingFields.join(', ')}`
    };
  }
  
  return {
    isValid: true,
    missingFields: [],
    message: 'All required fields present'
  };
};

/**
 * Validate request body against schema
 * @param {Object} body - Request body
 * @param {Object} schema - Validation schema
 * @returns {Object} - { isValid: boolean, errors: Array, message: string }
 */
const validateSchema = (body, schema) => {
  const errors = [];
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = body[field];
    
    // Check required
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
      continue;
    }
    
    // Skip further validation if field is not required and not provided
    if (!rules.required && (value === undefined || value === null)) {
      continue;
    }
    
    // Check type
    if (rules.type && typeof value !== rules.type) {
      errors.push(`${field} must be a ${rules.type}`);
    }
    
    // Check min length
    if (rules.minLength && value.length < rules.minLength) {
      errors.push(`${field} must be at least ${rules.minLength} characters`);
    }
    
    // Check max length
    if (rules.maxLength && value.length > rules.maxLength) {
      errors.push(`${field} cannot exceed ${rules.maxLength} characters`);
    }
    
    // Check min value
    if (rules.min !== undefined && value < rules.min) {
      errors.push(`${field} must be at least ${rules.min}`);
    }
    
    // Check max value
    if (rules.max !== undefined && value > rules.max) {
      errors.push(`${field} cannot exceed ${rules.max}`);
    }
    
    // Check enum values
    if (rules.enum && !rules.enum.includes(value)) {
      errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
    }
    
    // Custom validation function
    if (rules.validate && typeof rules.validate === 'function') {
      const customResult = rules.validate(value);
      if (!customResult.isValid) {
        errors.push(`${field}: ${customResult.message}`);
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    message: errors.length > 0 ? errors.join('; ') : 'Validation passed'
  };
};

module.exports = {
  isValidEmail,
  validatePassword,
  validatePrice,
  validateQuantity,
  sanitizeString,
  validateRequiredFields,
  validateSchema
};