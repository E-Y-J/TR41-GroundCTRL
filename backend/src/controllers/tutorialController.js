/**
 * Tutorial Controller
 *
 * Generates CRUD handlers using the crudFactory pattern with lifecycle hooks
 * Enforces ownership scoping and audit logging
 *
 * All input is pre-validated by the validate middleware before reaching these handlers
 * Validated data is available as req.body, req.query, req.params (standard Express)
 */

const tutorialRepository = require("../repositories/tutorialRepository");
const { createCrudHandlers } = require("../factories/crudFactory");
const logger = require("../utils/logger");
const {
	createTutorialSchema,
	updateTutorialSchema,
	patchTutorialSchema,
} = require("../schemas/tutorialSchemas");

/**
 * Lifecycle hooks for tutorial CRUD operations
 *
 * These hooks are called by the crudFactory at key points in the request lifecycle
 * All hooks receive req with authenticated user data from authenticate middleware
 */
const tutorialHooks = {
	/**
	 * Ownership scoping hook
	 * Ensures non-admins only see their own tutorials or published tutorials
	 * Admins see all tutorials
	 *
	 * Called before getAll to filter results
	 */
	ownershipScope: async (req, _operation, options) => {
		// Admins can see all
		if (req.user?.isAdmin) {
			return options;
		}

		// Non-admins: can see their own tutorials
		if (!req.user?.isAdmin) {
			return { ...options, createdBy: req.user?.id };
		}

		return options;
	},

	/**
	 * Pre-create hook
	 * Enriches tutorial data with user context
	 */
	beforeCreate: async (req, data) => {
		// Data already validated by validate middleware
		logger.debug("Tutorial pre-create validation", {
			tutorialTitle: data.title,
			userId: req.user?.id,
		});
	},

	/**
	 * Post-create hook
	 * Logs successful creation
	 *
	 * Note: The crudFactory will handle response formatting
	 */
	afterCreate: async (req, doc) => {
		logger.info("Tutorial created", {
			tutorialId: doc.id,
			tutorialTitle: doc.title,
			userId: req.user?.id,
		});
	},

	/**
	 * Pre-update hook
	 * Validates update operation
	 */
	beforeUpdate: async (req, data) => {
		logger.debug("Tutorial pre-update validation", {
			tutorialTitle: data.title,
			userId: req.user?.id,
		});
	},

	/**
	 * Post-update hook
	 * Logs successful update
	 */
	afterUpdate: async (req, doc) => {
		logger.info("Tutorial updated", {
			tutorialId: doc.id,
			tutorialTitle: doc.title,
			userId: req.user?.id,
		});
	},

	/**
	 * Pre-patch hook
	 * Validates partial update
	 */
	beforePatch: async (req, data) => {
		logger.debug("Tutorial pre-patch validation", {
			fieldsUpdated: Object.keys(data),
			userId: req.user?.id,
		});
	},

	/**
	 * Post-patch hook
	 * Logs successful patch
	 */
	afterPatch: async (req, doc) => {
		logger.info("Tutorial patched", {
			tutorialId: doc.id,
			userId: req.user?.id,
		});
	},

	/**
	 * Pre-delete hook
	 * Validates deletion
	 */
	beforeDelete: async (req, id) => {
		logger.debug("Tutorial pre-delete validation", {
			tutorialId: id,
			userId: req.user?.id,
		});
	},

	/**
	 * Post-delete hook
	 * Logs successful deletion
	 */
	afterDelete: async (req, doc) => {
		logger.info("Tutorial deleted", {
			tutorialId: doc.id,
			tutorialTitle: doc.title,
			userId: req.user?.id,
		});
	},

	/**
	 * Post-read hook
	 * Applies to both getAll and getOne operations
	 * Useful for enriching data or post-processing
	 *
	 * @param {Array} docs - Always an array (single item for getOne, multiple for getAll)
	 */
	afterRead: async (req, docs) => {
		logger.debug("Tutorials retrieved", {
			count: docs.length,
			userId: req.user?.id,
		});
	},

	/**
	 * Custom audit metadata builder
	 * Enriches audit log with additional context
	 * Merged into the audit log entry by the factory
	 */
	auditMetadata: async (req, _operation, _result) => {
		return {
			source: "api",
			ipAddress: req.ip,
			userAgent: req.get("user-agent"),
		};
	},
};

/**
 * Generate CRUD handlers using the factory
 *
 * The factory creates handlers that:
 * 1. Apply ownership scoping filter (if not admin)
 * 2. Call beforeX hook
 * 3. Execute repository operation
 * 4. Call afterX hook
 * 5. Format response via responseFactory
 * 6. Log to auditRepository
 *
 * Returns: { getAll, getOne, create, update, patch, delete }
 */
const tutorialHandlers = createCrudHandlers(
	tutorialRepository,
	"tutorial",
	{
		create: createTutorialSchema.shape.body,
		update: updateTutorialSchema.shape.body,
		patch: patchTutorialSchema.shape.body,
	},
	tutorialHooks,
);

/**
 * Custom handler: Get tutorials by scenario ID
 * Returns all tutorials associated with a specific scenario
 */
async function getTutorialsByScenario(req, res, next) {
	try {
		const { scenarioId } = req.params;
		const { isActive, status } = req.query;

		logger.debug("Fetching tutorials for scenario", {
			scenarioId,
			userId: req.user?.id,
		});

		const tutorials = await tutorialRepository.getByScenarioId(scenarioId, {
			isActive:
				isActive === "true" ? true : isActive === "false" ? false : undefined,
			status: status || "PUBLISHED",
		});

		return res.status(200).json({
			status: "GO",
			code: 200,
			brief: "Scenario tutorials retrieved successfully",
			payload: {
				data: {
					tutorials,
					count: tutorials.length,
				},
			},
			telemetry: {
				missionTime: new Date().toISOString(),
				operatorCallSign: req.user?.callSign || "UNKNOWN",
				stationId: "GROUNDCTRL-01",
				requestId: req.id || "N/A",
			},
			timestamp: Date.now(),
		});
	} catch (error) {
		logger.error("Failed to fetch tutorials by scenario", {
			error: error.message,
			scenarioId: req.params.scenarioId,
		});
		next(error);
	}
}

/**
 * Export handlers with user-friendly names
 * Ready to be mounted in route definitions
 *
 * The crudFactory handles:
 * - Request/response validation
 * - Error handling (404s, 403s, 422s)
 * - Pagination
 * - Audit logging
 * - Response formatting
 */
module.exports = {
	list: tutorialHandlers.getAll,
	getOne: tutorialHandlers.getOne,
	create: tutorialHandlers.create,
	update: tutorialHandlers.update,
	patch: tutorialHandlers.patch,
	remove: tutorialHandlers.delete,
	getTutorialsByScenario,
};
