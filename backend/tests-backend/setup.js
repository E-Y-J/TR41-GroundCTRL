/**
 * Jest Test Setup
 * Initializes Firebase with emulator configuration before running tests
 */

const app = require('../src/app');
const { initializeFirebase } = require('../src/config/firebase');

let server;

function normalizeEnvDefaults() {
  process.env.NODE_ENV = process.env.NODE_ENV || 'test';
  process.env.PORT = process.env.PORT || '3001';
  process.env.API_BASE_URL = 'http://localhost:3001/api/v1';

  process.env.API_RATE_LIMIT_WINDOW_MS = process.env.API_RATE_LIMIT_WINDOW_MS || '60000';
  process.env.API_RATE_LIMIT_MAX_REQUESTS = process.env.API_RATE_LIMIT_MAX_REQUESTS || '100';
  process.env.LOGIN_RATE_LIMIT_WINDOW_MS = process.env.LOGIN_RATE_LIMIT_WINDOW_MS || '60000';
  process.env.LOGIN_RATE_LIMIT_MAX_REQUESTS = process.env.LOGIN_RATE_LIMIT_MAX_REQUESTS || '5';
  process.env.HTTP_CLIENT_TIMEOUT_MS = process.env.HTTP_CLIENT_TIMEOUT_MS || '8000';

  if (process.env.FIREBASE_AUTH_EMULATOR_HOST?.startsWith('127.0.0.1')) {
    process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
  }
  if (process.env.FIRESTORE_EMULATOR_HOST?.startsWith('127.0.0.1')) {
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
  }
}

// Initialize Firebase Admin SDK before running tests
beforeAll((done) => {
  normalizeEnvDefaults();
  jest.setTimeout(30000);

  console.log('🧪 Initializing Firebase for tests...');
  initializeFirebase();
  console.log('✅ Firebase initialized for test suite');

  const port = parseInt(process.env.PORT, 10);
  server = app.listen(port, () => {
    console.log(`🚀 Test server running on http://localhost:${port}`);
    done();
  });
});

afterAll((done) => {
  if (server) {
    server.close(done);
  } else {
    done();
  }
});
