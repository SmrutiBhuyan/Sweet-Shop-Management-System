const { MongoMemoryServer } = require('mongodb-memory-server');

// Jest setup file - runs before each test file

// Set test environment
process.env.NODE_ENV = 'test';

// Mock console methods to keep test output clean
global.console = {
  ...console,
  log: jest.fn(),   // Suppress console.log in tests
  error: jest.fn(), // Suppress console.error in tests
  warn: jest.fn(),   // Suppress console.warn in tests
  info: jest.fn()    // Suppress console.info in tests
};

// Increase timeout for database operations
jest.setTimeout(10000);

// Global variables for MongoDB Memory Server
let mongoServer;

// Setup MongoDB Memory Server before all tests
beforeAll(async () => {
  // Start MongoDB Memory Server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Set the test database URI
  process.env.MONGODB_URI_TEST = mongoUri;
  process.env.MONGODB_URI = mongoUri; // Also set main URI for consistency
  
  // Set other required environment variables for tests
  process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';
  process.env.PORT = '5000';
  process.env.FRONTEND_URL = 'http://localhost:5173';
});

// Clean up after all tests
afterAll(async () => {
  if (mongoServer) {
    await mongoServer.stop();
  }
});