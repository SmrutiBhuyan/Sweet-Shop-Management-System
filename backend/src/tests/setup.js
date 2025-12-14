// Test setup file for Jest
// This file runs before all tests

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_key_for_testing_only';
process.env.JWT_EXPIRE = '1h';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sweet_shop_test';
process.env.PORT = 5001; // Use different port for tests
process.env.FRONTEND_URL = 'http://localhost:5173';

// Increase timeout for database operations
jest.setTimeout(30000);

