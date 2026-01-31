/**
 * Security Test: Login Success
 */

const request = require('supertest');
const { getTestApp, createTestUser, generateUniqueEmail } = require('../helpers/test-utils');

describe('Security: Login Success', () => {
  let app;

  beforeAll(async () => {
    app = getTestApp();
  }, 60000);

  test('valid credentials should return JWT with correct claims', async () => {
    const email = generateUniqueEmail('login-success');
    const password = 'TestPassword123!';

    const user = await createTestUser(email, password);

    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toHaveProperty('payload');
    expect(loginResponse.body.payload).toHaveProperty('tokens');
    expect(loginResponse.body.payload.tokens).toHaveProperty('accessToken');

    const token = loginResponse.body.payload.tokens.accessToken;
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);

    const [headerB64, payloadB64] = token.split('.');
    const header = JSON.parse(Buffer.from(headerB64, 'base64').toString('utf8'));
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString('utf8'));

    expect(header.alg).toBe('HS256');
    expect(payload).toHaveProperty('uid');
    expect(payload).toHaveProperty('exp');
    expect(payload).toHaveProperty('iat');

    const now = Math.floor(Date.now() / 1000);
    expect(payload.exp).toBeGreaterThan(now);

    const expectedExp = now + 3600;
    const tolerance = 120;
    expect(payload.exp).toBeGreaterThanOrEqual(expectedExp - tolerance);
    expect(payload.exp).toBeLessThanOrEqual(expectedExp + tolerance);
  });

  test('successful login should return user information', async () => {
    const email = generateUniqueEmail('login-user-info');
    const password = 'TestPassword123!';

    await createTestUser(email, password);

    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password })
      .expect(200);

    expect(loginResponse.body.payload).toHaveProperty('user');
    expect(loginResponse.body.payload.user).toHaveProperty('uid');
    expect(loginResponse.body.payload.user).toHaveProperty('email');
    expect(loginResponse.body.payload.user.email).toBe(email);
  });

  test('login should not leak sensitive data', async () => {
    const email = generateUniqueEmail('login-no-leak');
    const password = 'TestPassword123!';

    await createTestUser(email, password);

    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password })
      .expect(200);

    const responseStr = JSON.stringify(loginResponse.body);
    expect(responseStr).not.toContain(password);
    expect(loginResponse.body.payload.user).not.toHaveProperty('password');
    expect(loginResponse.body.payload.user).not.toHaveProperty('passwordHash');
  });

  test('login token should be usable for authenticated requests', async () => {
    const email = generateUniqueEmail('login-usable-token');
    const password = 'TestPassword123!';

    await createTestUser(email, password);

    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password })
      .expect(200);

    const token = loginResponse.body.payload.tokens.accessToken;

    const authenticatedResponse = await request(app)
      .get('/api/v1/satellites')
      .set('Authorization', `Bearer ${token}`);

    expect(authenticatedResponse.status).not.toBe(401);
    expect([200, 404]).toContain(authenticatedResponse.status);
  });
});
