/**
 * Tutorial Routes
 *
 * CRUD endpoints for tutorial management with ownership scoping
 * All routes protected by authentication
 * Ownership scoping enforced by controller hooks
 */

const express = require("express");
const router = express.Router();
const { validate } = require("../middleware/validate");
const {
	authMiddleware,
	optionalAuth,
} = require("../middleware/authMiddleware");
const tutorialController = require("../controllers/tutorialController");
const {
	createTutorialSchema,
	updateTutorialSchema,
	patchTutorialSchema,
	listTutorialsSchema,
} = require("../schemas/tutorialSchemas");
const { z } = require("zod");

/**
 * GET /api/v1/tutorials
 * List all tutorials (paginated)
 *
 * Query parameters:
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 100)
 * - sortBy: 'createdAt' | 'updatedAt' | 'title' | 'priority' | 'estimatedDurationMinutes' (default: priority)
 * - sortOrder: 'asc' | 'desc' (default: desc)
 * - scenario_id: string (optional filter)
 * - status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' (optional filter)
 * - isActive: 'true' | 'false' (optional filter)
 * - triggerType: 'ON_SCENARIO_START' | 'ON_PANEL_OPEN' | 'ON_COMMAND' | 'MANUAL' (optional filter)
 *
 * Response: 200 OK
 */
router.get(
	"/",
	optionalAuth,
	validate(
		z.object({
			body: z.object({}).strict(),
			query: listTutorialsSchema.shape.query,
			params: z.object({}).strict(),
		}),
	),
	tutorialController.list,
);

/**
 * GET /api/v1/tutorials/:id
 * Get single tutorial by ID
 *
 * Response: 200 OK
 * Errors:
 * - 404 NOT_FOUND: Tutorial doesn't exist
 * - 403 FORBIDDEN: User doesn't own tutorial and is not admin
 */
router.get(
	"/:id",
	optionalAuth,
	validate(
		z.object({
			body: z.object({}).strict(),
			query: z.object({}).strict(),
			params: z
				.object({
					id: z.string().min(1, "Tutorial ID is required"),
				})
				.strict(),
		}),
	),
	tutorialController.getOne,
);

/**
 * GET /api/v1/tutorials/scenario/:scenarioId
 * Get all tutorials for a specific scenario
 *
 * Query parameters:
 * - isActive: 'true' | 'false' (optional, default: true)
 * - status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' (optional, default: PUBLISHED)
 *
 * Response: 200 OK with array of tutorials
 */
router.get(
	"/scenario/:scenarioId",
	optionalAuth,
	validate(
		z.object({
			body: z.object({}).strict(),
			query: z
				.object({
					isActive: z.string().optional(),
					status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
				})
				.strict(),
			params: z
				.object({
					scenarioId: z.string().min(1, "Scenario ID is required"),
				})
				.strict(),
		}),
	),
	tutorialController.getTutorialsByScenario,
);

/**
 * POST /api/v1/tutorials
 * Create new tutorial
 *
 * Body:
 * {
 *   "code": "POWER_MANAGEMENT_INTRO",
 *   "title": "Power Management Tutorial",
 *   "description": "Learn how to manage satellite power systems",
 *   "scenario_id": "scen_123",
 *   "icon": "🔋",
 *   "estimatedDurationMinutes": 5,
 *   "triggerType": "ON_SCENARIO_START",
 *   "steps": [
 *     {
 *       "order": 0,
 *       "title": "Welcome",
 *       "content": "Learn about power management...",
 *       "targetElement": "#power-panel",
 *       "placement": "right",
 *       "isOptional": false
 *     }
 *   ],
 *   "status": "DRAFT",
 *   "isActive": true,
 *   "priority": 50
 * }
 *
 * Response: 201 CREATED
 */
router.post(
	"/",
	authMiddleware,
	validate(
		z.object({
			body: createTutorialSchema.shape.body,
			query: z.object({}).strict(),
			params: z.object({}).strict(),
		}),
	),
	tutorialController.create,
);

/**
 * PUT /api/v1/tutorials/:id
 * Update tutorial (full replacement)
 * Only owner or admin can update
 *
 * Body: Same as POST (all fields required)
 *
 * Response: 200 OK
 * Errors:
 * - 404 NOT_FOUND: Tutorial doesn't exist
 * - 403 FORBIDDEN: User doesn't own tutorial and is not admin
 * - 422 UNPROCESSABLE_ENTITY: Validation failed
 */
router.put(
	"/:id",
	authMiddleware,
	validate(
		z.object({
			body: updateTutorialSchema.shape.body,
			query: z.object({}).strict(),
			params: updateTutorialSchema.shape.params,
		}),
	),
	tutorialController.update,
);

/**
 * PATCH /api/v1/tutorials/:id
 * Partially update tutorial
 * Only owner or admin can patch
 *
 * Body: Partial tutorial data (at least one field required)
 * Example:
 * {
 *   "status": "PUBLISHED",
 *   "isActive": true
 * }
 *
 * Response: 200 OK
 * Errors:
 * - 404 NOT_FOUND: Tutorial doesn't exist
 * - 403 FORBIDDEN: User doesn't own tutorial and is not admin
 * - 422 UNPROCESSABLE_ENTITY: Validation failed or no fields provided
 */
router.patch(
	"/:id",
	authMiddleware,
	validate(
		z.object({
			body: patchTutorialSchema.shape.body,
			query: z.object({}).strict(),
			params: patchTutorialSchema.shape.params,
		}),
	),
	tutorialController.patch,
);

/**
 * DELETE /api/v1/tutorials/:id
 * Delete tutorial
 * Only owner or admin can delete
 *
 * Response: 200 OK
 * Errors:
 * - 404 NOT_FOUND: Tutorial doesn't exist
 * - 403 FORBIDDEN: User doesn't own tutorial and is not admin
 */
router.delete(
	"/:id",
	authMiddleware,
	validate(
		z.object({
			body: z.object({}).strict(),
			query: z.object({}).strict(),
			params: z
				.object({
					id: z.string().min(1, "Tutorial ID is required"),
				})
				.strict(),
		}),
	),
	tutorialController.remove,
);

module.exports = router;
