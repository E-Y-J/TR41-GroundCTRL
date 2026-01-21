/**
 * Password Reset Repository
 * Manages password reset tokens in Firestore
 * 
 * Security Features:
 * - Tokens are hashed before storage (only hash stored, never raw token)
 * - Tokens expire after 15 minutes
 * - One-time use (deleted after successful reset)
 * - Previous tokens invalidated when new request is made
 */

const crypto = require('crypto');
const { getFirestore } = require('../config/firebase');
const logger = require('../utils/logger');

const COLLECTION_NAME = 'password_resets';
const TOKEN_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Hash a token using SHA256
 * @param {string} token - Raw token to hash
 * @returns {string} Hashed token
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Generate a cryptographically secure reset token
 * @returns {string} Random token (64 characters hex)
 */
function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create a password reset record
 * Invalidates any existing reset tokens for the user
 * 
 * @param {string} userId - Firebase UID
 * @param {string} email - User email (for reference)
 * @returns {Promise<string>} Raw reset token (to be sent via email)
 */
async function createResetToken(userId, email) {
  const db = getFirestore();
  
  // Invalidate existing reset tokens for this user
  await invalidateUserTokens(userId);
  
  // Generate new token
  const rawToken = generateResetToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS);
  
  // Store token record
  const resetRecord = {
    userId,
    email,
    tokenHash,
    expiresAt,
    createdAt: new Date(),
    used: false
  };
  
  await db.collection(COLLECTION_NAME).add(resetRecord);
  
  logger.info('Password reset token created', { userId, expiresAt });
  
  // Return raw token (to be sent via email)
  return rawToken;
}

/**
 * Validate a reset token and return associated user info
 * Does NOT consume the token - call consumeToken after password is changed
 * 
 * @param {string} rawToken - Raw token from email link
 * @returns {Promise<object|null>} Token record if valid, null if invalid/expired
 */
async function validateToken(rawToken) {
  const db = getFirestore();
  const tokenHash = hashToken(rawToken);
  
  const snapshot = await db.collection(COLLECTION_NAME)
    .where('tokenHash', '==', tokenHash)
    .where('used', '==', false)
    .limit(1)
    .get();
  
  if (snapshot.empty) {
    logger.debug('Password reset token not found or already used');
    return null;
  }
  
  const doc = snapshot.docs[0];
  const data = doc.data();
  
  // Check expiration
  const expiresAt = data.expiresAt.toDate ? data.expiresAt.toDate() : new Date(data.expiresAt);
  if (expiresAt < new Date()) {
    logger.debug('Password reset token expired', { userId: data.userId });
    return null;
  }
  
  return {
    id: doc.id,
    userId: data.userId,
    email: data.email,
    expiresAt
  };
}

/**
 * Consume (mark as used) a reset token after successful password change
 * 
 * @param {string} rawToken - Raw token that was used
 * @returns {Promise<boolean>} True if token was consumed, false if not found
 */
async function consumeToken(rawToken) {
  const db = getFirestore();
  const tokenHash = hashToken(rawToken);
  
  const snapshot = await db.collection(COLLECTION_NAME)
    .where('tokenHash', '==', tokenHash)
    .limit(1)
    .get();
  
  if (snapshot.empty) {
    return false;
  }
  
  const doc = snapshot.docs[0];
  
  // Delete the token (or mark as used)
  await db.collection(COLLECTION_NAME).doc(doc.id).delete();
  
  logger.info('Password reset token consumed', { userId: doc.data().userId });
  
  return true;
}

/**
 * Invalidate all reset tokens for a user
 * Called when new reset is requested or password is changed via other means
 * 
 * @param {string} userId - Firebase UID
 * @returns {Promise<number>} Number of tokens invalidated
 */
async function invalidateUserTokens(userId) {
  const db = getFirestore();
  
  const snapshot = await db.collection(COLLECTION_NAME)
    .where('userId', '==', userId)
    .where('used', '==', false)
    .get();
  
  if (snapshot.empty) {
    return 0;
  }
  
  const batch = db.batch();
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
  
  logger.debug('Invalidated password reset tokens', { userId, count: snapshot.size });
  
  return snapshot.size;
}

/**
 * Clean up expired reset tokens
 * Should be called periodically (e.g., via cron job)
 * 
 * @returns {Promise<number>} Number of tokens cleaned up
 */
async function cleanupExpiredTokens() {
  const db = getFirestore();
  const now = new Date();
  
  const snapshot = await db.collection(COLLECTION_NAME)
    .where('expiresAt', '<', now)
    .get();
  
  if (snapshot.empty) {
    return 0;
  }
  
  const batch = db.batch();
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
  
  logger.info('Cleaned up expired password reset tokens', { count: snapshot.size });
  
  return snapshot.size;
}

module.exports = {
  createResetToken,
  validateToken,
  consumeToken,
  invalidateUserTokens,
  cleanupExpiredTokens,
  // Export for testing
  hashToken,
  generateResetToken,
  TOKEN_EXPIRY_MS
};