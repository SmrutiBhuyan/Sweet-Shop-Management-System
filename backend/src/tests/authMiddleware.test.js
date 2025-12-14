const jwt = require('jsonwebtoken');
const { protectRoute, isAdmin } = require('../middleware/auth');

// Mock the User model BEFORE requiring the middleware
jest.mock('../models/User', () => {
  // This mock will be used by the auth middleware
  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    username: 'testuser',
    email: 'test@example.com',
    role: 'customer',
    password: 'hashedpassword',
    select: jest.fn() // Add select method to the user object
  };
  
  const mockUserWithoutPassword = {
    _id: '507f1f77bcf86cd799439011',
    username: 'testuser',
    email: 'test@example.com',
    role: 'customer'
  };
  
  // Mock the findById method to return an object with select method
  const mockFindById = jest.fn();
  
  return {
    findById: mockFindById
  };
});

// Now require the mocked User
const User = require('../models/User');

describe('Authentication Middleware', () => {
  let mockReq, mockRes, mockNext;
  const mockUserId = '507f1f77bcf86cd799439011';
  const mockUser = {
    _id: mockUserId,
    username: 'testuser',
    email: 'test@example.com',
    role: 'customer'
  };

  beforeEach(() => {
    // Mock objects
    mockReq = {
      headers: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('protectRoute Middleware', () => {
    it('should allow access with valid token', async () => {
      const token = jwt.sign(
        { userId: mockUserId },
        process.env.JWT_SECRET || 'test_jwt_secret_key_for_testing_only',
        { expiresIn: '1h' }
      );

      mockReq.headers.authorization = `Bearer ${token}`;
      
      // Setup the mock to return an object with select method
      const mockSelect = jest.fn().mockResolvedValue(mockUser);
      User.findById.mockReturnValue({
        select: mockSelect
      });

      await protectRoute(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toEqual(mockUser);
      expect(User.findById).toHaveBeenCalledWith(mockUserId);
      expect(mockSelect).toHaveBeenCalledWith('-password');
    });

    it('should reject request without authorization header', async () => {
      await protectRoute(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Not authorized, no token'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject request with malformed authorization header', async () => {
      mockReq.headers.authorization = 'InvalidFormat';

      await protectRoute(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Not authorized, no token'  // Fixed expectation
      });
    });

    it('should reject request with invalid token', async () => {
      mockReq.headers.authorization = 'Bearer invalid.token.here';

      await protectRoute(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Not authorized, token failed'
      });
    });

    it('should reject request when user not found', async () => {
      const token = jwt.sign(
        { userId: mockUserId },
        process.env.JWT_SECRET || 'test_jwt_secret_key_for_testing_only',
        { expiresIn: '1h' }
      );

      mockReq.headers.authorization = `Bearer ${token}`;
      
      // Mock user not found - return null from select
      const mockSelect = jest.fn().mockResolvedValue(null);
      User.findById.mockReturnValue({
        select: mockSelect
      });

      await protectRoute(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found'
      });
    });

    it('should reject request with expired token', async () => {
      const expiredToken = jwt.sign(
        { userId: mockUserId },
        process.env.JWT_SECRET || 'test_jwt_secret_key_for_testing_only',
        { expiresIn: '-1s' } // Already expired
      );

      mockReq.headers.authorization = `Bearer ${expiredToken}`;

      await protectRoute(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Not authorized, token failed'
      });
    });
  });

  describe('isAdmin Middleware', () => {
    it('should allow access for admin user', () => {
      mockReq.user = { 
        _id: mockUserId,
        role: 'admin',
        username: 'testuser',
        email: 'test@example.com'
      };
      
      isAdmin(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should deny access for customer user', () => {
      mockReq.user = { 
        _id: mockUserId,
        role: 'customer',
        username: 'testuser',
        email: 'test@example.com'
      };
      
      isAdmin(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied. Admin role required.'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should deny access when no user in request', () => {
      mockReq.user = null;
      
      isAdmin(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied. Admin role required.'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});