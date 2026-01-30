/**
 * Centralized HTTP Client (FIXED VERSION)
 * Location: src/utils/httpClient.js
 * 
 * FIXED: Added baseURL configuration for consistent API endpoint handling
 * This ensures all tests and API calls know where the backend API is located
 */

const axios = require('axios');
const logger = require('./logger');
const { AuthError } = require('./errors');

// Retry configuration
const MAX_RETRIES = parseInt(process.env.HTTP_CLIENT_RETRY_ATTEMPTS) || 3;
const BASE_RETRY_DELAY = 1000; // 1 second

/**
 * Sleep utility for retry delays
 * @param {number} ms - Delay in milliseconds
 * @returns {Promise}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate retry delay with exponential backoff and jitter
 * @param {number} retryCount - Current retry attempt (1-based)
 * @returns {number} Delay in milliseconds
 */
function calculateRetryDelay(retryCount) {
  const exponentialDelay = BASE_RETRY_DELAY * Math.pow(2, retryCount - 1);
  const jitter = exponentialDelay * (0.5 + Math.random() * 0.5); // 0.5x to 1.5x
  return Math.min(jitter, 30000); // Cap at 30 seconds
}

/**
 * Determine if an error should be retried
 * @param {Error} error - Axios error
 * @returns {boolean} Whether to retry
 */
function shouldRetry(error) {
  // Retry on network errors, 5xx errors, and timeouts
  return !error.response || // Network errors
         error.response.status >= 500 || // Server errors
         error.code === 'ECONNABORTED' || // Timeout
         error.code === 'ETIMEDOUT';
}

/**
 * Create axios instance with centralized configuration
 * ✅ NOW INCLUDES: baseURL for consistent endpoint routing
 */
const httpClient = axios.create({
  // FIXED: Add baseURL for consistent endpoint routing
  baseURL: process.env.API_BASE_URL || 'http://localhost:8080/api/v1',
  
  timeout: parseInt(process.env.HTTP_CLIENT_TIMEOUT_MS) || 8000,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Request interceptor for logging
 */
httpClient.interceptors.request.use(
  (config) => {
    logger.debug('HTTP Request', {
      method: config.method?.toUpperCase(),
      url: config.url,
      timeout: config.timeout
    });
    return config;
  },
  (error) => {
    logger.error('HTTP Request Error', { error: error.message });
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for logging and error transformation
 */
httpClient.interceptors.response.use(
  (response) => {
    logger.debug('HTTP Response', {
      status: response.status,
      url: response.config.url
    });
    return response;
  },
  async (error) => {
    const config = error.config;

    // If no config or already retried max times, reject
    if (!config || config._retryCount >= MAX_RETRIES) {
      return handleError(error);
    }

    // Initialize retry count
    config._retryCount = config._retryCount || 0;

    // Check if we should retry this error
    if (shouldRetry(error)) {
      config._retryCount += 1;

      const delay = calculateRetryDelay(config._retryCount);

      logger.warn(`HTTP request retry ${config._retryCount}/${MAX_RETRIES}`, {
        url: config.url,
        method: config.method,
        error: error.message,
        delay: `${delay}ms`
      });

      // Wait for the delay
      await sleep(delay);

      // Retry the request
      return httpClient(config);
    }

    // Not retrying, handle the error
    return handleError(error);
  }
);

/**
 * Handle and transform errors
 * @param {Error} error - Axios error
 */
function handleError(error) {
  // Log the error
  logger.error('HTTP Response Error', {
    message: error.message,
    url: error.config?.url,
    status: error.response?.status,
    data: error.response?.data
  });

  // Transform axios errors to application errors
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return Promise.reject(
      new AuthError('Request timeout - authentication service unavailable', 503)
    );
  }

  // Pass through the error for service-level handling
  return Promise.reject(error);
}

module.exports = httpClient;
