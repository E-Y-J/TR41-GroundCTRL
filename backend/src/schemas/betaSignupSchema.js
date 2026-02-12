/**
 * Beta Signup Schema
 * Validation schema for beta signup requests
 */

const { z } = require("zod");

/**
 * Beta Signup Schema
 * Simplified signup without password - saves to Firestore collection
 */
const betaSignupSchema = z
	.object({
		email: z.string().email("Invalid email address"),
		firstName: z
			.string()
			.min(2, "First name must be at least 2 characters")
			.max(50, "First name must not exceed 50 characters")
			.regex(
				/^[a-zA-Z\s'-]+$/,
				"First name can only contain letters, spaces, hyphens, and apostrophes",
			),
		lastName: z
			.string()
			.min(2, "Last name must be at least 2 characters")
			.max(50, "Last name must not exceed 50 characters")
			.regex(
				/^[a-zA-Z\s'-]+$/,
				"Last name can only contain letters, spaces, hyphens, and apostrophes",
			),
		primaryRole: z.string().min(1, "Primary role is required").max(50),
		wantsUpdates: z.boolean().optional().default(false),
	})
	.strict();

module.exports = {
	betaSignupSchema,
};
