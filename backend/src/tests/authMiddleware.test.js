const jwt = require('jsonwebtoken');
const { protectRoute, isAdmin } = require('../middleware/auth');
const User = require('../models/User');

describe('Authentication Middleware', () => {
  let mockReq, mockRes, mockNext, testUser;

  beforeEach(async () => {
    // Clear database
    await User.deleteMany({});

    // Create test user
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      role: 'customer'
    });

    // Mock objects
    mockReq = {
      headers: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  describe('protectRoute Middleware', () => {
    it('should allow access with valid token', async () => {
      const token = jwt.sign(
        { userId: testUser._id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      mockReq.headers.authorization = `Bearer ${token}`;

      await protectRoute(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toBeDefined();
      expect(mockReq.user._id.toString()).toBe(testUser._id.toString());
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
        message: 'Not authorized, token failed'
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

    it('should reject request with expired token', async () => {
      const expiredToken = jwt.sign(
        { userId: testUser._id },
        process.env.JWT_SECRET,
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

    it('should reject request when user no longer exists', async () => {
      const token = jwt.sign(
        { userId: testUser._id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Delete the user
      await User.findByIdAndDelete(testUser._id);

      mockReq.headers.authorization = `Bearer ${token}`;

      await protectRoute(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found'
      });
    });
  });

  describe('isAdmin Middleware', () => {
    it('should allow access for admin user', () => {
      mockReq.user = { role: 'admin' };
      
      isAdmin(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should deny access for customer user', () => {
      mockReq.user = { role: 'customer' };
      
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
    });
  });

  describe('Middleware Chain', () => {
    it('should work with both middlewares in chain', async () => {
      // First, make user an admin
      testUser.role = 'admin';
      await testUser.save();

      const token = jwt.sign(
        { userId: testUser._id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      mockReq.headers.authorization = `Bearer ${token}`;

      // Call protectRoute first
      await protectRoute(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      
      // Reset mockNext for isAdmin test
      mockNext.mockClear();
      
      // Then call isAdmin
      isAdmin(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
    });
  });
});