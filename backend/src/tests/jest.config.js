// Global test setup that runs after Jest environment is set up

// Increase timeout for async operations
jest.setTimeout(30000);

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
    createdBy: userId,
    ...data
  });
};

global.generateTestToken = (userId) => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

// Mock console methods to keep test output clean
const originalConsole = { ...console };

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
  console.log = originalConsole.log;
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
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
  }
});