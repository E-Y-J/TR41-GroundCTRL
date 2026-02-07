/**
 * Tutorial Schemas
 *
 * Zod validation schemas for tutorial CRUD operations
 * Tutorials provide interactive guides for mission scenarios
 */

const { z } = require("zod");

// Tutorial status enum
const tutorialStatusEnum = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

// Tutorial trigger enum - when should this tutorial appear
const triggerTypeEnum = z.enum([
	"ON_SCENARIO_START", // Show when scenario begins
	"ON_PANEL_OPEN", // Show when specific panel is opened
	"ON_COMMAND", // Show when specific command is issued
	"MANUAL", // Only shown when user requests help
]);

// Tutorial step schema
const tutorialStepSchema = z
	.object({
		order: z
			.number()
			.int("Step order must be an integer")
			.min(0, "Step order must be non-negative")
			.describe("Step sequence number (0-indexed)"),

		title: z
			.string()
			.min(1, "Step title is required")
			.max(100, "Step title must be 100 characters or fewer")
			.trim()
			.describe("Step title"),

		content: z
			.string()
			.min(1, "Step content is required")
			.max(1000, "Step content must be 1000 characters or fewer")
			.trim()
			.describe("Step instructions/explanation"),

		targetElement: z
			.string()
			.optional()
			.describe("CSS selector or element ID to highlight"),

		placement: z
			.enum(["top", "bottom", "left", "right", "center"])
			.optional()
			.default("bottom")
			.describe("Tooltip placement relative to target"),

		action: z
			.string()
			.optional()
			.describe("Expected user action to proceed (e.g., click-button, enter-value)"),

		completionCriteria: z
			.object({
				type: z
					.enum(["click", "input", "navigate", "wait", "manual"])
					.describe("How step is marked complete"),
				value: z.string().optional().describe("Expected value or selector"),
				timeout: z
					.number()
					.optional()
					.describe("Auto-advance timeout in seconds"),
			})
			.optional()
			.describe("Criteria for step completion"),

		isOptional: z
			.boolean()
			.default(false)
			.describe("Whether step can be skipped"),
	})
	.strict();

// ---------- CREATE schema ----------

const createTutorialSchema = z
	.object({
		body: z
			.object({
				// Identification
				code: z
					.string()
					.min(1, "Tutorial code is required")
					.max(100, "Tutorial code must be 100 characters or fewer")
					.regex(
						/^[A-Z0-9_]+$/,
						"Tutorial code must be uppercase alphanumeric with underscores",
					)
					.describe("Unique tutorial code (e.g., POWER_MANAGEMENT_INTRO)"),

				title: z
					.string()
					.min(1, "Title is required")
					.max(200, "Title must be 200 characters or fewer")
					.trim()
					.describe("Human-readable tutorial title"),

				description: z
					.string()
					.min(1, "Description is required")
					.max(1000, "Description must be 1000 characters or fewer")
					.trim()
					.describe("Tutorial description and learning objectives"),

				// Scenario association
				scenario_id: z
					.string()
					.min(1, "Scenario ID is required")
					.describe("FK to scenarios.id - tutorial is for this scenario"),

				// Display configuration
				icon: z
					.string()
					.optional()
					.describe("Icon name or emoji for tutorial (e.g., 🚀, 🛰️)"),

				estimatedDurationMinutes: z
					.number()
					.positive("Estimated duration must be positive")
					.max(60, "Estimated duration cannot exceed 60 minutes")
					.default(5)
					.describe("Expected completion time in minutes"),

				// Trigger configuration
				triggerType: triggerTypeEnum
					.default("ON_SCENARIO_START")
					.describe("When this tutorial should be triggered"),

				triggerConditions: z
					.object({
						panelId: z.string().optional().describe("For ON_PANEL_OPEN trigger"),
						commandId: z.string().optional().describe("For ON_COMMAND trigger"),
						customCondition: z
							.string()
							.optional()
							.describe("Custom condition expression"),
					})
					.optional()
					.describe("Additional trigger conditions based on triggerType"),

				// Tutorial steps
				steps: z
					.array(tutorialStepSchema)
					.min(1, "Tutorial must have at least one step")
					.max(20, "Tutorial cannot have more than 20 steps")
					.describe("Tutorial flow steps"),

				// Status & Metadata
				status: tutorialStatusEnum
					.default("DRAFT")
					.describe("Publishing status (DRAFT, PUBLISHED, ARCHIVED)"),

				isActive: z
					.boolean()
					.default(true)
					.describe("Whether tutorial is available for users"),

				priority: z
					.number()
					.int("Priority must be an integer")
					.min(0)
					.max(100)
					.default(50)
					.describe("Display priority (0-100, higher = shown first)"),

				// Optional metadata
				tags: z
					.array(z.string())
					.optional()
					.describe("Tags for filtering (e.g., power, attitude, communications)"),

				prerequisites: z
					.array(z.string())
					.optional()
					.describe("Tutorial IDs that should be completed first"),
			})
			.strict(),
	})
	.strict();

