const jwt = require('jsonwebtoken');
const { protect, authorize } = require('../middleware/auth.middleware');
const User = require('../models/User');

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../models/User');

describe('Authentication Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    // Create mock request, response, and next function
    req = {
      headers: {},
      cookies: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();

    // Clear all mocks
    jest.clearAllMocks();
    
    // Set JWT secret for tests
    process.env.JWT_SECRET = 'test-secret-key';
  });

  /**
   * Test 1: Protect Middleware - No Token
   */
  describe('protect middleware - no token', () => {
    
    it('should return 401 if no token is provided', async () => {
      // Act
      await protect(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not authorized to access this resource'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  /**
   * Test 2: Protect Middleware - Invalid Token
   */
  describe('protect middleware - invalid token', () => {
    
    beforeEach(() => {
      req.headers.authorization = 'Bearer invalid.token';
    });

    it('should return 401 for invalid token', async () => {
      // Arrange
      jwt.verify.mockReturnValue(null);

      // Act
      await protect(req, res, next);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith('invalid.token', process.env.JWT_SECRET);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not authorized to access this resource'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  /**
   * Test 3: Protect Middleware - Valid Token, User Not Found
   */
  describe('protect middleware - user not found', () => {
    
    beforeEach(() => {
      req.headers.authorization = 'Bearer valid.token';
    });

    it('should return 401 if user no longer exists', async () => {
      // Arrange
      const decodedToken = { id: 'user123', email: 'test@example.com' };
      jwt.verify.mockReturnValue(decodedToken);
      User.findById.mockResolvedValue(null); // User not found

      // Act
      await protect(req, res, next);

      // Assert
      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'User no longer exists'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  /**
   * Test 4: Protect Middleware - Success
   */
  describe('protect middleware - success', () => {
    
    beforeEach(() => {
      req.headers.authorization = 'Bearer valid.token';
    });

    it('should set req.user and call next() for valid token', async () => {
      // Arrange
      const decodedToken = { id: 'user123', email: 'test@example.com' };
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        role: 'customer'
      };
      
      // Mock jwt.verify to return decoded token
      jwt.verify.mockImplementation(() => decodedToken);
      
      // Mock User.findById to return the user
      User.findById.mockImplementation(() => Promise.resolve(mockUser));

      // Act
      await protect(req, res, next);

      // Assert
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  /**
   * Test 5: Authorize Middleware - No User
   */
  describe('authorize middleware - no user', () => {
    
    it('should return 401 if no user is authenticated', () => {
      // Act
      authorize('admin')(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not authorized to access this resource'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  /**
   * Test 6: Authorize Middleware - Insufficient Role
   */
  describe('authorize middleware - insufficient role', () => {
    
    beforeEach(() => {
      req.user = { role: 'customer' };
    });

    it('should return 403 if user role is insufficient', () => {
      // Act: Customer trying to access admin route
      authorize('admin')(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'User role customer is not authorized to access this resource'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  /**
   * Test 7: Authorize Middleware - Success
   */
  describe('authorize middleware - success', () => {
    
    it('should call next() for admin accessing admin route', () => {
      // Arrange
      req.user = { role: 'admin' };

      // Act
      authorize('admin')(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should call next() for customer accessing customer route', () => {
      // Arrange
      req.user = { role: 'customer' };

      // Act
      authorize('customer')(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should call next() for admin accessing customer route', () => {
      // Arrange
      req.user = { role: 'admin' };

      // Act: Admin accessing customer route (should be allowed)
      authorize('customer')(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should call next() when no roles specified (any authenticated user)', () => {
      // Arrange
      req.user = { role: 'customer' };

      // Act: No roles specified - any authenticated user should pass
      authorize()(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  /**
   * Test 8: Authorize Middleware - Multiple Roles
   */
  describe('authorize middleware - multiple roles', () => {
    
    it('should allow access if user has one of the allowed roles', () => {
      // Arrange
      req.user = { role: 'customer' };

      // Act: Allow both customer and admin
      authorize('customer', 'admin')(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
    });

    it('should allow access with array of roles', () => {
      // Arrange
      req.user = { role: 'admin' };

      // Act: Allow with array syntax
      authorize(['customer', 'admin'])(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
    });

    it('should deny access if user has none of the allowed roles', () => {
      // Arrange
      req.user = { role: 'customer' };

      // Act: Only allow admin (but user is customer)
      authorize('admin')(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'User role customer is not authorized to access this resource'
      });
    });
  });
});