/**
 * Auth API Service
 * Handles user authentication and profile operations via backend API
 */

import api from './httpClient'

/**
 * Register a new user via backend API
 * @param {object} userData - User registration data
 * @returns {Promise<object>} User data
 */
export async function registerUser(userData) {
  try {
    const response = await api.post('/auth/register', userData, {}, false) // No auth required for registration
    return response.payload || response.user
  } catch (error) {
    console.error('Failed to register user:', error)
    throw new Error(error.message || 'Failed to register user')
  }
}

/**
 * Create/update user profile after Google sign-in
 * @param {object} profileData - User profile data from Google
 * @returns {Promise<object>} User data
 */
export async function syncGoogleProfile(profileData) {
  try {
    // Register Google user via backend (no password for OAuth users)
    const response = await api.post('/auth/register', profileData)
    return response.payload || response.user
  } catch (error) {
    console.error('Failed to sync Google profile:', error)
    throw new Error(error.message || 'Failed to sync user profile')
  }
}

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {object} updates - Profile updates
 * @returns {Promise<object>} Updated user data
 */
export async function updateUserProfile(userId, updates) {
  try {
    const response = await api.patch(`/users/${userId}`, updates)
    return response.payload || response.user
  } catch (error) {
    console.error('Failed to update user profile:', error)
    throw new Error(error.message || 'Failed to update profile')
  }
}

/**
 * Get current user profile
 * @returns {Promise<object>} User data
 */
export async function getCurrentUser() {
  try {
    const response = await api.get('/auth/me')
    return response.payload || response.user
  } catch (error) {
    console.error('Failed to get current user:', error)
    throw new Error(error.message || 'Failed to retrieve user data')
  }
}
