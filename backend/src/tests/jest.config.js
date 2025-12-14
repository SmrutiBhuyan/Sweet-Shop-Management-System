// Global test setup that runs after Jest environment is set up

// Increase timeout for async operations
jest.setTimeout(30000);

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_key_for_testing_only';
process.env.JWT_EXPIRE = '1h';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sweet_shop_test';
process.env.PORT = process.env.PORT || 5001;

// Global test helpers
global.createTestUser = async (role = 'customer') => {
  const User = require('../models/User');
  return await User.create({
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: 'password123',
    role: role
  });
};

global.createTestSweet = async (userId, data = {}) => {
  const Sweet = require('../models/Sweet');
  return await Sweet.create({
    name: data.name || 'Test Sweet',
    description: data.description || 'Test description',
    category: data.category || 'Chocolate',
    price: data.price || 9.99,
    quantity: data.quantity || 50,
    imageUrl: data.imageUrl || 'https://via.placeholder.com/300x200?text=Sweet+Image',
    createdBy: userId,
    ...data
  });
};

global.generateTestToken = (userId) => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'test_jwt_secret_key_for_testing_only',
    { expiresIn: process.env.JWT_EXPIRE || '1h' }
  );
};

// Mock console methods to keep test output clean
const originalConsole = { 
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug
};

beforeAll(() => {
  // Mock console methods but allow them to be called
  // This prevents console spam but still allows debugging
  jest.spyOn(console, 'log').mockImplementation((...args) => {
    // Only show logs if explicitly enabled
    if (process.env.DEBUG_TESTS === 'true') {
      originalConsole.log(...args);
    }
  });
  
  jest.spyOn(console, 'error').mockImplementation((...args) => {
    // Always show errors in tests
    originalConsole.error(...args);
  });
  
  jest.spyOn(console, 'warn').mockImplementation((...args) => {
    if (process.env.DEBUG_TESTS === 'true') {
      originalConsole.warn(...args);
    }
  });
  
  jest.spyOn(console, 'info').mockImplementation(() => {});
  jest.spyOn(console, 'debug').mockImplementation(() => {});
});

afterAll(() => {
  // Restore original console methods
  console.log = originalConsole.log;
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
  console.info = originalConsole.info;
  console.debug = originalConsole.debug;
});

// Global beforeEach to ensure clean state
beforeEach(async () => {
  // Clear any mocks
  jest.clearAllMocks();
});

// Custom matchers
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
  
  toBeValidObjectId(received) {
    const mongoose = require('mongoose');
    const pass = mongoose.Types.ObjectId.isValid(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid ObjectId`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid ObjectId`,
        pass: false,
      };
    }
  },
  
  toBeValidJWT(received) {
    const jwt = require('jsonwebtoken');
    try {
      // Try to decode without verification
      const decoded = jwt.decode(received);
      const pass = decoded !== null && typeof decoded === 'object';
      if (pass) {
        return {
          message: () => `expected ${received} not to be a valid JWT token`,
          pass: true,
        };
      } else {
        return {
          message: () => `expected ${received} to be a valid JWT token`,
          pass: false,
        };
      }
    } catch (error) {
      return {
        message: () => `expected ${received} to be a valid JWT token`,
        pass: false,
      };
    }
  }
});

// Global afterAll to clean up
afterAll(async () => {
  // Close any open database connections
  const mongoose = require('mongoose');
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
});