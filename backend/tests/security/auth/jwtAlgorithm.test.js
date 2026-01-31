const { request } = require('../_helpers');
const { authService } = require('../../src/services/auth');
const jwt = require('jsonwebtoken');

describe('🔐 Authentication – JWT Algorithm', () => {
  let email, password;
  beforeAll(() => {
    email = `algo-${Date.now()}@example.com`;
    password = 'HS256pass!';
    return authService.register({ email, password });
  });

  test('token is signed with HS256', async () => {
    const res = await request()
      .post('/api/v1/auth/login')
      .send({ email, password })
      .expect(200);
    const decoded = jwt.decode(res.body.token, { complete: true });
    expect(decoded.header.alg).toBe('HS256');
  });
});
