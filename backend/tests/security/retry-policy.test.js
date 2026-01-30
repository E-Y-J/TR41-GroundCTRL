/**
 * HTTP Client Retry Policy Test
 * Tests: SEC-XXX (Exponential Backoff and Retry Limits)
 * Ensures proper retry behavior for transient failures
 */

const nock = require('nock');
const httpClient = require('../../src/utils/httpClient');

describe('HTTP Client Retry Policy Tests', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  describe('SEC-XXX: Exponential Backoff and Retry Limits', () => {
    it('should retry failed requests up to maximum attempts', async () => {
      let attemptCount = 0;

      // Mock endpoint that fails twice then succeeds
      nock('http://retry-service.com')
        .get('/unreliable-endpoint')
        .times(2)
        .reply(500, { error: 'Internal Server Error' })
        .get('/unreliable-endpoint')
        .reply(200, { data: 'success' });

      const response = await httpClient.get('http://retry-service.com/unreliable-endpoint');

      expect(response.status).toBe(200);
      expect(response.data.data).toBe('success');
    });

    it('should respect maximum retry limit and fail after exhausting retries', async () => {
      // Mock endpoint that always fails
      nock('http://failing-service.com')
        .get('/always-fails')
        .times(4) // More than MAX_RETRIES
        .reply(500, { error: 'Persistent failure' });

      await expect(
        httpClient.get('http://failing-service.com/always-fails')
      ).rejects.toThrow();
    });

    it('should implement exponential backoff delays', async () => {
      const startTime = Date.now();
      let callTimes = [];

      // Mock endpoint that fails 3 times
      nock('http://backoff-service.com')
        .get('/backoff-test')
        .times(3)
        .reply(500, { error: 'Temporary failure' });

      try {
        await httpClient.get('http://backoff-service.com/backoff-test');
      } catch (error) {
        // Expected to fail after retries
      }

      const totalDuration = Date.now() - startTime;

      // With exponential backoff (1s, 2s, 4s), total should be around 7s
      // Allow some buffer for execution time
      expect(totalDuration).toBeGreaterThan(6000); // At least 6 seconds
      expect(totalDuration).toBeLessThan(10000); // Less than 10 seconds
    });

    it('should not retry on client errors (4xx)', async () => {
      // Mock 400 Bad Request - should not retry
      nock('http://client-error-service.com')
        .get('/bad-request')
        .reply(400, { error: 'Bad Request' });

      await expect(
        httpClient.get('http://client-error-service.com/bad-request')
      ).rejects.toThrow();

      // Verify only one call was made
      expect(nock.isDone()).toBe(true);
    });

    it('should retry on server errors (5xx)', async () => {
      // Mock 500 Internal Server Error - should retry
      nock('http://server-error-service.com')
        .get('/server-error')
        .reply(500, { error: 'Internal Server Error' })
        .get('/server-error')
        .reply(200, { data: 'recovered' });

      const response = await httpClient.get('http://server-error-service.com/server-error');

      expect(response.status).toBe(200);
      expect(response.data.data).toBe('recovered');
    });

    it('should respect HTTP_CLIENT_RETRY_ATTEMPTS environment variable', async () => {
      // Temporarily set retry attempts to 1
      const originalRetries = process.env.HTTP_CLIENT_RETRY_ATTEMPTS;
      process.env.HTTP_CLIENT_RETRY_ATTEMPTS = '1';

      // Reload httpClient to pick up env var
      delete require.cache[require.resolve('../../src/utils/httpClient')];
      const customHttpClient = require('../../src/utils/httpClient');

      // Mock endpoint that fails twice
      nock('http://custom-retry-service.com')
        .get('/custom-retry')
        .reply(500, { error: 'Fail 1' })
        .get('/custom-retry')
        .reply(500, { error: 'Fail 2' });

      await expect(
        customHttpClient.get('http://custom-retry-service.com/custom-retry')
      ).rejects.toThrow();

      // Restore original setting
      process.env.HTTP_CLIENT_RETRY_ATTEMPTS = originalRetries;
    });
  });
});