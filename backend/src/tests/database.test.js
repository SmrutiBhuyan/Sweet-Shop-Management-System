const mongoose = require('mongoose');
const connectToDatabase = require('../config/database');
const { MongoMemoryServer } = require('mongodb-memory-server');

describe('Database Connection', () => {
  let mongoServer;

  beforeAll(async () => {
    // Use in-memory MongoDB for testing
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    process.env.MONGODB_URI = mongoUri;
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('Database Connectivity', () => {
    it('should connect to database successfully', async () => {
      const connection = await connectToDatabase();
      expect(connection.readyState).toBe(1); // 1 = connected
    });

    it('should handle connection errors gracefully', async () => {
      // Temporarily break the connection string
      const originalUri = process.env.MONGODB_URI;
      process.env.MONGODB_URI = 'mongodb://invalid:27017/test';
      
      await expect(connectToDatabase()).rejects.toThrow();
      
      // Restore original URI
      process.env.MONGODB_URI = originalUri;
    });
  });

  describe('Connection Events', () => {
    it('should emit connected event', (done) => {
      mongoose.connection.once('connected', () => {
        expect(mongoose.connection.readyState).toBe(1);
        done();
      });
    });

    it('should emit error event on connection failure', (done) => {
      const tempConnection = mongoose.createConnection('mongodb://invalid:27017/test');
      tempConnection.on('error', (err) => {
        expect(err).toBeDefined();
        tempConnection.close();
        done();
      });
    });
  });
});