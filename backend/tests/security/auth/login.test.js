const { request } = require('../_helpers');
const { authService } = require('../../src/services/auth'); // adjust import if needed
const jwt = require('jsonwebtoken');

describe('🔐 Authentication – login', () => {
  let email, password, uid;

  beforeAll(async () => {
    email = `test-${Date.now()}@example.com`;
    password = 'SecurePass123!';
    const user = await authService.register({ email, password });
    uid = user.uid;
  });

  test('valid credentials return a signed JWT with proper claims', async () => {
    const res = await request()
      .post('/api/v1/auth/login')
      .send({ email, password })
      .expect(200);

    expect(res.body).toHaveProperty('token');
    const decoded = jwt.decode(res.body.token, { complete: true });
    expect(decoded).toBeTruthy();
    expect(decoded.header.alg).toBe('HS256'); // Use HS256 as requested
    expect(decoded.payload.uid).toBe(uid);
    const now = Math.floor(Date.now() / 1000);
    expect(decoded.payload.exp - decoded.payload.iat).toBeCloseTo(3600, -1);
  });
});