// ---------- UPDATE (full replace) schema ----------

const updateTutorialSchema = z
	.object({
		params: z
			.object({
				id: z
					.string()
					.min(1, "Tutorial ID is required")
					.describe("Tutorial document ID"),
			})
			.strict(),
		body: createTutorialSchema.shape.body,
	})
	.strict();

// ---------- PATCH (partial update) schema ----------

const patchTutorialSchema = z
	.object({
		params: z
			.object({
				id: z
					.string()
					.min(1, "Tutorial ID is required")
					.describe("Tutorial document ID"),
			})
			.strict(),
		body: z
			.object({
				code: createTutorialSchema.shape.body.shape.code.optional(),
				title: createTutorialSchema.shape.body.shape.title.optional(),
				description:
					createTutorialSchema.shape.body.shape.description.optional(),
				scenario_id: z.string().min(1).optional(),
				icon: z.string().optional(),
				estimatedDurationMinutes: z.number().positive().max(60).optional(),
				triggerType: triggerTypeEnum.optional(),
				triggerConditions: createTutorialSchema.shape.body.shape.triggerConditions,
				steps: z.array(tutorialStepSchema).min(1).max(20).optional(),
				status: tutorialStatusEnum.optional(),
				isActive: z.boolean().optional(),
				priority: z.number().int().min(0).max(100).optional(),
				tags: z.array(z.string()).optional(),
				prerequisites: z.array(z.string()).optional(),
			})
			.strict()
			.refine(
				(data) => Object.keys(data).length > 0,
				"At least one field must be provided for update",
			),
	})
	.strict();

// ---------- LIST (query parameters) schema ----------

const listTutorialsSchema = z
	.object({
		query: z
			.object({
				page: z
					.string()
					.optional()
					.transform((val) => (val ? parseInt(val, 10) : 1))
					.refine((val) => val >= 1, "Page must be 1 or greater")
					.describe("Page number for pagination (default: 1)"),

				limit: z
					.string()
					.optional()
					.transform((val) => (val ? parseInt(val, 10) : 20))
					.refine(
						(val) => val >= 1 && val <= 100,
						"Limit must be between 1 and 100",
					)
					.describe("Number of items per page (default: 20, max: 100)"),

				sortBy: z
					.enum([
						"createdAt",
						"updatedAt",
						"title",
						"priority",
						"estimatedDurationMinutes",
					])
					.optional()
					.default("priority")
					.describe("Field to sort by (default: priority)"),

				sortOrder: z
					.enum(["asc", "desc"])
					.optional()
					.default("desc")
					.describe("Sort order (default: desc)"),

				scenario_id: z
					.string()
					.optional()
					.describe("Filter by scenario ID"),

				status: tutorialStatusEnum.optional().describe("Filter by status"),

				isActive: z
					.string()
					.optional()
					.transform((val) => val === "true")
					.describe("Filter by active status (true/false)"),

				triggerType: triggerTypeEnum
					.optional()
					.describe("Filter by trigger type"),
			})
			.strict(),
	})
	.strict();

module.exports = {
	createTutorialSchema,
	updateTutorialSchema,
	patchTutorialSchema,
	listTutorialsSchema,
	tutorialStepSchema,
};
