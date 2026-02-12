/**
 * Beta Signup Controller
 * Handles beta signup requests (no auth required, saves to Firestore collection)
 */

const { getFirestore } = require("../config/firebase");
const logger = require("../utils/logger");
const { ConflictError } = require("../utils/errors");

/**
 * Submit beta signup request
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {Function} next - Express next middleware
 */
async function submitBetaSignup(req, res, next) {
	const db = getFirestore();
	const { email, firstName, lastName, primaryRole, wantsUpdates } = req.body;

	try {
		// Check if email already exists in beta_signups collection
		const existingSignup = await db
			.collection("beta_signups")
			.where("email", "==", email.toLowerCase())
			.limit(1)
			.get();

		if (!existingSignup.empty) {
			throw new ConflictError(
				"This email has already been registered for beta access",
			);
		}

		// Create beta signup document
		const betaSignupData = {
			email: email.toLowerCase(),
			firstName,
			lastName,
			fullName: `${firstName} ${lastName}`,
			primaryRole,
			wantsUpdates: wantsUpdates || false,
			status: "pending", // pending, approved, rejected
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		const docRef = await db.collection("beta_signups").add(betaSignupData);

		logger.info("Beta signup submitted", {
			id: docRef.id,
			email: email.toLowerCase(),
			primaryRole,
		});

		// Return success response
		res.status(201).json({
			id: docRef.id,
			email: betaSignupData.email,
			status: betaSignupData.status,
			message:
				"Your beta access request has been submitted. We'll notify you when approved.",
		});
	} catch (error) {
		next(error);
	}
}

module.exports = {
	submitBetaSignup,
};
