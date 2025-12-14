const jwt = require('jsonwebtoken');
const { generateToken, verifyToken } = require('../utils/auth.utils');

// Mock the jwt module
jest.mock('jsonwebtoken');

// Set up environment variables for tests
beforeAll(() => {
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
  process.env.JWT_EXPIRE = '1h';
});

describe('Auth Utilities', () => {
  const mockUser = {
    _id: '1234567890abcdef',
    email: 'test@example.com',
    role: 'customer'
  };

  const mockToken = 'mocked.jwt.token';

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  /**
   * Test 1: Generate Token
   */
  describe('generateToken', () => {
    
    it('should generate a JWT token with correct payload', () => {
      // Arrange
      jwt.sign.mockReturnValue(mockToken);

      // Act
      const token = generateToken(mockUser);

      // Assert
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          id: mockUser._id,
          email: mockUser.email,
          role: mockUser.role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );
      expect(token).toBe(mockToken);
    });

    it('should use default expire time if not provided', () => {
      // Arrange
      const originalExpire = process.env.JWT_EXPIRE;
      delete process.env.JWT_EXPIRE;
      
      jwt.sign.mockReturnValue(mockToken);

      // Act
      generateToken(mockUser);

      // Assert
      expect(jwt.sign).toHaveBeenCalledWith(
        expect.any(Object),
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Cleanup
      process.env.JWT_EXPIRE = originalExpire;
    });
  });

  /**
   * Test 2: Verify Token
   */
  describe('verifyToken', () => {
    
    it('should verify a valid token', () => {
      // Arrange
      const mockPayload = { id: '123', email: 'test@example.com', role: 'customer' };
      jwt.verify.mockReturnValue(mockPayload);

      // Act
      const payload = verifyToken(mockToken);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(mockToken, process.env.JWT_SECRET);
      expect(payload).toEqual(mockPayload);
    });

    it('should return null for invalid token', () => {
      // Arrange
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act
      const payload = verifyToken('invalid.token');

      // Assert
      expect(payload).toBeNull();
    });

    it('should return null for expired token', () => {
      // Arrange
      jwt.verify.mockImplementation(() => {
        const error = new Error('Token expired');
        error.name = 'TokenExpiredError';
        throw error;
      });

      // Act
      const payload = verifyToken('expired.token');

      // Assert
      expect(payload).toBeNull();
    });
  });
});