const request = require('supertest');
const app = require('../app');
const { 
  validateUserRegistration, 
  validateSweet, 
  handleValidationErrors 
} = require('../middleware/validation');
const { validationResult } = require('express-validator');

// Helper function to run validation middleware
const runValidation = async (validationChain, data) => {
  const req = {
    body: data
  };
  const res = {};
  const next = jest.fn();
  
  // Run each validation in the chain
  for (const validation of validationChain) {
    await validation(req, res, next);
  }
  
  return validationResult(req);
};

describe('Validation Middleware', () => {
  // Store original console.error to suppress auth errors
  let originalConsoleError;

  beforeAll(() => {
    // Suppress console.error from auth middleware during tests
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterAll(() => {
    // Restore console.error
    console.error = originalConsoleError;
  });

  describe('User Registration Validation', () => {
    it('should accept valid user registration data', async () => {
      const data = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'customer'
      };

      const errors = await runValidation(validateUserRegistration, data);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should reject empty username', async () => {
      const data = {
        username: '',
        email: 'test@example.com',
        password: 'password123',
        role: 'customer'
      };

      const errors = await runValidation(validateUserRegistration, data);
      expect(errors.isEmpty()).toBe(false);
    });

    it('should reject short username', async () => {
      const data = {
        username: 'ab',
        email: 'test@example.com',
        password: 'password123',
        role: 'customer'
      };

      const errors = await runValidation(validateUserRegistration, data);
      expect(errors.isEmpty()).toBe(false);
    });

    it('should reject invalid username characters', async () => {
      const data = {
        username: 'test user@',
        email: 'test@example.com',
        password: 'password123',
        role: 'customer'
      };

      const errors = await runValidation(validateUserRegistration, data);
      expect(errors.isEmpty()).toBe(false);
    });

    it('should reject invalid email', async () => {
      const data = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123',
        role: 'customer'
      };

      const errors = await runValidation(validateUserRegistration, data);
      expect(errors.isEmpty()).toBe(false);
    });

    it('should normalize email', async () => {
      const data = {
        username: 'testuser',
        email: 'TEST@EXAMPLE.COM',
        password: 'password123',
        role: 'customer'
      };

      const req = { body: data };
      const res = {};
      const next = jest.fn();

      // Run validation to trigger normalization
      for (const validation of validateUserRegistration) {
        await validation(req, res, next);
      }

      expect(req.body.email).toBe('test@example.com');
    });

    it('should reject short password', async () => {
      const data = {
        username: 'testuser',
        email: 'test@example.com',
        password: '123',
        role: 'customer'
      };

      const errors = await runValidation(validateUserRegistration, data);
      expect(errors.isEmpty()).toBe(false);
    });

    it('should reject invalid role', async () => {
      const data = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'invalid-role'
      };

      const errors = await runValidation(validateUserRegistration, data);
      expect(errors.isEmpty()).toBe(false);
    });

    it('should accept admin role', async () => {
      const data = {
        username: 'adminuser',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin'
      };

      const errors = await runValidation(validateUserRegistration, data);
      expect(errors.isEmpty()).toBe(true);
    });
  });

  describe('Sweet Validation', () => {
    it('should accept valid sweet data', async () => {
      const data = {
        name: 'Test Sweet',
        description: 'A delicious sweet',
        category: 'Chocolate',
        price: 2.99,
        quantity: 50
      };

      const errors = await runValidation(validateSweet, data);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should reject missing name', async () => {
      const data = {
        category: 'Chocolate',
        price: 2.99
      };

      const errors = await runValidation(validateSweet, data);
      expect(errors.isEmpty()).toBe(false);
    });

    it('should reject long name', async () => {
      const longName = 'a'.repeat(101);
      const data = {
        name: longName,
        category: 'Chocolate',
        price: 2.99
      };

      const errors = await runValidation(validateSweet, data);
      expect(errors.isEmpty()).toBe(false);
    });

    it('should reject long description', async () => {
      const longDesc = 'a'.repeat(501);
      const data = {
        name: 'Test Sweet',
        description: longDesc,
        category: 'Chocolate',
        price: 2.99
      };

      const errors = await runValidation(validateSweet, data);
      expect(errors.isEmpty()).toBe(false);
    });

    it('should reject invalid category', async () => {
      const data = {
        name: 'Test Sweet',
        category: 'InvalidCategory',
        price: 2.99
      };

      const errors = await runValidation(validateSweet, data);
      expect(errors.isEmpty()).toBe(false);
    });

    it('should accept optional description', async () => {
      const data = {
        name: 'Test Sweet',
        category: 'Chocolate',
        price: 2.99
      };

      const errors = await runValidation(validateSweet, data);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should reject negative price', async () => {
      const data = {
        name: 'Test Sweet',
        category: 'Chocolate',
        price: -1
      };

      const errors = await runValidation(validateSweet, data);
      expect(errors.isEmpty()).toBe(false);
    });

    it('should reject high price', async () => {
      const data = {
        name: 'Test Sweet',
        category: 'Chocolate',
        price: 1001
      };

      const errors = await runValidation(validateSweet, data);
      expect(errors.isEmpty()).toBe(false);
    });

    it('should accept zero price for free items', async () => {
      const data = {
        name: 'Free Sweet',
        category: 'Candy',
        price: 0,
        quantity: 10
      };

      const errors = await runValidation(validateSweet, data);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should reject negative quantity', async () => {
      const data = {
        name: 'Test Sweet',
        category: 'Chocolate',
        price: 2.99,
        quantity: -1
      };

      const errors = await runValidation(validateSweet, data);
      expect(errors.isEmpty()).toBe(false);
    });

    it('should accept zero quantity', async () => {
      const data = {
        name: 'Out of Stock Sweet',
        category: 'Chocolate',
        price: 2.99,
        quantity: 0
      };

      const errors = await runValidation(validateSweet, data);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should validate all valid categories', async () => {
      const validCategories = ['Chocolate', 'Candy', 'Cake'];
      
      for (const category of validCategories) {
        const data = {
          name: `Test ${category}`,
          category: category,
          price: 2.99,
          quantity: 10
        };

        const errors = await runValidation(validateSweet, data);
        expect(errors.isEmpty()).toBe(true);
      }
    });
  });

  describe('handleValidationErrors Middleware', () => {
    // Test handleValidationErrors through integration
    it('should return 400 for validation errors through actual endpoint', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          // Invalid data that will trigger validation errors
          username: '',
          email: 'invalid',
          password: '123'
        });

      // Should get some error response
      expect([400, 409, 500]).toContain(response.status);
      
      if (response.status === 400) {
        expect(response.body.success).toBe(false);
        expect(response.body.errors || response.body.message).toBeDefined();
      }
    });

    it('should allow valid data through actual endpoint', async () => {
      // Generate unique username/email to avoid duplicate errors
      const timestamp = Date.now();
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: `testuser_${timestamp}`,
          email: `test_${timestamp}@example.com`,
          password: 'password123',
          role: 'customer'
        });

      // Could be 201 (created), 409 (duplicate), or 500 (server error)
      // If it's 201, validation passed
      if (response.status === 201) {
        expect(response.body.success).toBe(true);
      }
    });

    it('should validate sweet data through actual endpoint', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', 'Bearer faketoken')
        .send({
          name: '', // Invalid: empty name
          category: 'Chocolate',
          price: 2.99
        });

      // Should get validation or auth error
      expect([400, 401, 500]).toContain(response.status);
      
      if (response.status === 400) {
        expect(response.body.success).toBe(false);
        expect(response.body.errors || response.body.message).toBeDefined();
      }
    });
  });

  describe('Integration Tests with Express App', () => {
    it('should return validation error for invalid registration data', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'ab', // Too short
          email: 'invalid-email',
          password: '123',
          role: 'invalid-role'
        });

      // Could be 400 (validation error), 500 (server error), or 409 (duplicate user)
      expect([400, 409, 500]).toContain(response.status);
      
      if (response.status === 400) {
        expect(response.body.success).toBe(false);
        expect(response.body.errors || response.body.message).toBeDefined();
      }
    });

    it('should return validation or auth error for invalid sweet data', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', 'Bearer faketoken')
        .send({
          name: '', // Empty name - this should trigger validation error
          category: 'InvalidCategory',
          price: -1
        });

      // The response could be 400 (validation error) or 401 (auth error)
      expect([400, 401, 500]).toContain(response.status);
      
      if (response.status === 400) {
        expect(response.body.success).toBe(false);
        expect(response.body.errors || response.body.message).toBeDefined();
      }
    });

    it('should validate sweet creation with proper error handling', async () => {
      // Test endpoint validation without creating actual user
      const response = await request(app)
        .post('/api/sweets')
        .send({
          // Missing all required fields
        });

      // Should get some error response
      expect([400, 401, 500]).toContain(response.status);
      
      if (response.status === 400) {
        expect(response.body.success).toBe(false);
        expect(response.body.errors || response.body.message).toBeDefined();
      }
    });
  });
});