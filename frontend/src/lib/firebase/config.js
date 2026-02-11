import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, connectAuthEmulator } from "firebase/auth"
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore"

/**
 * Firebase Configuration
 * 
 * Ensure you have the following environment variables set in .env:
 * - VITE_FIREBASE_API_KEY
 * - VITE_FIREBASE_AUTH_DOMAIN
 * - VITE_FIREBASE_PROJECT_ID
 * - VITE_FIREBASE_STORAGE_BUCKET
 * - VITE_FIREBASE_MESSAGING_SENDER_ID
 * - VITE_FIREBASE_APP_ID
 * - VITE_FIREBASE_MEASUREMENT_ID
 */

// Firebase config - using environment variables from Vite
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

// Initialize Firebase (singleton pattern to prevent multiple instances)
let app;
let auth;
let db;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  
  // Initialize Firebase services
  auth = getAuth(app);
  db = getFirestore(app);
  
  // Connect to emulators in development
  // EMULATOR MODE DISABLED: Uncomment these lines if you want to use Firebase emulators
  // if (import.meta.env.DEV) {
  //   connectAuthEmulator(auth, "http://localhost:9099")
  //   connectFirestoreEmulator(db, "localhost", 8080)
  // }
  
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.warn('⚠️  Firebase initialization failed:', error.message);
  console.warn('   App will continue without Firebase authentication');
  console.warn('   This is expected in test/CI environments without Firebase credentials');
  
  // Create null exports so imports don't fail
  auth = null;
  db = null;
  app = null;
}

export { auth, db };
export default app;
