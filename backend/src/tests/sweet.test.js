/**
 * Sweet API Tests
 * 
 * These tests verify that all sweet-related endpoints work correctly.
 * Tests follow TDD principles and cover happy paths, edge cases, and error scenarios.
 */

const request = require('supertest');
const mongoose = require('mongoose');
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
    // Connect to test database
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sweet_shop_test';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

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
      { userId: adminUser._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    customerToken = jwt.sign(
      { userId: customerUser._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Create a test sweet for general tests
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
    // Clean up all sweets except the main testSweet
    await Sweet.deleteMany({ 
      _id: { $ne: testSweet._id } 
    });
  });

  // Clean up after all tests
  afterAll(async () => {
    await Sweet.deleteMany({});
    await User.deleteMany({});
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  describe('GET /api/sweets', () => {
    it('should get all sweets with authentication', async () => {
      const response = await request(app)
        .get('/api/sweets')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.sweets).toBeInstanceOf(Array);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get('/api/sweets')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should filter sweets by category', async () => {
      // Create another chocolate sweet for testing
      await Sweet.create({
        name: 'Another Chocolate',
        category: 'Chocolate',
        price: 3.99,
        quantity: 30,
        createdBy: adminUser._id
      });

      const response = await request(app)
        .get('/api/sweets?category=Chocolate')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.sweets.forEach(sweet => {
        expect(sweet.category).toBe('Chocolate');
      });
    });

    it('should filter sweets by price range', async () => {
      const response = await request(app)
        .get('/api/sweets?minPrice=1&maxPrice=5')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      if (response.body.data.sweets.length > 0) {
        response.body.data.sweets.forEach(sweet => {
          expect(sweet.price).toBeGreaterThanOrEqual(1);
          expect(sweet.price).toBeLessThanOrEqual(5);
        });
      }
    });
  });

  describe('GET /api/sweets/search', () => {
    it('should search sweets by name with authentication', async () => {
      const response = await request(app)
        .get('/api/sweets/search?query=chocolate')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.sweets).toBeInstanceOf(Array);
    });

    it('should reject search without authentication', async () => {
      const response = await request(app)
        .get('/api/sweets/search?query=chocolate')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should search sweets by price range', async () => {
      const response = await request(app)
        .get('/api/sweets/search?minPrice=1&maxPrice=5')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.sweets).toBeInstanceOf(Array);
      if (response.body.data.sweets.length > 0) {
        response.body.data.sweets.forEach(sweet => {
          expect(sweet.price).toBeGreaterThanOrEqual(1);
          expect(sweet.price).toBeLessThanOrEqual(5);
        });
      }
    });

    it('should search by name and price range combined', async () => {
      const response = await request(app)
        .get('/api/sweets/search?query=chocolate&minPrice=1&maxPrice=10')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.sweets).toBeInstanceOf(Array);
    });

    it('should return error if no search criteria provided', async () => {
      const response = await request(app)
        .get('/api/sweets/search')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/sweets/:id', () => {
    it('should get a sweet by ID with authentication', async () => {
      const response = await request(app)
        .get(`/api/sweets/${testSweet._id.toString()}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.sweet.name).toBe(testSweet.name);
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get(`/api/sweets/${testSweet._id.toString()}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent sweet', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/sweets/${fakeId.toString()}`)
        .set('Authorization', `Bearer ${customerToken}`)
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
        category: 'Chocolate',
        price: 3.99,
        quantity: 75
      };

      const response = await request(app)
        .put(`/api/sweets/${testSweet._id.toString()}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.sweet.name).toBe(updates.name);
      expect(response.body.data.sweet.price).toBe(updates.price);
    });

    it('should reject update without authentication', async () => {
      const response = await request(app)
        .put(`/api/sweets/${testSweet._id.toString()}`)
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
        .delete(`/api/sweets/${sweetToDelete._id.toString()}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify it's deleted
      const deletedSweet = await Sweet.findById(sweetToDelete._id);
      expect(deletedSweet).toBeNull();
    });

    it('should reject delete without authentication', async () => {
      const response = await request(app)
        .delete(`/api/sweets/${testSweet._id.toString()}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/sweets/:id/purchase (Authenticated)', () => {
    let freshTestSweet;

    beforeEach(async () => {
      // Create a fresh sweet for purchase tests
      freshTestSweet = await Sweet.create({
        name: 'Fresh Chocolate Bar',
        description: 'A fresh test chocolate bar',
        category: 'Chocolate',
        price: 2.99,
        quantity: 50,
        createdBy: adminUser._id
      });
    });

    afterEach(async () => {
      // Clean up the fresh test sweet
      if (freshTestSweet && freshTestSweet._id) {
        await Sweet.deleteOne({ _id: freshTestSweet._id });
      }
    });

    it('should allow customer to purchase a sweet', async () => {
      const purchaseQuantity = 5;
      const initialQuantity = freshTestSweet.quantity;

      const response = await request(app)
        .post(`/api/sweets/${freshTestSweet._id.toString()}/purchase`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ quantityToPurchase: purchaseQuantity })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.remainingQuantity).toBe(initialQuantity - purchaseQuantity);
      
      // Verify the quantity was updated in database
      const updatedSweet = await Sweet.findById(freshTestSweet._id);
      expect(updatedSweet.quantity).toBe(initialQuantity - purchaseQuantity);
    });

    it('should reject purchase without authentication', async () => {
      const response = await request(app)
        .post(`/api/sweets/${freshTestSweet._id.toString()}/purchase`)
        .send({ quantityToPurchase: 1 })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject purchase if insufficient stock', async () => {
      const lowStockSweet = await Sweet.create({
        name: 'Low Stock Sweet',
        category: 'Candy',
        price: 1.99,
        quantity: 2,
        createdBy: adminUser._id
      });

      const response = await request(app)
        .post(`/api/sweets/${lowStockSweet._id.toString()}/purchase`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ quantityToPurchase: 10 })
        .expect(400);

      expect(response.body.success).toBe(false);
      
      // Clean up
      await Sweet.deleteOne({ _id: lowStockSweet._id });
    });
  });

  describe('POST /api/sweets/:id/restock (Admin Only)', () => {
    let freshTestSweet;

    beforeEach(async () => {
      // Create a fresh sweet for restock tests
      freshTestSweet = await Sweet.create({
        name: 'Restock Chocolate Bar',
        description: 'A fresh test chocolate bar for restocking',
        category: 'Chocolate',
        price: 2.99,
        quantity: 50,
        createdBy: adminUser._id
      });
    });

    afterEach(async () => {
      // Clean up the fresh test sweet
      if (freshTestSweet && freshTestSweet._id) {
        await Sweet.deleteOne({ _id: freshTestSweet._id });
      }
    });

    it('should allow admin to restock a sweet', async () => {
      // Get current quantity first
      const getResponse = await request(app)
        .get(`/api/sweets/${freshTestSweet._id.toString()}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      const initialQuantity = getResponse.body.data.sweet.quantity;
      const restockQuantity = 25;

      const response = await request(app)
        .post(`/api/sweets/${freshTestSweet._id.toString()}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantityToAdd: restockQuantity })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.newQuantity).toBe(initialQuantity + restockQuantity);
      
      // Verify the quantity was updated in database
      const updatedSweet = await Sweet.findById(freshTestSweet._id);
      expect(updatedSweet.quantity).toBe(initialQuantity + restockQuantity);
    });

    it('should reject restock without authentication', async () => {
      const response = await request(app)
        .post(`/api/sweets/${freshTestSweet._id.toString()}/restock`)
        .send({ quantityToAdd: 10 })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject restock by customer', async () => {
      const response = await request(app)
        .post(`/api/sweets/${freshTestSweet._id.toString()}/restock`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ quantityToAdd: 10 })
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });
});