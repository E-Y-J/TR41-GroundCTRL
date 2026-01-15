/**
 * Firebase Admin SDK Configuration
 * Initializes Firebase Admin for Firestore and Auth operations
 * Supports automatic emulator detection for local testing
 */

const admin = require('firebase-admin');

let isInitialized = false;

/**
 * Check if Firebase emulators should be used
 * @returns {boolean} True if emulator environment variables are set
 */
function useEmulators() {
  return !!(process.env.FIREBASE_AUTH_EMULATOR_HOST || process.env.FIRESTORE_EMULATOR_HOST);
}

/**
 * Initialize Firebase Admin SDK with service account credentials
 * Automatically connects to emulators if environment variables are set
 * @returns {admin} Firebase Admin instance
 */
function initializeFirebase() {
  if (isInitialized) {
    return admin;
  }

  // Sanitize API Key if it has quotes (common .env mistake)
  if (process.env.FIREBASE_API_KEY) {
    process.env.FIREBASE_API_KEY = process.env.FIREBASE_API_KEY.replace(/^"|"$/g, '');
  }

  try {
    const usingEmulators = useEmulators();
    
    if (usingEmulators) {
      // When using emulators, only projectId is needed
      console.log('🧪 Connecting to Firebase Emulators...');
      console.log(`   Auth Emulator: ${process.env.FIREBASE_AUTH_EMULATOR_HOST || 'not set'}`);
      console.log(`   Firestore Emulator: ${process.env.FIRESTORE_EMULATOR_HOST || 'not set'}`);
      
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'groundctrl-staging'
      });
    } else {
      // Production mode - use service account credentials
      const serviceAccount = {
        type: 'service_account',
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || undefined,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n').replace(/^"|"$/g, ''),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID || undefined,
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        universe_domain: 'googleapis.com'
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }

    isInitialized = true;
    console.log(usingEmulators 
      ? '🔥 Firebase Admin SDK initialized with EMULATORS' 
      : '🔥 Firebase Admin SDK initialized successfully');
    return admin;
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    throw new Error(`Firebase initialization failed: ${error.message}`);
  }
}

/**
 * Get Firebase Admin instance
 * @returns {admin} Firebase Admin instance
 */
function getFirebaseAdmin() {
  if (!isInitialized) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  }
  return admin;
}

/**
 * Get Firestore database instance
 * @returns {admin.firestore.Firestore} Firestore instance
 */
function getFirestore() {
  return getFirebaseAdmin().firestore();
}

/**
 * Get Firebase Auth instance
 * @returns {admin.auth.Auth} Auth instance
 */
function getAuth() {
  return getFirebaseAdmin().auth();
}

module.exports = {
  initializeFirebase,
  getFirebaseAdmin,
  getFirestore,
  getAuth
};
