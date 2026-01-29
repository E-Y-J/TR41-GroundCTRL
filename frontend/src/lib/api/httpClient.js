/**
 * HTTP Client for Backend API
 * Centralized fetch wrapper with authentication and error handling
 */

import { auth } from '../firebase/config'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1'

/**
 * Custom error class for API errors
 */
export class APIError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'APIError'
    this.status = status
    this.data = data
  }
}

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint (e.g., '/users/123')
 * @param {object} options - Fetch options
 * @param {boolean} requiresAuth - Whether the request requires authentication (default: true)
 * @returns {Promise<any>} Response data
 */
export async function apiRequest(endpoint, options = {}, requiresAuth = true) {
  const url = `${API_BASE_URL}${endpoint}`
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  // Add authentication token if required
  if (requiresAuth) {
    const user = auth.currentUser
    if (!user) {
      throw new APIError('Not authenticated', 401, { brief: 'User not logged in' })
    }
    
    try {
      const token = await user.getIdToken()
      headers['Authorization'] = `Bearer ${token}`
    } catch (error) {
      throw new APIError('Failed to get auth token', 401, { brief: error.message })
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    // Parse response
    const data = await response.json().catch(() => ({}))

    // Handle non-OK responses
    if (!response.ok) {
      const errorMessage = data.brief || data.message || `Request failed with status ${response.status}`
      throw new APIError(errorMessage, response.status, data)
    }

    return data
  } catch (error) {
    // Re-throw APIError as-is
    if (error instanceof APIError) {
      throw error
    }

    // Network errors or other fetch errors
    throw new APIError(
      error.message || 'Network request failed',
      0,
      { brief: 'Failed to connect to backend API' }
    )
  }
}

/**
 * Convenience methods for common HTTP verbs
 */
export const api = {
  get: (endpoint, options = {}) => 
    apiRequest(endpoint, { ...options, method: 'GET' }),
  
  post: (endpoint, body, options = {}) => 
    apiRequest(endpoint, { 
      ...options, 
      method: 'POST',
      body: JSON.stringify(body) 
    }),
  
  patch: (endpoint, body, options = {}) => 
    apiRequest(endpoint, { 
      ...options, 
      method: 'PATCH',
      body: JSON.stringify(body) 
    }),
  
  put: (endpoint, body, options = {}) => 
    apiRequest(endpoint, { 
      ...options, 
      method: 'PUT',
      body: JSON.stringify(body) 
    }),
  
  delete: (endpoint, options = {}) => 
    apiRequest(endpoint, { ...options, method: 'DELETE' }),
}

export default api
