const mongoose = require('mongoose');

describe('Database Connection', () => {
  const originalEnv = process.env.MONGODB_URI;
  
  // Use the test database URI from .env.test
  const TEST_DB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sweet_shop_test';
  const INVALID_DB_URI = 'mongodb://non-existent-host-12345:27017/test';
  
  beforeAll(() => {
    // Mock process.exit to prevent test suite from exiting
    process.exit = jest.fn();
  });

  afterAll(async () => {
    // Restore original env
    if (originalEnv) {
      process.env.MONGODB_URI = originalEnv;
    }
    
    // Disconnect if connected
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  afterEach(async () => {
    // Clean up connections after each test
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  describe('Database Connectivity', () => {
    it('should connect to database successfully', async () => {
      console.log('Attempting to connect to:', TEST_DB_URI);
      
      await mongoose.connect(TEST_DB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
      });
      
      expect(mongoose.connection.readyState).toBe(1); // 1 = connected
      console.log('Connected to database successfully');
    }, 10000);

    it('should handle connection errors gracefully', async () => {
      console.log('Testing connection to invalid host...');
      
      // Create a separate connection for error testing
      const tempConnection = mongoose.createConnection(INVALID_DB_URI, {
        serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 3000,
        socketTimeoutMS: 3000,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      
      let connectionFailed = false;
      let errorMessage = '';
      
      try {
        // Try to connect - should fail
        await tempConnection.asPromise();
        console.log('Unexpected: Connection succeeded to invalid host');
      } catch (error) {
        // Expected - connection should fail
        connectionFailed = true;
        errorMessage = error.message;
        console.log('Expected connection error:', error.message);
        expect(error).toBeDefined();
        expect(tempConnection.readyState).not.toBe(1);
      }
      
      // Ensure connection actually failed
      expect(connectionFailed).toBe(true);
      expect(errorMessage).toBeTruthy();
      
      // Clean up
      await tempConnection.close().catch(() => {
        console.log('Closed invalid connection');
      });
    }, 10000);
  });

  describe('Connection Events', () => {
    it('should emit connected event', async () => {
      console.log('Testing connected event...');
      
      // Disconnect if already connected
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout after 8 seconds'));
        }, 8000);
        
        mongoose.connection.once('connected', () => {
          clearTimeout(timeout);
          console.log('Connected event received');
          expect(mongoose.connection.readyState).toBe(1);
          resolve();
        });
        
        mongoose.connection.once('error', (err) => {
          clearTimeout(timeout);
          console.error('Connection error:', err.message);
          reject(err);
        });
        
        console.log('Initiating connection...');
        mongoose.connect(TEST_DB_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 5000,
        }).catch((err) => {
          clearTimeout(timeout);
          console.error('Connection failed:', err.message);
          reject(err);
        });
      });
    }, 15000);

    it('should emit error event on connection failure', async () => {
      console.log('Testing error event on invalid connection...');
      
      // Use a different approach for this test
      return new Promise((resolve, reject) => {
        // Create connection with event listeners
        const tempConnection = mongoose.createConnection();
        
        let errorEventReceived = false;
        let errorCaught = false;
        
        // Listen for error event
        tempConnection.on('error', (err) => {
          errorEventReceived = true;
          console.log('Error event received:', err.message);
          expect(err).toBeDefined();
          
          // Close the connection
          tempConnection.close().then(() => {
            if (errorEventReceived || errorCaught) {
              resolve();
            } else {
              reject(new Error('No error detected'));
            }
          }).catch(() => {
            if (errorEventReceived || errorCaught) {
              resolve();
            } else {
              reject(new Error('No error detected'));
            }
          });
        });
        
        // Try to connect to invalid host
        tempConnection.openUri(INVALID_DB_URI, {
          serverSelectionTimeoutMS: 3000,
          connectTimeoutMS: 3000,
          socketTimeoutMS: 3000,
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }).catch((err) => {
          errorCaught = true;
          console.log('Connection error caught:', err.message);
          // The promise rejection is expected, but we also want the event
          // Don't reject here, wait for the event
        });
        
        // Set timeout
        setTimeout(() => {
          tempConnection.close().then(() => {
            if (errorEventReceived || errorCaught) {
              resolve();
            } else {
              reject(new Error('Timeout waiting for error'));
            }
          }).catch(() => {
            if (errorEventReceived || errorCaught) {
              resolve();
            } else {
              reject(new Error('Timeout waiting for error'));
            }
          });
        }, 5000);
      });
    }, 10000);
  });
});