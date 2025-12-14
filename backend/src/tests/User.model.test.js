const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { connectDB, disconnectDB, clearDB } = require('../config/database');
const User = require('../models/User');

/**
 * Test Suite: User Model
 * Following TDD approach: Red -> Green -> Refactor
 */
describe('User Model Tests', () => {
  
  // Connect to test database before all tests
  beforeAll(async () => {
    await connectDB();
  });

  // Clear database before each test
  beforeEach(async () => {
    await clearDB();
  });

  // Disconnect from database after all tests
  afterAll(async () => {
    await disconnectDB();
  });

  /**
   * Test 1: Create a valid user
   */
  describe('Creating a new user', () => {
    
    it('should create a user successfully with valid data', async () => {
      // Arrange: Prepare test data
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
        role: 'customer'
      };

      // Act: Create the user
      const user = new User(userData);
      const savedUser = await user.save();

      // Assert: Verify the user was created correctly
      expect(savedUser._id).toBeDefined();
      expect(savedUser.name).toBe(userData.name);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.role).toBe(userData.role);
      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
      
      // Password should be hashed (not plain text)
      expect(savedUser.password).not.toBe(userData.password);
      expect(savedUser.password).toHaveLength(60); // bcrypt hash length
    });

    /**
     * Test 2: User email validation
     */
    it('should fail when email is missing', async () => {
      // Arrange: Prepare invalid data (no email)
      const userData = {
        name: 'John Doe',
        password: 'Password123!',
        role: 'customer'
      };

      // Act & Assert: Should throw validation error
      const user = new User(userData);
      let error;
      try {
        await user.save();
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(error.errors.email).toBeDefined();
    });

    /**
     * Test 3: Email should be unique
     */
    it('should not allow duplicate email addresses', async () => {
      // Arrange: Create first user
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
        role: 'customer'
      };

      const firstUser = new User(userData);
      await firstUser.save();

      // Wait for index creation
      await new Promise(resolve => setTimeout(resolve, 100));

      // Act & Assert: Try to create second user with same email
      const secondUser = new User(userData);
      let error;
      try {
        await secondUser.save();
      } catch (err) {
        error = err;
      }
      
      expect(error).toBeDefined();
      expect(error.name).toBe('MongoServerError');
      expect(error.code).toBe(11000); // MongoDB duplicate key error
    });

    /**
     * Test 4: Password validation
     */
    it('should fail when password is too short', async () => {
      // Arrange: Prepare invalid data (short password)
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123', // Too short
        role: 'customer'
      };

      // Act & Assert
      const user = new User(userData);
      let error;
      try {
        await user.save();
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(error.errors.password).toBeDefined();
    });

    /**
     * Test 5: Role validation
     */
    it('should fail with invalid role', async () => {
      // Arrange: Prepare invalid data (wrong role)
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
        role: 'invalid_role' // Not in enum
      };

      // Act & Assert
      const user = new User(userData);
      let error;
      try {
        await user.save();
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(error.errors.role).toBeDefined();
    });

    /**
     * Test 6: Email format validation
     */
    it('should fail with invalid email format', async () => {
      // Arrange: Prepare invalid data (wrong email format)
      const userData = {
        name: 'John Doe',
        email: 'not-an-email', // Invalid format
        password: 'Password123!',
        role: 'customer'
      };

      // Act & Assert
      const user = new User(userData);
      let error;
      try {
        await user.save();
      } catch (err) {
        error = err;
      }
      expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(error.errors.email).toBeDefined();
    });
  });

  /**
   * Test 7: Password hashing
   */
  describe('Password Hashing', () => {
    
    it('should hash password before saving', async () => {
      // Arrange
      const plainPassword = 'MySecurePassword123!';
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: plainPassword,
        role: 'customer'
      };

      // Act
      const user = new User(userData);
      await user.save();

      // Assert: Password should be hashed
      expect(user.password).not.toBe(plainPassword);
      expect(user.password).toMatch(/^\$2[ayb]\$.{56}$/); // bcrypt pattern
    });

    it('should not re-hash password if not modified', async () => {
      // Arrange
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        role: 'customer'
      };

      const user = new User(userData);
      await user.save();
      const originalHash = user.password;

      // Act: Update name only (not password)
      user.name = 'Updated Name';
      await user.save();

      // Assert: Password hash should remain the same
      expect(user.password).toBe(originalHash);
    });
  });

  /**
   * Test 8: Instance method - comparePassword
   */
  describe('Instance Methods', () => {
    
    it('should return true for correct password', async () => {
      // Arrange
      const plainPassword = 'CorrectPassword123!';
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: plainPassword,
        role: 'customer'
      };

      const user = new User(userData);
      await user.save();

      // Act & Assert
      const isMatch = await user.comparePassword(plainPassword);
      expect(isMatch).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      // Arrange
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'CorrectPassword123!',
        role: 'customer'
      };

      const user = new User(userData);
      await user.save();

      // Act & Assert
      const isMatch = await user.comparePassword('WrongPassword123!');
      expect(isMatch).toBe(false);
    });
  });

  /**
   * Test 9: Default role
   */
  describe('Default Values', () => {
    
    it('should default role to "customer" if not provided', async () => {
      // Arrange
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!'
        // No role specified
      };

      // Act
      const user = new User(userData);
      await user.save();

      // Assert
      expect(user.role).toBe('customer');
    });
  });

  /**
   * Test 10: Email normalization
   */
  describe('Email Normalization', () => {
    
    it('should convert email to lowercase', async () => {
      // Arrange
      const userData = {
        name: 'Test User',
        email: 'TEST@EXAMPLE.COM', // Uppercase
        password: 'Password123!',
        role: 'customer'
      };

      // Act
      const user = new User(userData);
      await user.save();

      // Assert
      expect(user.email).toBe('test@example.com'); // Lowercase
    });

    it('should trim whitespace from email', async () => {
      // Arrange
      const userData = {
        name: 'Test User',
        email: '  test@example.com  ', // With spaces
        password: 'Password123!',
        role: 'customer'
      };

      // Act
      const user = new User(userData);
      await user.save();

      // Assert
      expect(user.email).toBe('test@example.com'); // Trimmed
    });
  });
});