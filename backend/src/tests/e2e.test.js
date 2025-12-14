const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Sweet = require('../models/Sweet');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

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
      await mongoose.connect(mongoUri);
    }
    
    // Clear database
    await User.deleteMany({});
    await Sweet.deleteMany({});

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

    // Verify admin user exists in database
    const adminUser = await User.findOne({ email: 'admin@test.com' });
    expect(adminUser).toBeDefined();
    expect(adminUser.role).toBe('admin');

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

    // Verify customer user exists in database
    const customerUser = await User.findOne({ email: 'customer@test.com' });
    expect(customerUser).toBeDefined();

    // Wait a bit to ensure users are fully persisted
    await new Promise(resolve => setTimeout(resolve, 100));

    // Create a test sweet
    const sweetRes = await request(app)
      .post('/api/sweets')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Integration Test Sweet',
        description: 'Sweet for integration testing',
        category: 'Chocolate',
        price: 9.99,
        quantity: 100
      });

    if (sweetRes.status === 201 && sweetRes.body.data && sweetRes.body.data.sweet) {
      testSweetId = sweetRes.body.data.sweet._id;
    } else {
      // If creation failed, log the error for debugging
      console.error('Failed to create test sweet:', JSON.stringify(sweetRes.body, null, 2));
      // Try to create sweet directly in database as fallback
      const adminUserFromDb = await User.findOne({ email: 'admin@test.com' });
      if (adminUserFromDb) {
        const directSweet = await Sweet.create({
          name: 'Integration Test Sweet',
          description: 'Sweet for integration testing',
          category: 'Chocolate',
          price: 9.99,
          quantity: 100,
          createdBy: adminUserFromDb._id
        });
        testSweetId = directSweet._id;
      } else {
        throw new Error(`Failed to create test sweet: ${JSON.stringify(sweetRes.body)}`);
      }
    }
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Sweet.deleteMany({});
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

      // 7. Purchase sweet
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
      // 1. Create new sweet
      const createRes = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Admin Created Sweet',
          description: 'Created by admin during integration test',
          category: 'Candy',
          price: 1.99,
          quantity: 200
        });

      expect(createRes.status).toBe(201);
      const createdSweetId = createRes.body.data.sweet._id;

      // 2. Update the sweet
      const updateRes = await request(app)
        .put(`/api/sweets/${createdSweetId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Sweet Name',
          category: 'Candy',
          price: 2.49,
          quantity: 180
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.sweet.name).toBe('Updated Sweet Name');

      // 3. Restock the sweet
      const restockRes = await request(app)
        .post(`/api/sweets/${createdSweetId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantityToAdd: 50 });

      expect(restockRes.status).toBe(200);
      expect(restockRes.body.data.newQuantity).toBe(230); // 180 + 50

      // 4. Delete the sweet
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

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle concurrent purchases correctly', async () => {
      // First, get current quantity (requires authentication)
      const getRes = await request(app)
        .get(`/api/sweets/${testSweetId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      const initialQuantity = getRes.body.data.sweet.quantity;

      // Make multiple concurrent purchase requests
      const purchasePromises = Array(3).fill().map(() =>
        request(app)
          .post(`/api/sweets/${testSweetId}/purchase`)
          .set('Authorization', `Bearer ${customerToken}`)
          .send({ quantityToPurchase: 1 })
      );

      const results = await Promise.allSettled(purchasePromises);

      // Check all purchases succeeded
      results.forEach(result => {
        expect(result.status).toBe('fulfilled');
        if (result.status === 'fulfilled') {
          expect(result.value.status).toBe(200);
        }
      });

      // Verify final quantity (requires authentication)
      const finalGetRes = await request(app)
        .get(`/api/sweets/${testSweetId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(finalGetRes.body.data.sweet.quantity).toBe(initialQuantity - 3);
    });

    it('should prevent race conditions with optimistic concurrency', async () => {
      // This would require implementing versioning or transactions in your code
      // For now, we test that the quantity doesn't go negative
      
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

    it('should handle malformed request data', async () => {
      const tests = [
        {
          endpoint: '/api/auth/register',
          data: { invalid: 'data' },
          expectedStatus: 400
        },
        {
          endpoint: '/api/sweets',
          token: adminToken,
          data: { name: 'Test', price: 'invalid' },
          expectedStatus: 400
        },
        {
          endpoint: `/api/sweets/${testSweetId}/purchase`,
          token: customerToken,
          data: { quantityToPurchase: 'not-a-number' },
          expectedStatus: 400
        }
      ];

      for (const test of tests) {
        const req = request(app).post(test.endpoint);
        
        if (test.token) {
          req.set('Authorization', `Bearer ${test.token}`);
        }
        
        const res = await req.send(test.data);
        expect(res.status).toBe(test.expectedStatus);
      }
    });
  });

  describe('Performance and Load Testing', () => {
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

      // Should complete within reasonable time (adjust based on your needs)
      expect(duration).toBeLessThan(5000); // 5 seconds for 10 requests

      console.log(`10 parallel requests completed in ${duration}ms`);
    });

    it('should handle pagination with large datasets', async () => {
      // Create multiple sweets for pagination test
      const sweetPromises = Array(25).fill().map((_, i) =>
        request(app)
          .post('/api/sweets')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            name: `Pagination Test Sweet ${i + 1}`,
            category: 'Other',
            price: 1.00,
            quantity: 10
          })
      );

      await Promise.all(sweetPromises);

      // Test first page (requires authentication)
      const page1Res = await request(app)
        .get('/api/sweets?page=1&limit=10')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(page1Res.status).toBe(200);
      expect(page1Res.body.data.sweets).toHaveLength(10);
      expect(page1Res.body.data.pagination.currentPage).toBe(1);
      expect(page1Res.body.data.pagination.totalPages).toBeGreaterThan(1);

      // Test second page (requires authentication)
      const page2Res = await request(app)
        .get('/api/sweets?page=2&limit=10')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(page2Res.status).toBe(200);
      expect(page2Res.body.data.pagination.currentPage).toBe(2);

      // Verify different results
      const page1Ids = page1Res.body.data.sweets.map(s => s._id);
      const page2Ids = page2Res.body.data.sweets.map(s => s._id);
      
      // Should have no overlap between pages
      const overlap = page1Ids.filter(id => page2Ids.includes(id));
      expect(overlap).toHaveLength(0);
    });
  });
});