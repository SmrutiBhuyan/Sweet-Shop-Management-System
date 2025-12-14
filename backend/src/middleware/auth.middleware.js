const { verifyToken, extractTokenFromHeader } = require('../utils/auth.utils');
const User = require('../models/User');

/**
 * Protect Middleware
 * Verifies JWT token and attaches user to request object
 * Use this middleware for any route that requires authentication
 */
const protect = async (req, res, next) => {
  let token;
  
  // 1. Get token from request
  token = extractTokenFromHeader(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this resource'
    });
  }

  try {
    // 2. Verify token
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this resource'
      });
    }

    // 3. Check if user still exists
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User no longer exists'
      });
    }

    // 4. Attach user to request object
    req.user = user;
    
    // 5. Continue to next middleware/route handler
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this resource'
    });
  }
};

/**
 * Authorize Middleware
 * Checks if user has required role(s)
 * Use after protect middleware for role-based access control
 * @param {...String} roles - Role(s) allowed to access the route
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this resource'
      });
    }

    // Handle array parameter (if first argument is an array)
    let allowedRoles = roles;
    if (roles.length === 1 && Array.isArray(roles[0])) {
      allowedRoles = roles[0];
    }

    // Check if user has required role
    // If no roles specified, allow all authenticated users
    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this resource`
      });
    }

    next();
  };
};

/**
 * Optional Authentication Middleware
 * Similar to protect, but doesn't fail if no token
 * Use for routes that work both with and without authentication
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req);

    if (token) {
      const decoded = verifyToken(token);

      if (decoded) {
        const user = await User.findById(decoded.id).select('-password');
        if (user) {
          req.user = user;
        }
      }
    }

    next();
  } catch (error) {
    // Don't fail on auth errors for optional auth
    console.error('Optional authentication error:', error);
    next();
  }
};

module.exports = {
  protect,
  authorize,
  optionalAuth
};