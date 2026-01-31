const { request } = require('../_helpers');
const { authService } = require('../../src/services/auth');

describe('🔐 Authentication – Refresh Token Reuse', () => {
  let email, password, refreshToken;
  beforeAll(async () => {
    email = `refresh-${Date.now()}@example.com`;
    password = 'HS256refresh!';
    await authService.register({ email, password });
    const res = await request()
      .post('/api/v1/auth/login')
      .send({ email, password });
    refreshToken = res.body.refreshToken;
  });

  test('refresh token can be used only once', async () => {
    const res1 = await request()
      .post('/api/v1/auth/refresh')
      .send({ refreshToken })
      .expect(200);
    await request()
      .post('/api/v1/auth/refresh')
      .send({ refreshToken })
      .expect(401);
  });
});
