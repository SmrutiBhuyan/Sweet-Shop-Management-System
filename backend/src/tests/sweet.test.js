/**
 * Sweet API Tests
 * 
 * These tests verify that all sweet-related endpoints work correctly.
 * Tests follow TDD principles and cover happy paths, edge cases, and error scenarios.
 */

const request = require('supertest');
const app = require('../app');
const Sweet = require('../models/Sweet');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

describe('Sweet API', () => {
  let adminToken;
  let customerToken;
  let adminUser;
  let customerUser;
  let testSweet;

  // Setup: Create test users before all tests
  beforeAll(async () => {
    // Clear database
    await User.deleteMany({});
    await Sweet.deleteMany({});

    // Create admin user
    adminUser = await User.create({
      username: 'admin',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin'
    });

    // Create customer user
    customerUser = await User.create({
      username: 'customer',
      email: 'customer@test.com',
      password: 'password123',
      role: 'customer'
    });

    // Generate tokens
    adminToken = jwt.sign(
      { userId: adminUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    customerToken = jwt.sign(
      { userId: customerUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Create a test sweet
    testSweet = await Sweet.create({
      name: 'Test Chocolate Bar',
      description: 'A delicious test chocolate bar',
      category: 'Chocolate',
      price: 2.99,
      quantity: 50,
      createdBy: adminUser._id
    });
  });

  // Clean up after each test
  afterEach(async () => {
    // Keep test users and test sweet, but clean up any new sweets created during tests
    await Sweet.deleteMany({ 
      _id: { $ne: testSweet._id } 
    });
  });

  describe('GET /api/sweets', () => {
    it('should get all sweets without authentication', async () => {
      const response = await request(app)
        .get('/api/sweets')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.sweets).toBeInstanceOf(Array);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should filter sweets by category', async () => {
      const response = await request(app)
        .get('/api/sweets?category=Chocolate')
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.sweets.forEach(sweet => {
        expect(sweet.category).toBe('Chocolate');
      });
    });

    it('should filter sweets by price range', async () => {
      const response = await request(app)
        .get('/api/sweets?minPrice=1&maxPrice=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.sweets.forEach(sweet => {
        expect(sweet.price).toBeGreaterThanOrEqual(1);
        expect(sweet.price).toBeLessThanOrEqual(5);
      });
    });
  });

  describe('GET /api/sweets/search', () => {
    it('should search sweets by name', async () => {
      const response = await request(app)
        .get('/api/sweets/search?query=chocolate')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.sweets).toBeInstanceOf(Array);
    });

    it('should return error if query is missing', async () => {
      const response = await request(app)
        .get('/api/sweets/search')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/sweets/:id', () => {
    it('should get a sweet by ID', async () => {
      const response = await request(app)
        .get(`/api/sweets/${testSweet._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.sweet.name).toBe(testSweet.name);
    });

    it('should return 404 for non-existent sweet', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/sweets/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/sweets (Admin Only)', () => {
    it('should create a new sweet as admin', async () => {
      const newSweet = {
        name: 'New Sweet',
        description: 'A new sweet item',
        category: 'Candy',
        price: 1.99,
        quantity: 100
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newSweet)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.sweet.name).toBe(newSweet.name);
    });

    it('should reject sweet creation without authentication', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .send({
          name: 'Unauthorized Sweet',
          category: 'Candy',
          price: 1.99
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject sweet creation by customer', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          name: 'Customer Sweet',
          category: 'Candy',
          price: 1.99
        })
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          // Missing required fields
          description: 'Missing name and category'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/sweets/:id (Admin Only)', () => {
    it('should update a sweet as admin', async () => {
      const updates = {
        name: 'Updated Chocolate Bar',
        price: 3.99,
        quantity: 75
      };

      const response = await request(app)
        .put(`/api/sweets/${testSweet._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.sweet.name).toBe(updates.name);
      expect(response.body.data.sweet.price).toBe(updates.price);
    });

    it('should reject update without authentication', async () => {
      const response = await request(app)
        .put(`/api/sweets/${testSweet._id}`)
        .send({ name: 'Hacked Name' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/sweets/:id (Admin Only)', () => {
    it('should delete a sweet as admin', async () => {
      // Create a sweet to delete
      const sweetToDelete = await Sweet.create({
        name: 'Sweet to Delete',
        category: 'Candy',
        price: 1.99,
        quantity: 10,
        createdBy: adminUser._id
      });

      const response = await request(app)
        .delete(`/api/sweets/${sweetToDelete._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify it's deleted
      const deletedSweet = await Sweet.findById(sweetToDelete._id);
      expect(deletedSweet).toBeNull();
    });

    it('should reject delete without authentication', async () => {
      const response = await request(app)
        .delete(`/api/sweets/${testSweet._id}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/sweets/:id/purchase (Authenticated)', () => {
    it('should allow customer to purchase a sweet', async () => {
      const purchaseQuantity = 5;
      const initialQuantity = testSweet.quantity;

      const response = await request(app)
        .post(`/api/sweets/${testSweet._id}/purchase`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ quantityToPurchase: purchaseQuantity })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.remainingQuantity).toBe(initialQuantity - purchaseQuantity);
    });

    it('should reject purchase without authentication', async () => {
      const response = await request(app)
        .post(`/api/sweets/${testSweet._id}/purchase`)
        .send({ quantityToPurchase: 1 })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject purchase if insufficient stock', async () => {
      // Create a sweet with low stock
      const lowStockSweet = await Sweet.create({
        name: 'Low Stock Sweet',
        category: 'Candy',
        price: 1.99,
        quantity: 2,
        createdBy: adminUser._id
      });

      const response = await request(app)
        .post(`/api/sweets/${lowStockSweet._id}/purchase`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ quantityToPurchase: 10 })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/sweets/:id/restock (Admin Only)', () => {
    it('should allow admin to restock a sweet', async () => {
      const restockQuantity = 25;
      const initialQuantity = testSweet.quantity;

      const response = await request(app)
        .post(`/api/sweets/${testSweet._id}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantityToAdd: restockQuantity })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.newQuantity).toBe(initialQuantity + restockQuantity);
    });

    it('should reject restock without authentication', async () => {
      const response = await request(app)
        .post(`/api/sweets/${testSweet._id}/restock`)
        .send({ quantityToAdd: 10 })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject restock by customer', async () => {
      const response = await request(app)
        .post(`/api/sweets/${testSweet._id}/restock`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ quantityToAdd: 10 })
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });
});

