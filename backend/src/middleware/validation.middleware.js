const { validateSchema, sanitizeString } = require('../utils/validation.utils');

/**
 * Validation schemas for different endpoints
 */
const validationSchemas = {
  // Auth validation schemas
  register: {
    name: {
      type: 'string',
      required: true,
      minLength: 2,
      maxLength: 100
    },
    email: {
      type: 'string',
      required: true,
      validate: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return {
          isValid: emailRegex.test(value),
          message: 'Please provide a valid email address'
        };
      }
    },
    password: {
      type: 'string',
      required: true,
      minLength: 6,
      validate: (value) => {
        if (value.length < 6) {
          return {
            isValid: false,
            message: 'Password must be at least 6 characters long'
          };
        }
        return { isValid: true, message: 'Password is valid' };
      }
    },
    role: {
      type: 'string',
      required: false,
      enum: ['customer', 'admin'],
      default: 'customer'
    }
  },
  
  login: {
    email: {
      type: 'string',
      required: true
    },
    password: {
      type: 'string',
      required: true
    }
  },
  
  // Sweet validation schemas
  createSweet: {
    name: {
      type: 'string',
      required: true,
      minLength: 2,
      maxLength: 100
    },
    description: {
      type: 'string',
      required: true,
      minLength: 10,
      maxLength: 500
    },
    category: {
      type: 'string',
      required: true,
      enum: ['Chocolates', 'Cakes', 'Cookies', 'Candies', 'Pastries', 'Desserts', 'Ice Cream']
    },
    price: {
      type: 'number',
      required: true,
      min: 1,
      max: 10000,
      validate: (value) => {
        const decimalPlaces = value.toString().split('.')[1]?.length || 0;
        return {
          isValid: decimalPlaces <= 2,
          message: 'Price can have at most 2 decimal places'
        };
      }
    },
    quantityInStock: {
      type: 'number',
      required: true,
      min: 0
    },
    imageUrl: {
      type: 'string',
      required: false,
      validate: (value) => {
        if (!value) return { isValid: true, message: 'Optional field' };
        const urlRegex = /^(https?:\/\/).+/;
        return {
          isValid: urlRegex.test(value),
          message: 'Image URL must be a valid HTTP/HTTPS URL'
        };
      }
    }
  },
  
  updateSweet: {
    name: {
      type: 'string',
      required: false,
      minLength: 2,
      maxLength: 100
    },
    description: {
      type: 'string',
      required: false,
      minLength: 10,
      maxLength: 500
    },
    category: {
      type: 'string',
      required: false,
      enum: ['Chocolates', 'Cakes', 'Cookies', 'Candies', 'Pastries', 'Desserts', 'Ice Cream']
    },
    price: {
      type: 'number',
      required: false,
      min: 1,
      max: 10000,
      validate: (value) => {
        const decimalPlaces = value.toString().split('.')[1]?.length || 0;
        return {
          isValid: decimalPlaces <= 2,
          message: 'Price can have at most 2 decimal places'
        };
      }
    },
    quantityInStock: {
      type: 'number',
      required: false,
      min: 0
    },
    imageUrl: {
      type: 'string',
      required: false,
      validate: (value) => {
        if (!value) return { isValid: true, message: 'Optional field' };
        const urlRegex = /^(https?:\/\/).+/;
        return {
          isValid: urlRegex.test(value),
          message: 'Image URL must be a valid HTTP/HTTPS URL'
        };
      }
    }
  },
  
  purchaseSweet: {
    quantity: {
      type: 'number',
      required: true,
      min: 1,
      validate: (value) => ({
        isValid: Number.isInteger(value),
        message: 'Quantity must be a whole number'
      })
    }
  },
  
  restockSweet: {
    quantity: {
      type: 'number',
      required: true,
      min: 1,
      validate: (value) => ({
        isValid: Number.isInteger(value),
        message: 'Quantity must be a whole number'
      })
    }
  }
};

/**
 * Validation middleware factory
 * @param {string} schemaName - Name of the validation schema to use
 * @returns {Function} - Express middleware function
 */
const validate = (schemaName) => {
  return (req, res, next) => {
    const schema = validationSchemas[schemaName];
    
    if (!schema) {
      return res.status(500).json({
        success: false,
        error: `Validation schema '${schemaName}' not found`
      });
    }
    
    // Sanitize string inputs
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeString(req.body[key]);
      }
    });
    
    // Validate against schema
    const validationResult = validateSchema(req.body, schema);
    
    if (!validationResult.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationResult.errors
      });
    }
    
    next();
  };
};

/**
 * Validate MongoDB ObjectId in URL parameters
 */
const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  
  // Check if id is a valid MongoDB ObjectId (24 hex characters)
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  
  if (!objectIdRegex.test(id)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid ID format. Must be a valid MongoDB ObjectId'
    });
  }
  
  next();
};

/**
 * Validate query parameters for pagination and filtering
 */
const validateQueryParams = (req, res, next) => {
  const { page, limit, minPrice, maxPrice, category } = req.query;
  
  // Validate page
  if (page && (!Number.isInteger(Number(page)) || Number(page) < 1)) {
    return res.status(400).json({
      success: false,
      error: 'Page must be a positive integer'
    });
  }
  
  // Validate limit
  if (limit && (!Number.isInteger(Number(limit)) || Number(limit) < 1 || Number(limit) > 100)) {
    return res.status(400).json({
      success: false,
      error: 'Limit must be an integer between 1 and 100'
    });
  }
  
  // Validate price range
  if (minPrice && (isNaN(Number(minPrice)) || Number(minPrice) < 0)) {
    return res.status(400).json({
      success: false,
      error: 'minPrice must be a non-negative number'
    });
  }
  
  if (maxPrice && (isNaN(Number(maxPrice)) || Number(maxPrice) < 0)) {
    return res.status(400).json({
      success: false,
      error: 'maxPrice must be a non-negative number'
    });
  }
  
  if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
    return res.status(400).json({
      success: false,
      error: 'minPrice cannot be greater than maxPrice'
    });
  }
  
  next();
};

module.exports = {
  validate,
  validateObjectId,
  validateQueryParams,
  validationSchemas
};