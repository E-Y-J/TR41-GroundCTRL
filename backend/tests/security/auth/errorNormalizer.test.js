const { request } = require('../_helpers');

describe('🔐 Authentication – Error Normalizer', () => {
  test('same response for user not found vs wrong password', async () => {
    const res1 = await request()
      .post('/api/v1/auth/login')
      .send({ email: 'notfound@example.com', password: 'wrongpass' })
      .expect(401);
    const res2 = await request()
      .post('/api/v1/auth/login')
      .send({ email: 'existing@example.com', password: 'wrongpass' })
      .expect(401);
    expect(res1.body.error).toBe(res2.body.error);
  });
});
