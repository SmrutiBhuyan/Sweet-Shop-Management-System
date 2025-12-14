const request = require('supertest');
const app = require('../app');

describe('Basic Performance Tests', () => {
  // Simple performance tests that don't rely on database setup
  
  describe('API Response Times', () => {
    it('should respond to root endpoint quickly', async () => {
      const startTime = Date.now();
      const response = await request(app)
        .get('/')
        .timeout(5000);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
      
      console.log(`Root endpoint response time: ${responseTime}ms`);
    }, 10000);

    it('should handle health check endpoint efficiently', async () => {
      // If you have a health check endpoint
      const startTime = Date.now();
      const response = await request(app)
        .get('/api/health')
        .timeout(5000);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // If health endpoint exists, it should be fast
      if (response.status !== 404) {
        expect(responseTime).toBeLessThan(500);
        console.log(`Health check response time: ${responseTime}ms`);
      }
    }, 10000);
  });

  describe('Concurrent Request Handling', () => {
    it('should handle 5 concurrent requests to root endpoint', async () => {
      const concurrentRequests = 5;
      const startTime = Date.now();
      
      const promises = Array(concurrentRequests).fill().map(() =>
        request(app)
          .get('/')
          .timeout(5000)
      );
      
      const responses = await Promise.allSettled(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Count successful responses
      const successfulResponses = responses.filter(r => 
        r.status === 'fulfilled' && r.value.status === 200
      ).length;

      expect(successfulResponses).toBe(concurrentRequests);
      
      console.log(`${concurrentRequests} concurrent requests completed in ${totalTime}ms`);
    }, 15000);
  });

  describe('Stress Testing', () => {
    it('should handle rapid sequential requests', async () => {
      const requests = 10;
      const responseTimes = [];

      for (let i = 0; i < requests; i++) {
        const startTime = Date.now();
        const response = await request(app)
          .get('/')
          .timeout(3000);
        const endTime = Date.now();
        
        expect(response.status).toBe(200);
        responseTimes.push(endTime - startTime);
        
        // Small delay between requests
        if (i < requests - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      const avgTime = responseTimes.reduce((a, b) => a + b, 0) / requests;
      const maxTime = Math.max(...responseTimes);

      console.log(`Sequential requests (${requests}): Avg ${avgTime.toFixed(2)}ms, Max ${maxTime}ms`);
      
      // Performance should be consistent
      expect(maxTime).toBeLessThan(avgTime * 3); // No extreme outliers
    }, 30000);
  });
});

// Optional: Add database performance tests if you want to test authenticated endpoints
describe('Authenticated Performance Tests (Optional)', () => {
  let testToken;
  
  beforeAll(async () => {
    // Skip if we can't get a token
    try {
      // Try to register a test user
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: `perftest_${Date.now()}`,
          email: `perf_${Date.now()}@test.com`,
          password: 'password123',
          role: 'customer'
        })
        .timeout(5000);

      if (response.status === 201 && response.body.data?.token) {
        testToken = response.body.data.token;
      }
    } catch (error) {
      console.warn('Could not create test user for authenticated tests:', error.message);
    }
  });

  it('should test authenticated endpoint if token is available', async () => {
    if (!testToken) {
      console.log('Skipping authenticated test - no token available');
      return;
    }

    const startTime = Date.now();
    const response = await request(app)
      .get('/api/sweets')
      .set('Authorization', `Bearer ${testToken}`)
      .timeout(5000);
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    if (response.status === 200) {
      expect(responseTime).toBeLessThan(2000);
      console.log(`Authenticated endpoint response time: ${responseTime}ms`);
    }
  }, 10000);
});