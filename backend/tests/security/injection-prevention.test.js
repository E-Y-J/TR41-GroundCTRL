/**
 * Injection Attack Prevention Tests
 * Tests: SEC-001, SEC-004, AI-004
 */

const request = require('supertest');
const { v4: uuidv4 } = require('uuid');
const { getTestApp } = require('../helpers/test-utils');

describe('Injection Prevention - Security Tests', () => {
  let app;
  let authToken;

  beforeAll(async () => {
    // Use the test helper to get app instance
    app = getTestApp();
    // Add delay to ensure emulators are ready
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create test user for authenticated endpoints
    const userData = {
      email: `test-${uuidv4()}@example.com`,
      password: 'TestPassword123!',
      callSign: `TEST-${Date.now()}`,
      displayName: 'Test User',
    };

    const response = await request(app)
      .post('/api/v1/auth/register')
      .send(userData)
      .expect(201);

    authToken = response.body.payload.tokens.accessToken;
  }, 60000); // Increase timeout to 60s

  describe('SEC-001: CallSign Enumeration Prevention', () => {
    it('should return 403 for callSign-based queries without admin access', async () => {
      const response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ callSign: 'KNOWN' })
        .expect(403);

      expect(response.body.payload.error).toHaveProperty('message');
    });
  });

  describe('SEC-004, AI-004: Payload Size and XSS Prevention', () => {
    it('should reject oversized payloads', async () => {
      const largePayload = {
        question: 'A'.repeat(5000),
      };

      const response = await request(app)
        .post('/api/v1/ai/help/ask')
        .set('Authorization', `Bearer ${authToken}`)
        .send(largePayload)
        .expect(400);

      expect(response.body.payload.error.message).toBeTruthy();
    });

    it('should reject malicious script tags', async () => {
      const maliciousPayload = {
        question: '<script>alert(1)</script>',
      };

      const response = await request(app)
        .post('/api/v1/ai/help/ask')
        .set('Authorization', `Bearer ${authToken}`)
        .send(maliciousPayload)
        .expect(400);

      expect(response.body.payload.error).toHaveProperty('message');
    });
  });
});
