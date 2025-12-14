const request = require('supertest');
const app = require('../app');
const { 
  validateUserRegistration, 
  validateSweet, 
  handleValidationErrors 
} = require('../middleware/validation');
const { validationResult } = require('express-validator');

describe('Validation Middleware', () => {
  describe('User Registration Validation', () => {
    it('should accept valid user registration data', async () => {
      const req = {
        body: {
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          role: 'customer'
        }
      };

      // Simulate validation middleware chain
      for (const validation of validateUserRegistration) {
        await validation(req, {}, () => {});
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should reject empty username', async () => {
      const req = {
        body: {
          username: '',
          email: 'test@example.com',
          password: 'password123',
          role: 'customer'
        }
      };

      for (const validation of validateUserRegistration) {
        await validation(req, {}, () => {});
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()[0].msg).toContain('Username is required');
    });

    it('should reject short username', async () => {
      const req = {
        body: {
          username: 'ab',
          email: 'test@example.com',
          password: 'password123',
          role: 'customer'
        }
      };

      for (const validation of validateUserRegistration) {
        await validation(req, {}, () => {});
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()[0].msg).toContain('at least 3 characters');
    });

    it('should reject invalid username characters', async () => {
      const req = {
        body: {
          username: 'test user@',
          email: 'test@example.com',
          password: 'password123',
          role: 'customer'
        }
      };

      for (const validation of validateUserRegistration) {
        await validation(req, {}, () => {});
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()[0].msg).toContain('letters, numbers, and underscores');
    });

    it('should reject invalid email', async () => {
      const req = {
        body: {
          username: 'testuser',
          email: 'invalid-email',
          password: 'password123',
          role: 'customer'
        }
      };

      for (const validation of validateUserRegistration) {
        await validation(req, {}, () => {});
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()[0].msg).toContain('valid email');
    });

    it('should normalize email', async () => {
      const req = {
        body: {
          username: 'testuser',
          email: 'TEST@EXAMPLE.COM',
          password: 'password123',
          role: 'customer'
        }
      };

      for (const validation of validateUserRegistration) {
        await validation(req, {}, () => {});
      }

      expect(req.body.email).toBe('test@example.com');
    });

    it('should reject short password', async () => {
      const req = {
        body: {
          username: 'testuser',
          email: 'test@example.com',
          password: '123',
          role: 'customer'
        }
      };

      for (const validation of validateUserRegistration) {
        await validation(req, {}, () => {});
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()[0].msg).toContain('at least 6 characters');
    });

    it('should reject invalid role', async () => {
      const req = {
        body: {
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          role: 'invalid-role'
        }
      };

      for (const validation of validateUserRegistration) {
        await validation(req, {}, () => {});
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()[0].msg).toContain('customer or admin');
    });
  });

  describe('Sweet Validation', () => {
    it('should accept valid sweet data', async () => {
      const req = {
        body: {
          name: 'Test Sweet',
          description: 'A delicious sweet',
          category: 'Chocolate',
          price: 2.99,
          quantity: 50
        }
      };

      for (const validation of validateSweet) {
        await validation(req, {}, () => {});
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(true);
    });

    it('should reject missing name', async () => {
      const req = {
        body: {
          category: 'Chocolate',
          price: 2.99
        }
      };

      for (const validation of validateSweet) {
        await validation(req, {}, () => {});
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()[0].msg).toContain('Sweet name is required');
    });

    it('should reject long name', async () => {
      const longName = 'a'.repeat(101);
      const req = {
        body: {
          name: longName,
          category: 'Chocolate',
          price: 2.99
        }
      };

      for (const validation of validateSweet) {
        await validation(req, {}, () => {});
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()[0].msg).toContain('exceed 100 characters');
    });

    it('should reject long description', async () => {
      const longDesc = 'a'.repeat(501);
      const req = {
        body: {
          name: 'Test Sweet',
          description: longDesc,
          category: 'Chocolate',
          price: 2.99
        }
      };

      for (const validation of validateSweet) {
        await validation(req, {}, () => {});
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()[0].msg).toContain('exceed 500 characters');
    });

    it('should reject invalid category', async () => {
      const req = {
        body: {
          name: 'Test Sweet',
          category: 'InvalidCategory',
          price: 2.99
        }
      };

      for (const validation of validateSweet) {
        await validation(req, {}, () => {});
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()[0].msg).toContain('Invalid category');
    });

    it('should reject negative price', async () => {
      const req = {
        body: {
          name: 'Test Sweet',
          category: 'Chocolate',
          price: -1
        }
      };

      for (const validation of validateSweet) {
        await validation(req, {}, () => {});
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()[0].msg).toContain('Price must be between');
    });

    it('should reject high price', async () => {
      const req = {
        body: {
          name: 'Test Sweet',
          category: 'Chocolate',
          price: 1001
        }
      };

      for (const validation of validateSweet) {
        await validation(req, {}, () => {});
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()[0].msg).toContain('Price must be between');
    });

    it('should reject negative quantity', async () => {
      const req = {
        body: {
          name: 'Test Sweet',
          category: 'Chocolate',
          price: 2.99,
          quantity: -1
        }
      };

      for (const validation of validateSweet) {
        await validation(req, {}, () => {});
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()[0].msg).toContain('cannot be negative');
    });
  });

  describe('handleValidationErrors Middleware', () => {
    it('should call next() if no validation errors', () => {
      const req = {
        body: {}
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();
      
      // Mock validationResult to return empty errors
      jest.spyOn(require('express-validator'), 'validationResult').mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });
      
      handleValidationErrors(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      
      // Restore mock
      jest.restoreAllMocks();
    });

    it('should return 400 with validation errors', () => {
      const req = {
        body: {}
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();
      
      // Mock validationResult to return errors
      jest.spyOn(require('express-validator'), 'validationResult').mockReturnValue({
        isEmpty: () => false,
        array: () => [
          { path: 'username', msg: 'Username is required' }
        ]
      });
      
      handleValidationErrors(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        errors: expect.any(Array)
      });
      expect(next).not.toHaveBeenCalled();
      
      // Restore mock
      jest.restoreAllMocks();
    });
  });
});