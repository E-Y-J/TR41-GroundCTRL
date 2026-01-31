/**
 * Test Utilities and Helpers
 * Common functions for all test suites
 */

const admin = require('firebase-admin');

let appInstance = null;

/**
 * Get or create the test Express app instance
 * @returns {Express} The Express app instance
 */
function getTestApp() {
  if (!appInstance) {
    process.env.NODE_ENV = 'test';
    process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
    process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
    process.env.FIREBASE_WEB_API_KEY = process.env.FIREBASE_WEB_API_KEY || 'test-api-key-for-emulator';

    delete require.cache[require.resolve('../../src/app')];
    appInstance = require('../../src/app');
  }
  return appInstance;
}

/**
 * Generate unique email for testing
 * @param {string} prefix - Email prefix
 * @returns {string} Unique email
 */
function generateUniqueEmail(prefix = 'test') {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}@test.com`;
}

/**
 * Create a test user - FAST VERSION
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} callSign - Optional call sign
 * @returns {Promise<admin.auth.UserRecord>} Created user record
 */
async function createTestUser(email, password = 'TestPassword123!', callSign = null) {
  try {
    // Quick cleanup
    try {
      const existingUser = await admin.auth().getUserByEmail(email);
      await admin.auth().deleteUser(existingUser.uid);
      const db = admin.firestore();
      await db.collection('users').doc(existingUser.uid).delete();
    } catch (error) {
      // User doesn't exist
    }

    // Create auth user
    const userRecord = await admin.auth().createUser({
      email,
      password,
      emailVerified: true,
    });

    // Create Firestore document IMMEDIATELY
    const db = admin.firestore();
    const generatedCallSign = callSign || `TEST${Date.now().toString().slice(-6)}`;
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      callSign: generatedCallSign,
      displayName: `Test User ${generatedCallSign}`,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      isAdmin: false,
      isActive: true,
      status: 'ACTIVE'
    });

    // Minimal wait - emulator is usually fast
    await new Promise(resolve => setTimeout(resolve, 100));

    return userRecord;
  } catch (error) {
    console.error('Error creating test user:', error);
    throw error;
  }
}

/**
 * Delete a test user
 * @param {string} uid - User ID
 */
async function deleteTestUser(uid) {
  try {
    await admin.auth().deleteUser(uid);
    const db = admin.firestore();
    await db.collection('users').doc(uid).delete();
  } catch (error) {
    if (error.code !== 'auth/user-not-found') {
      throw error;
    }
  }
}

/**
 * Generate JWT token
 * @param {string} uid - User ID
 * @returns {Promise<string>} Custom token
 */
async function generateTestToken(uid) {
  return admin.auth().createCustomToken(uid);
}

/**
 * Wait helper
 * @param {number} ms - Milliseconds
 */
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  getTestApp,
  createTestUser,
  deleteTestUser,
  generateTestToken,
  generateUniqueEmail,
  wait
};
