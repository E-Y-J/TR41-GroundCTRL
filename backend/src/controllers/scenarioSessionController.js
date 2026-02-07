/**
 * Scenario Session Controller
 *
 * Generates CRUD handlers using the crudFactory pattern
 * Manages operator training session state and progression
 */

const scenarioSessionRepository = require("../repositories/scenarioSessionRepository");
const tutorialRepository = require("../repositories/tutorialRepository");
const { createCrudHandlers } = require("../factories/crudFactory");
const logger = require("../utils/logger");
const {
	createScenarioSessionSchema,
	updateScenarioSessionSchema,
	patchScenarioSessionSchema,
} = require("../schemas/scenarioSessionSchemas");

const hooks = {
	/**
	 * Ownership scoping hook
	 * Non-admins can only see sessions they created
	 */
	ownershipScope: async (req, operation, options) => {
		if (req.user?.isAdmin) {
			return options;
		}
		return { ...options, user_id: req.user?.uid };
	},

	beforeCreate: async (req, data) => {
		// CRITICAL: Set user_id from authenticated user (not from request body)
		// This is required for Firestore security rules
		data.user_id = req.user?.uid;

		// Snapshot tutorials for this scenario at session start
		try {
			const tutorials = await tutorialRepository.getByScenarioId(
				data.scenario_id,
				{
					isActive: true,
					status: "PUBLISHED",
				},
			);

			// Add tutorials snapshot to session data
			data.tutorialsSnapshot = tutorials.map((tutorial) => ({
				id: tutorial.id,
				code: tutorial.code,
				title: tutorial.title,
				description: tutorial.description,
				icon: tutorial.icon,
				estimatedDurationMinutes: tutorial.estimatedDurationMinutes,
				triggerType: tutorial.triggerType,
				triggerConditions: tutorial.triggerConditions,
				steps: tutorial.steps,
				priority: tutorial.priority,
				tags: tutorial.tags,
			}));

			logger.debug("Session pre-create validation with tutorials snapshot", {
				scenario_id: data.scenario_id,
				userId: req.user?.uid,
				user_id: data.user_id,
				tutorialsCount: tutorials.length,
			});
		} catch (error) {
			logger.warn("Failed to snapshot tutorials for session", {
				scenario_id: data.scenario_id,
				error: error.message,
			});
			// Continue without tutorials snapshot - non-critical error
			data.tutorialsSnapshot = [];
		}
	},

	afterCreate: async (req, doc) => {
		logger.info("Session created", {
			sessionId: doc.id,
			scenario_id: doc.scenario_id,
			userId: req.user?.id,
		});
	},

	auditMetadata: async (req, _operation, _result) => {
		return {
			source: "api",
			ipAddress: req.ip,
			userAgent: req.get("user-agent"),
		};
	},
};

const handlers = createCrudHandlers(
	scenarioSessionRepository,
	"scenarioSession",
	{
		create: createScenarioSessionSchema.shape.body,
		update: updateScenarioSessionSchema.shape.body,
		patch: patchScenarioSessionSchema.shape.body,
	},
	hooks,
);

module.exports = {
	list: handlers.getAll,
	getOne: handlers.getOne,
	create: handlers.create,
	update: handlers.update,
	patch: handlers.patch,
	remove: handlers.delete,
};
