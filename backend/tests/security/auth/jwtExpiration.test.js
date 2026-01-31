const { request } = require('../_helpers');
const { authService } = require('../../src/services/auth');
const jwt = require('jsonwebtoken');

describe('🔐 Authentication – JWT Expiration', () => {
  let email, password, uid;
  beforeAll(async () => {
    email = `exp-${Date.now()}@example.com`;
    password = 'HS256exp!';
    const user = await authService.register({ email, password });
    uid = user.uid;
  });

  test('exp - iat ≈ 3600s', async () => {
    const res = await request()
      .post('/api/v1/auth/login')
      .send({ email, password })
      .expect(200);
    const decoded = jwt.decode(res.body.token, { complete: true });
    expect(decoded.payload.exp - decoded.payload.iat).toBeCloseTo(3600, -1);
  });
});
