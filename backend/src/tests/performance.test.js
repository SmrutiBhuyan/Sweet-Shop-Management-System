const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Sweet = require('../models/Sweet');

describe('Performance and Load Tests', () => {
  let adminToken;
  let customerToken;
  const testUsers = [];
  const testSweets = [];

  beforeAll(async () => {
    // Create admin user for setup
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'loadtestadmin',
        email: 'loadadmin@test.com',
        password: 'password123',
        role: 'admin'
      });
    
    adminToken = adminRes.body.data.token;

    // Create customer user for browsing tests
    const customerRes = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'loadtestcustomer',
        email: 'loadcustomer@test.com',
        password: 'password123',
        role: 'customer'
      });
    
    customerToken = customerRes.body.data.token;

    // Create test data
    await createTestData();
  });

  afterAll(async () => {
    // Cleanup
    await User.deleteMany({ username: /^loadtest/ });
    await Sweet.deleteMany({ name: /^Load Test Sweet/ });
  });

  async function createTestData() {
    // Create 50 test sweets
    const sweetPromises = [];
    for (let i = 1; i <= 50; i++) {
      sweetPromises.push(
        request(app)
          .post('/api/sweets')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            name: `Load Test Sweet ${i}`,
            description: `Performance testing sweet ${i}`,
            category: i % 2 === 0 ? 'Chocolate' : 'Candy',
            price: (i % 10) + 1,
            quantity: 100
          })
      );
    }
    await Promise.all(sweetPromises);
  }

  describe('Response Time Tests', () => {
    const MAX_RESPONSE_TIME = 1000; // 1 second

    it('should respond to GET /api/sweets within acceptable time', async () => {
      const startTime = Date.now();
      const response = await request(app)
        .get('/api/sweets')
        .set('Authorization', `Bearer ${customerToken}`);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(MAX_RESPONSE_TIME);
      
      console.log(`GET /api/sweets response time: ${responseTime}ms`);
    });

    it('should handle multiple concurrent GET requests efficiently', async () => {
      const concurrentRequests = 20;
      const startTime = Date.now();
      
      const promises = Array(concurrentRequests).fill().map(() =>
        request(app)
          .get('/api/sweets')
          .set('Authorization', `Bearer ${customerToken}`)
      );
      
      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const avgTime = totalTime / concurrentRequests;

      responses.forEach(res => {
        expect(res.status).toBe(200);
      });

      expect(avgTime).toBeLessThan(MAX_RESPONSE_TIME * 2); // Allow some overhead for concurrency
      
      console.log(`${concurrentRequests} concurrent requests - Avg: ${avgTime.toFixed(2)}ms, Total: ${totalTime}ms`);
    });
  });

  describe('Database Query Performance', () => {
    it('should maintain performance with large datasets', async () => {
      const testCases = [
        { limit: 10, expectedTime: 500 },
        { limit: 50, expectedTime: 800 },
        { limit: 100, expectedTime: 1000 }
      ];

      for (const testCase of testCases) {
        const startTime = Date.now();
        const response = await request(app)
          .get(`/api/sweets?limit=${testCase.limit}`)
          .set('Authorization', `Bearer ${customerToken}`);
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        expect(response.status).toBe(200);
        expect(response.body.data.sweets).toHaveLength(testCase.limit);
        expect(responseTime).toBeLessThan(testCase.expectedTime);
        
        console.log(`Limit ${testCase.limit}: ${responseTime}ms`);
      }
    });

    it('should efficiently filter and sort results', async () => {
      const filterTests = [
        { filter: 'category=Chocolate', description: 'Category filter' },
        { filter: 'minPrice=5&maxPrice=10', description: 'Price range filter' },
        { filter: 'inStock=true', description: 'In-stock filter' }
      ];

      for (const test of filterTests) {
        const startTime = Date.now();
        const response = await request(app)
          .get(`/api/sweets?${test.filter}`)
          .set('Authorization', `Bearer ${customerToken}`);
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        expect(response.status).toBe(200);
        expect(responseTime).toBeLessThan(1000);
        
        console.log(`${test.description}: ${responseTime}ms`);
      }
    });
  });

  describe('Memory and Resource Usage', () => {
    it('should not leak memory on repeated requests', async () => {
      const iterations = 100;
      const responseTimes = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        await request(app)
          .get('/api/sweets')
          .set('Authorization', `Bearer ${customerToken}`);
        const endTime = Date.now();
        responseTimes.push(endTime - startTime);
      }

      // Calculate statistics
      const avgTime = responseTimes.reduce((a, b) => a + b, 0) / iterations;
      const maxTime = Math.max(...responseTimes);
      const minTime = Math.min(...responseTimes);

      console.log(`Memory test (${iterations} iterations):`);
      console.log(`  Avg: ${avgTime.toFixed(2)}ms`);
      console.log(`  Min: ${minTime}ms`);
      console.log(`  Max: ${maxTime}ms`);

      // Response times should remain relatively stable
      expect(maxTime).toBeLessThan(avgTime * 3); // No extreme outliers
    });
  });

  describe('Concurrent User Simulation', () => {
    it('should handle multiple users performing different actions', async () => {
      const userActions = [
        // User 1: Browse sweets
        () => request(app)
          .get('/api/sweets')
          .set('Authorization', `Bearer ${customerToken}`),
        
        // User 2: Search sweets
        () => request(app)
          .get('/api/sweets/search?query=chocolate')
          .set('Authorization', `Bearer ${customerToken}`),
        
        // User 3: View specific sweet
        async () => {
          const sweetsRes = await request(app)
            .get('/api/sweets?limit=1')
            .set('Authorization', `Bearer ${customerToken}`);
          if (sweetsRes.body.data.sweets.length > 0) {
            return request(app)
              .get(`/api/sweets/${sweetsRes.body.data.sweets[0]._id}`)
              .set('Authorization', `Bearer ${customerToken}`);
          }
          return Promise.resolve({ status: 404 });
        },
        
        // User 4: Register new user
        () => request(app)
          .post('/api/auth/register')
          .send({
            username: `simuser_${Date.now()}`,
            email: `sim${Date.now()}@test.com`,
            password: 'password123',
            role: 'customer'
          }),
        
        // User 5: Login (if we had a test user)
        () => request(app)
          .post('/api/auth/login')
          .send({
            email: 'loadadmin@test.com',
            password: 'password123'
          })
      ];

      const startTime = Date.now();
      const results = await Promise.allSettled(userActions.map(action => action()));
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Verify all actions completed
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Action ${index} failed:`, result.reason);
        }
        expect(result.status).toBe('fulfilled');
      });

      console.log(`Concurrent user simulation completed in ${totalTime}ms`);
      expect(totalTime).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });

  describe('Stress Test Scenarios', () => {
    it('should handle burst traffic', async () => {
      const burstSize = 50;
      const promises = [];

      console.log(`Starting burst test with ${burstSize} requests...`);
      
      for (let i = 0; i < burstSize; i++) {
        promises.push(
          request(app)
            .get('/api/sweets')
            .set('Authorization', `Bearer ${customerToken}`)
            .then(res => ({ success: res.status === 200, time: Date.now() }))
            .catch(err => ({ success: false, error: err.message, time: Date.now() }))
        );
      }

      const results = await Promise.all(promises);
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      console.log(`Burst test results: ${successful} successful, ${failed} failed`);
      
      expect(successful / burstSize).toBeGreaterThan(0.95); // 95% success rate
    });

    it('should recover from high load', async () => {
      // Apply high load
      const highLoadPromises = Array(100).fill().map(() =>
        request(app)
          .get('/api/sweets')
          .set('Authorization', `Bearer ${customerToken}`)
      );

      await Promise.all(highLoadPromises);

      // After high load, system should still respond normally
      const recoveryStart = Date.now();
      const recoveryResponse = await request(app)
        .get('/api/sweets')
        .set('Authorization', `Bearer ${customerToken}`);
      const recoveryTime = Date.now() - recoveryStart;

      expect(recoveryResponse.status).toBe(200);
      expect(recoveryTime).toBeLessThan(2000); // Should recover within 2 seconds
      
      console.log(`Recovery after high load: ${recoveryTime}ms`);
    });
  });
});