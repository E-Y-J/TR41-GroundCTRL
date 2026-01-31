const { request } = require('../_helpers');

describe('🔐 Authentication – login bad password', () => {
  test('wrong password returns 401', async () => {
    const res = await request()
      .post('/api/v1/auth/login')
      .send({ email: 'notfound@example.com', password: 'wrongpass' })
      .expect(401);
    expect(res.body).toHaveProperty('error');
  });
});
