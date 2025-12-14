const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

describe('User Model', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('Schema Validation', () => {
    it('should create a valid user', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
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
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.password).not.toBe(userData.password);
      expect(savedUser.password).toMatch(/^\$2[ayb]\$.{56}$/); // bcrypt hash pattern
    });

    it('should require username', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'password123'
      });

      await expect(user.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should require unique username', async () => {
      const user1 = await User.create({
        username: 'testuser',
        email: 'test1@example.com',
        password: 'password123'
      });

      const user2 = new User({
        username: 'testuser',
        email: 'test2@example.com',
        password: 'password456'
      });

      await expect(user2.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should validate email format', async () => {
      const user = new User({
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123'
      });

      await expect(user.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should enforce minimum password length', async () => {
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: '123' // Too short
      });

      await expect(user.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should default role to customer', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.role).toBe('customer');
    });

    it('should enforce enum values for role', async () => {
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'invalid-role'
      });

      await expect(user.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });
  });

  describe('Password Hashing Middleware', () => {
    it('should hash password on save', async () => {
      const password = 'password123';
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: password
      });

      expect(user.password).not.toBe(password);
      expect(await bcrypt.compare(password, user.password)).toBe(true);
    });

    it('should not re-hash password if not modified', async () => {
      const originalPassword = 'password123';
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: originalPassword
      });

      const originalHash = user.password;
      
      // Update non-password field
      user.username = 'updateduser';
      await user.save();

      expect(user.password).toBe(originalHash);
    });

    it('should re-hash password if modified', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

      const originalHash = user.password;
      user.password = 'newpassword456';
      await user.save();

      expect(user.password).not.toBe(originalHash);
      expect(await bcrypt.compare('newpassword456', user.password)).toBe(true);
    });
  });

  describe('Instance Methods', () => {
    it('should correctly compare passwords', async () => {
      const password = 'password123';
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: password
      });

      expect(await user.isPasswordMatch(password)).toBe(true);
      expect(await user.isPasswordMatch('wrongpassword')).toBe(false);
    });
  });

  describe('Query Options', () => {
    it('should not return password by default', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

      const foundUser = await User.findOne({ username: 'testuser' });
      expect(foundUser.password).toBeUndefined();
    });

    it('should return password when explicitly selected', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

      const foundUser = await User.findOne({ username: 'testuser' }).select('+password');
      expect(foundUser.password).toBeDefined();
    });
  });
});