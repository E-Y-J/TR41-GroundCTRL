/**
 * Leaderboard API Service
 * Handles leaderboard operations via backend API
 */

import api from './httpClient'

/**
 * Get global leaderboard rankings
 * @param {Object} options - Query options
 * @param {string} options.period - Time period ('today', 'week', 'month', 'all-time')
 * @param {number} options.limit - Maximum number of operators to return
 * @param {boolean} options.includeUser - Include authenticated user's rank
 * @returns {Promise<Object>} Leaderboard data with rankings
 */
export async function getGlobalLeaderboard(options = {}) {
  try {
    const { 
      period = 'all-time', 
      limit = 100, 
      includeUser = true 
    } = options

    // Build query string
    const params = new URLSearchParams({
      period,
      limit: limit.toString(),
      includeUser: includeUser.toString()
    })

    const response = await api.get(`/leaderboard/global?${params.toString()}`)
    return response.payload || response
  } catch (error) {
    console.error('Failed to fetch global leaderboard:', error)
    throw new Error(error.message || 'Failed to fetch leaderboard data')
  }
}

/**
 * Get scenario-specific leaderboard
 * @param {string} scenarioId - Scenario ID
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of operators to return
 * @returns {Promise<Object>} Scenario leaderboard data
 */
export async function getScenarioLeaderboard(scenarioId, options = {}) {
  try {
    const { limit = 100 } = options

    const params = new URLSearchParams({
      limit: limit.toString()
    })

    const response = await api.get(`/leaderboard/scenario/${scenarioId}?${params.toString()}`)
    return response.payload || response
  } catch (error) {
    console.error('Failed to fetch scenario leaderboard:', error)
    throw new Error(error.message || 'Failed to fetch scenario leaderboard')
  }
}

/**
 * Get user's rank and statistics
 * @param {string} userId - User ID
 * @param {string} period - Time period filter
 * @returns {Promise<Object>} User rank data
 */
export async function getUserRank(userId, period = 'all-time') {
  try {
    const params = new URLSearchParams({ period })
    const response = await api.get(`/leaderboard/user/${userId}/rank?${params.toString()}`)
    return response.payload || response
  } catch (error) {
    console.error('Failed to fetch user rank:', error)
    throw new Error(error.message || 'Failed to fetch user rank')
  }
}

/**
 * Get operators near user's rank
 * @param {string} userId - User ID
 * @param {number} range - Number of operators above and below (default: 5)
 * @param {string} period - Time period filter
 * @returns {Promise<Array>} Nearby operators
 */
export async function getNearbyOperators(userId, range = 5, period = 'all-time') {
  try {
    const params = new URLSearchParams({ 
      range: range.toString(),
      period 
    })
    const response = await api.get(`/leaderboard/user/${userId}/nearby?${params.toString()}`)
    return response.payload || response
  } catch (error) {
    console.error('Failed to fetch nearby operators:', error)
    throw new Error(error.message || 'Failed to fetch nearby operators')
  }
}

/**
 * Get leaderboard statistics
 * @returns {Promise<Object>} Leaderboard statistics
 */
export async function getLeaderboardStats() {
  try {
    const response = await api.get('/leaderboard/stats')
    return response.payload || response
  } catch (error) {
    console.error('Failed to fetch leaderboard stats:', error)
    throw new Error(error.message || 'Failed to fetch leaderboard statistics')
  }
}
