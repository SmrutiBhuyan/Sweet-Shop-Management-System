const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Sweet = require('../models/Sweet');
const Purchase = require('../models/Purchase');
const mongoose = require('mongoose');

describe('End-to-End Integration Tests', () => {
  let adminToken;
  let customerToken;
  let adminId;
  let customerId;
  let testSweetId;

  beforeAll(async () => {
    // Ensure database is connected
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sweet_shop_test';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }
    
    // Clear database
    await User.deleteMany({});
    await Sweet.deleteMany({});
    await Purchase.deleteMany({});

    // Create admin user
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'admin',
        email: 'admin@test.com',
        password: 'admin123',
        role: 'admin'
      });

    expect(adminRes.status).toBe(201);
    adminToken = adminRes.body.data.token;
    adminId = adminRes.body.data.user.id;
    expect(adminToken).toBeDefined();
    expect(adminId).toBeDefined();

    // Create customer user
    const customerRes = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'customer',
        email: 'customer@test.com',
        password: 'customer123',
        role: 'customer'
      });

    expect(customerRes.status).toBe(201);
    customerToken = customerRes.body.data.token;
    customerId = customerRes.body.data.user.id;
    expect(customerToken).toBeDefined();
    expect(customerId).toBeDefined();

    // Wait a bit to ensure users are fully persisted
    await new Promise(resolve => setTimeout(resolve, 100));

    // Create a test sweet (requires admin token)
    const sweetRes = await request(app)
      .post('/api/sweets')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('name', 'Integration Test Sweet')
      .field('description', 'Sweet for integration testing')
      .field('category', 'Chocolate')
      .field('price', 9.99)
      .field('quantity', 100);
      // Note: No image file for simplicity

    if (sweetRes.status === 201 && sweetRes.body.data && sweetRes.body.data.sweet) {
      testSweetId = sweetRes.body.data.sweet._id;
    } else {
      // If creation failed, create sweet directly in database as fallback
      console.error('API Sweet creation failed:', sweetRes.body);
      const adminUserFromDb = await User.findOne({ email: 'admin@test.com' });
      if (adminUserFromDb) {
        const directSweet = await Sweet.create({
          name: 'Integration Test Sweet',
          description: 'Sweet for integration testing',
          category: 'Chocolate',
          price: 9.99,
          quantity: 100,
          imageUrl: 'https://via.placeholder.com/300x200?text=Sweet+Image',
          createdBy: adminUserFromDb._id
        });
        testSweetId = directSweet._id;
      } else {
        throw new Error('Failed to create test sweet');
      }
    }
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Sweet.deleteMany({});
    await Purchase.deleteMany({});
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  describe('Complete User Flow', () => {
    it('should complete full user journey: register → login → browse → purchase', async () => {
      // 1. Register new user
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          email: 'newuser@test.com',
          password: 'password123',
          role: 'customer'
        });

      expect(registerRes.status).toBe(201);
      const userToken = registerRes.body.data.token;
      const userId = registerRes.body.data.user.id;

      // 2. Login (optional, but test it)
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'newuser@test.com',
          password: 'password123'
        });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.data.token).toBeDefined();

      // 3. Get user profile
      const profileRes = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${userToken}`);

      expect(profileRes.status).toBe(200);
      expect(profileRes.body.data.user.email).toBe('newuser@test.com');

      // 4. Browse sweets (requires authentication)
      const browseRes = await request(app)
        .get('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`);

      expect(browseRes.status).toBe(200);
      expect(browseRes.body.data.sweets.length).toBeGreaterThan(0);

      // 5. Search sweets (requires authentication)
      const searchRes = await request(app)
        .get('/api/sweets/search?query=chocolate')
        .set('Authorization', `Bearer ${userToken}`);

      expect(searchRes.status).toBe(200);
      expect(searchRes.body.data.sweets).toBeInstanceOf(Array);

      // 6. View specific sweet (requires authentication)
      const sweetRes = await request(app)
        .get(`/api/sweets/${testSweetId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(sweetRes.status).toBe(200);
      expect(sweetRes.body.data.sweet._id).toBe(testSweetId);

      // 7. Purchase sweet (requires authentication)
      const initialQuantity = sweetRes.body.data.sweet.quantity;
      const purchaseRes = await request(app)
        .post(`/api/sweets/${testSweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantityToPurchase: 3 });

      expect(purchaseRes.status).toBe(200);
      expect(purchaseRes.body.data.remainingQuantity).toBe(initialQuantity - 3);
    });
  });

  describe('Admin Flow', () => {
    it('should complete full admin journey: CRUD operations', async () => {
      // 1. Create new sweet (admin only)
      const createRes = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('name', 'Admin Created Sweet')
        .field('description', 'Created by admin during integration test')
        .field('category', 'Candy')
        .field('price', 1.99)
        .field('quantity', 200);

      expect(createRes.status).toBe(201);
      const createdSweetId = createRes.body.data.sweet._id;

      // 2. Update the sweet (admin only)
      const updateRes = await request(app)
        .put(`/api/sweets/${createdSweetId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .field('name', 'Updated Sweet Name')
        .field('category', 'Candy')
        .field('price', 2.49)
        .field('quantity', 180);

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.sweet.name).toBe('Updated Sweet Name');

      // 3. Restock the sweet (admin only)
      const restockRes = await request(app)
        .post(`/api/sweets/${createdSweetId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantityToAdd: 50 });

      expect(restockRes.status).toBe(200);
      expect(restockRes.body.data.newQuantity).toBe(230); // 180 + 50

      // 4. Delete the sweet (admin only)
      const deleteRes = await request(app)
        .delete(`/api/sweets/${createdSweetId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteRes.status).toBe(200);

      // 5. Verify deletion (requires authentication)
      const getRes = await request(app)
        .get(`/api/sweets/${createdSweetId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(getRes.status).toBe(404);
    });
  });

  describe('Authorization Tests', () => {
    it('should prevent customers from creating sweets', async () => {
      const res = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${customerToken}`)
        .field('name', 'Customer Trying to Create')
        .field('category', 'Candy')
        .field('price', 1.99)
        .field('quantity', 10);

      expect(res.status).toBe(403); // Forbidden - customer is not admin
    });

    it('should prevent customers from updating sweets', async () => {
      const res = await request(app)
        .put(`/api/sweets/${testSweetId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .field('name', 'Customer Trying to Update')
        .field('category', 'Candy')
        .field('price', 1.99)
        .field('quantity', 10);

      expect(res.status).toBe(403); // Forbidden
    });

    it('should prevent customers from deleting sweets', async () => {
      const res = await request(app)
        .delete(`/api/sweets/${testSweetId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403); // Forbidden
    });

    it('should prevent customers from restocking', async () => {
      const res = await request(app)
        .post(`/api/sweets/${testSweetId}/restock`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ quantityToAdd: 50 });

      expect(res.status).toBe(403); // Forbidden
    });

    it('should allow all users to purchase', async () => {
      const res = await request(app)
        .post(`/api/sweets/${testSweetId}/purchase`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ quantityToPurchase: 1 });

      expect(res.status).toBe(200); // All authenticated users can purchase
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle purchase with insufficient stock', async () => {
      // First, get current quantity
      const getRes = await request(app)
        .get(`/api/sweets/${testSweetId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      const currentQuantity = getRes.body.data.sweet.quantity;

      // Try to purchase more than available
      const purchaseRes = await request(app)
        .post(`/api/sweets/${testSweetId}/purchase`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ quantityToPurchase: currentQuantity + 10 });

      expect(purchaseRes.status).toBe(400);
      expect(purchaseRes.body.message).toContain('Not enough stock');
    });

   it('should handle invalid purchase quantity', async () => {
  const tests = [
    { quantityToPurchase: 0, expectedStatus: 400 },
    { quantityToPurchase: -1, expectedStatus: 400 },
    { quantityToPurchase: 'not-a-number', expectedStatus: 400 }, // Change from 500 to 400
    { quantityToPurchase: null, expectedStatus: 400 }
  ];

  for (const test of tests) {
    const res = await request(app)
      .post(`/api/sweets/${testSweetId}/purchase`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ quantityToPurchase: test.quantityToPurchase });

    expect(res.status).toBe(test.expectedStatus);
  }
});

    it('should handle invalid sweet ID', async () => {
      const invalidId = 'invalid-sweet-id';
      
      const res = await request(app)
        .get(`/api/sweets/${invalidId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(400); // Mongoose will throw error for invalid ObjectId
    });

    it('should handle non-existent sweet', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011'; // Valid ObjectId but doesn't exist
      
      const res = await request(app)
        .get(`/api/sweets/${nonExistentId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Sweet not found');
    });
  });

  describe('Performance Tests', () => {
    it('should handle multiple requests efficiently', async () => {
      const startTime = Date.now();
      const requests = Array(10).fill().map(() =>
        request(app)
          .get('/api/sweets')
          .set('Authorization', `Bearer ${customerToken}`)
      );

      const responses = await Promise.all(requests);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // All requests should succeed
      responses.forEach(res => {
        expect(res.status).toBe(200);
      });

      // Should complete within reasonable time
      expect(duration).toBeLessThan(5000); // 5 seconds for 10 requests

      console.log(`10 parallel requests completed in ${duration}ms`);
    });

    it('should handle pagination correctly', async () => {
      // Create multiple sweets for pagination test
      const createPromises = Array(15).fill().map((_, i) =>
        request(app)
          .post('/api/sweets')
          .set('Authorization', `Bearer ${adminToken}`)
          .field('name', `Pagination Test Sweet ${i + 1}`)
          .field('category', 'Other')
          .field('price', 1.00)
          .field('quantity', 10)
      );

      await Promise.all(createPromises);

      // Test first page
      const page1Res = await request(app)
        .get('/api/sweets?page=1&limit=10')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(page1Res.status).toBe(200);
      expect(page1Res.body.data.sweets).toHaveLength(10);
      expect(page1Res.body.data.pagination.currentPage).toBe(1);
      expect(page1Res.body.data.pagination.totalPages).toBeGreaterThan(1);

      // Test second page
      const page2Res = await request(app)
        .get('/api/sweets?page=2&limit=10')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(page2Res.status).toBe(200);
      expect(page2Res.body.data.pagination.currentPage).toBe(2);
    });
  });
});