const jwt = require('jsonwebtoken');

/**
 * Generate JWT Token
 * Creates a signed token for user authentication
 * @param {Object} user - User object from database
 * @returns {String} JWT token
 */
const generateToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role
  };

  const options = {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  };

  return jwt.sign(payload, process.env.JWT_SECRET, options);
};

/**
 * Verify JWT Token
 * Validates a token and returns the payload if valid
 * @param {String} token - JWT token to verify
 * @returns {Object|null} Decoded token payload or null if invalid
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    // Handle different JWT errors
    if (error.name === 'TokenExpiredError') {
      console.log('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      console.log('Invalid token');
    } else {
      console.log('Token verification failed:', error.message);
    }
    
    return null;
  }
};

/**
 * Extract token from request headers
 * Looks for token in Authorization header (Bearer token)
 * @param {Object} req - Express request object
 * @returns {String|null} Token or null if not found
 */
const extractTokenFromHeader = (req) => {
  // Check if token exists in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return req.headers.authorization.split(' ')[1];
  }

  // Check if token exists in cookies (for web clients)
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }

  return null;
};

/**
 * Create cookie options for JWT token
 * @returns {Object} Cookie configuration
 */
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    expires: new Date(
      Date.now() + (parseInt(process.env.JWT_COOKIE_EXPIRE || '7') * 24 * 60 * 60 * 1000)
    ),
    httpOnly: true,
    secure: isProduction, // Only send over HTTPS in production
    sameSite: isProduction ? 'strict' : 'lax'
  };
};

module.exports = {
  generateToken,
  verifyToken,
  extractTokenFromHeader,
  getCookieOptions
};