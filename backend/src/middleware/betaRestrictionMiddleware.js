/**
 * Beta Restriction Middleware
 * Blocks beta users from accessing protected API endpoints
 */

const { AuthError } = require("../utils/errors");
const logger = require("../utils/logger");

/**
 * Middleware to restrict beta users from accessing protected endpoints
 * Beta users can only access:
 * - Auth endpoints (login, logout, token exchange)
 * - Public endpoints
 * 
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
function restrictBetaUsers(req, res, next) {
	try {
		// Check if user is authenticated and has beta role
		if (req.user && req.user.role === "beta") {
			logger.warn("Beta user attempted to access restricted endpoint", {
				userId: req.user.uid,
				callSign: req.callSign,
				endpoint: req.path,
				method: req.method,
			});

			throw new AuthError(
				"Beta access is pending approval. You cannot access this feature yet. Please contact info@missionctrl.org for more information.",
				403
			);
		}

		// User is not beta or not authenticated - allow access
		next();
	} catch (error) {
		next(error);
	}
}

module.exports = {
	restrictBetaUsers,
};
