const { request } = require('../_helpers');
const { authService } = require('../../src/services/auth');

describe('🔐 Authentication – Token Revocation', () => {
  let email, password, token;
  beforeAll(async () => {
    email = `revoke-${Date.now()}@example.com`;
    password = 'HS256revoke!';
    await authService.register({ email, password });
    const res = await request()
      .post('/api/v1/auth/login')
      .send({ email, password });
    token = res.body.token;
  });

  test('logout invalidates token', async () => {
    await request()
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    await request()
      .get('/api/v1/protected')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);
  });
});
