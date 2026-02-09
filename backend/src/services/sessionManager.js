/**
 * Session Manager Service
 * Manages active scenario session states and broadcasts real-time updates
 */

const scenarioSessionRepository = require("../repositories/scenarioSessionRepository");
const logger = require("../utils/logger");

class SessionManager {
	constructor(io, simulationEngine = null) {
		this.io = io;
		this.simulationEngine = simulationEngine;
		this.activeSessions = new Map(); // sessionId -> { state, users: Set }
	}

	/**
	 * User joins a session
	 * @param {string} sessionId - Scenario session ID
	 * @param {string} userId - User ID
	 * @param {object} socket - Socket.IO socket instance
	 * @returns {Promise<object>} Initial session state
	 */
	async joinSession(sessionId, userId, socket) {
		try {
			// Join socket.io room for this session
			socket.join(`session:${sessionId}`);

			// Verify user has access to this session
			const session = await scenarioSessionRepository.getById(sessionId, {
				createdBy: userId,
			});

			if (!session) {
				throw new Error("Session not found or access denied");
			}

			// Initialize or retrieve session state
			if (!this.activeSessions.has(sessionId)) {
				logger.info("🚀 Initializing new session", {
					sessionId,
					hasEngine: !!this.simulationEngine,
					hasSatellite: !!session.satellite,
					satelliteName: session.satellite?.name
				});

				this.activeSessions.set(sessionId, {
					state: session.state || {},
					users: new Set(),
					sessionData: session,
				});

				// Start simulation if engine is available
				if (this.simulationEngine && session.satellite) {
					logger.info("Starting simulation for session", {
						sessionId,
						satellite: session.satellite?.name || "Unknown",
						difficulty: session.scenario?.difficulty || "BEGINNER"
					});

					this.simulationEngine.startSimulation(
						sessionId,
						session.satellite,
						session.state || {},
						session.scenario?.difficulty || "BEGINNER"
					);
				} else {
					logger.warn(
						"Cannot start simulation - missing engine or satellite data",
						{
							sessionId,
							hasEngine: !!this.simulationEngine,
							hasSatellite: !!session.satellite,
						},
					);
				}
			}

			const sessionInfo = this.activeSessions.get(sessionId);
			sessionInfo.users.add(userId);

			logger.info("User joined session", {
				sessionId,
				userId,
				socketId: socket.id,
				activeUsers: sessionInfo.users.size,
			});

			return sessionInfo.state;
		} catch (error) {
			logger.error("Failed to join session", {
				sessionId,
				userId,
				error: error.message,
			});
			throw error;
		}
	}

	/**
	 * Update session state and broadcast to all connected clients
	 * @param {string} sessionId - Scenario session ID
	 * @param {object} stateUpdate - Partial state update
	 */
	updateSessionState(sessionId, stateUpdate) {
		try {
			const sessionInfo = this.activeSessions.get(sessionId);

			if (!sessionInfo) {
				logger.warn("Attempted to update inactive session", { sessionId });
				return;
			}

			// Merge state update
			const currentState = sessionInfo.state || {};
			const newState = { ...currentState, ...stateUpdate };
			sessionInfo.state = newState;

			// Broadcast to all clients in session room
			this.io.to(`session:${sessionId}`).emit("state:update", newState);

			// Log telemetry updates at info level to debug
			if (stateUpdate.telemetry) {
				logger.info("📡 Broadcasting telemetry update", {
					sessionId,
					lat: stateUpdate.telemetry?.orbit?.latitude,
					lon: stateUpdate.telemetry?.orbit?.longitude,
					alt: stateUpdate.telemetry?.orbit?.altitude_km,
					activeUsers: sessionInfo.users.size,
					roomName: `session:${sessionId}`
				});
			} else {
				logger.debug("Session state updated", {
					sessionId,
					updateKeys: Object.keys(stateUpdate),
					activeUsers: sessionInfo.users.size,
				});
			}

			// Persist to database (async, non-blocking)
			scenarioSessionRepository
				.patch(sessionId, { state: newState })
				.catch((err) => {
					logger.error("Failed to persist session state", {
						sessionId,
						error: err.message,
					});
				});
		} catch (error) {
			logger.error("Failed to update session state", {
				sessionId,
				error: error.message,
			});
		}
	}

	/**
	 * User leaves a session
	 * @param {string} sessionId - Scenario session ID
	 * @param {string} userId - User ID
	 * @param {object} socket - Socket.IO socket instance
	 */
	async disconnectFromSession(sessionId, userId, socket) {
		try {
			socket.leave(`session:${sessionId}`);

			const sessionInfo = this.activeSessions.get(sessionId);
			if (sessionInfo) {
				sessionInfo.users.delete(userId);

				logger.info("User left session", {
					sessionId,
					userId,
					socketId: socket.id,
					remainingUsers: sessionInfo.users.size,
				});

				// Clean up session if no users remain
				if (sessionInfo.users.size === 0) {
					// Explicitly save final state before cleanup
					const finalState = sessionInfo.state;
					
					if (finalState) {
						try {
							await scenarioSessionRepository.patch(sessionId, {
								state: finalState,
								last_activity_at: new Date()
							});
							
							logger.info('Final session state saved to Firestore', {
								sessionId,
								hasTelemetry: !!finalState.telemetry,
								elapsedTime: finalState.elapsedTime,
								lat: finalState.telemetry?.orbit?.latitude,
								lon: finalState.telemetry?.orbit?.longitude
							});
						} catch (saveError) {
							logger.error('Failed to save final session state', {
								sessionId,
								error: saveError.message
							});
						}
					}
					
					// Now safe to delete from memory and stop simulation
					this.activeSessions.delete(sessionId);

					// Stop simulation if engine is available
					if (this.simulationEngine) {
						this.simulationEngine.stopSimulation(sessionId);
					}

					logger.info("Session cleaned up (no active users)", { sessionId });
				}
			}
		} catch (error) {
			logger.error("Failed to disconnect from session", {
				sessionId,
				userId,
				error: error.message,
			});
		}
	}

	/**
	 * Get current session state
	 * @param {string} sessionId - Scenario session ID
	 * @returns {object|null} Current session state
	 */
	getSessionState(sessionId) {
		const sessionInfo = this.activeSessions.get(sessionId);
		return sessionInfo ? sessionInfo.state : null;
	}

	/**
	 * Get all active session IDs
	 * @returns {Array<string>} Array of active session IDs
	 */
	getActiveSessions() {
		return Array.from(this.activeSessions.keys());
	}

	/**
	 * Get number of users in a session
	 * @param {string} sessionId - Scenario session ID
	 * @returns {number} Number of active users
	 */
	getSessionUserCount(sessionId) {
		const sessionInfo = this.activeSessions.get(sessionId);
		return sessionInfo ? sessionInfo.users.size : 0;
	}
}

module.exports = SessionManager;
