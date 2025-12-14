const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Use a test database
const TEST_MONGODB_URI = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/sweet_shop_test';

describe('User Model', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(TEST_MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('Schema Validation', () => {
    it('should create a valid user', async () => {
      const timestamp = Date.now();
      const userData = {
        username: `testuser_${timestamp}`,
        email: `test_${timestamp}@example.com`,
        password: 'password123',
        role: 'customer'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.username).toBe(userData.username);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.role).toBe(userData.role);
      expect(savedUser.createdAt).toBeDefined();
    });

    it('should not save password in plain text', async () => {
      const timestamp = Date.now();
      const userData = {
        username: `testuser_${timestamp}`,
        email: `test_${timestamp}@example.com`,
        password: 'password123'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.password).not.toBe(userData.password);
      expect(savedUser.password).toMatch(/^\$2[ayb]\$.{56}$/); // bcrypt hash pattern
    });

    it('should require username', async () => {
      const timestamp = Date.now();
      const user = new User({
        email: `test_${timestamp}@example.com`,
        password: 'password123'
      });

      await expect(user.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should require unique username', async () => {
      const timestamp = Date.now();
      const uniqueUsername = `testuser_${timestamp}`;
      
      // Create first user
      await User.create({
        username: uniqueUsername,
        email: `test1_${timestamp}@example.com`,
        password: 'password123'
      });

      // Try to create second user with same username
      const user2 = new User({
        username: uniqueUsername,
        email: `test2_${timestamp}@example.com`,
        password: 'password456'
      });

      // Should throw a duplicate key error
      await expect(user2.save()).rejects.toThrow();
    });

    it('should validate email format', async () => {
      const timestamp = Date.now();
      const user = new User({
        username: `testuser_${timestamp}`,
        email: 'invalid-email',
        password: 'password123'
      });

      await expect(user.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should enforce minimum password length', async () => {
      const timestamp = Date.now();
      const user = new User({
        username: `testuser_${timestamp}`,
        email: `test_${timestamp}@example.com`,
        password: '123' // Too short
      });

      await expect(user.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should default role to customer', async () => {
      const timestamp = Date.now();
      const userData = {
        username: `testuser_${timestamp}`,
        email: `test_${timestamp}@example.com`,
        password: 'password123'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.role).toBe('customer');
    });

    it('should enforce enum values for role', async () => {
      const timestamp = Date.now();
      const user = new User({
        username: `testuser_${timestamp}`,
        email: `test_${timestamp}@example.com`,
        password: 'password123',
        role: 'invalid-role'
      });

      await expect(user.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });
  });

  describe('Password Hashing Middleware', () => {
    it('should hash password on save', async () => {
      const timestamp = Date.now();
      const password = 'password123';
      const user = await User.create({
        username: `testuser_${timestamp}`,
        email: `test_${timestamp}@example.com`,
        password: password
      });

      expect(user.password).not.toBe(password);
      expect(await bcrypt.compare(password, user.password)).toBe(true);
    });

    it('should not re-hash password if not modified', async () => {
      const timestamp = Date.now();
      const originalPassword = 'password123';
      const user = await User.create({
        username: `testuser_${timestamp}`,
        email: `test_${timestamp}@example.com`,
        password: originalPassword
      });

      const originalHash = user.password;
      
      // Update non-password field
      user.username = `updateduser_${timestamp}`;
      const updatedUser = await user.save();

      expect(updatedUser.password).toBe(originalHash);
    });

    it('should re-hash password if modified', async () => {
      const timestamp = Date.now();
      const uniqueUsername = `testuser_${timestamp}`;
      const uniqueEmail = `test_${timestamp}@example.com`;
      
      // Create user
      const user = await User.create({
        username: uniqueUsername,
        email: uniqueEmail,
        password: 'password123'
      });

      const originalHash = user.password;
      
      // Update password
      user.password = 'newpassword456';
      const savedUser = await user.save();

      expect(savedUser.password).not.toBe(originalHash);
      expect(await bcrypt.compare('newpassword456', savedUser.password)).toBe(true);
    });
  });

  describe('Instance Methods', () => {
    it('should correctly compare passwords', async () => {
      const timestamp = Date.now();
      const password = 'password123';
      const user = await User.create({
        username: `testuser_${timestamp}`,
        email: `test_${timestamp}@example.com`,
        password: password
      });

      expect(await user.isPasswordMatch(password)).toBe(true);
      expect(await user.isPasswordMatch('wrongpassword')).toBe(false);
    });
  });

  describe('Query Options', () => {
    it('should not return password by default', async () => {
      const timestamp = Date.now();
      const username = `testuser_${timestamp}`;
      await User.create({
        username: username,
        email: `test_${timestamp}@example.com`,
        password: 'password123'
      });

      const foundUser = await User.findOne({ username: username });
      expect(foundUser.password).toBeUndefined();
    });

    it('should return password when explicitly selected', async () => {
      const timestamp = Date.now();
      const username = `testuser_${timestamp}`;
      await User.create({
        username: username,
        email: `test_${timestamp}@example.com`,
        password: 'password123'
      });

      const foundUser = await User.findOne({ username: username }).select('+password');
      expect(foundUser.password).toBeDefined();
    });
  });
});