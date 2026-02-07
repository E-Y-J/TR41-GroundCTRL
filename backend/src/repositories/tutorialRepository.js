/**
 * Tutorial Repository
 *
 * Handles persistence of tutorial data to Firebase Firestore
 * Tutorials provide interactive guides for mission scenarios
 */

const { getFirestore } = require("../config/firebase");
const logger = require("../utils/logger");

const COLLECTION_NAME = "tutorials";

/**
 * Get all tutorials with pagination, filtering, and sorting
 *
 * @param {object} options - Query options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 20)
 * @param {string} options.sortBy - Field to sort by
 * @param {string} options.sortOrder - Sort order (asc/desc)
 * @param {string} options.scenario_id - Filter by scenario
 * @param {string} options.status - Filter by status
 * @param {boolean} options.isActive - Filter by active status
 * @param {string} options.triggerType - Filter by trigger type
 * @returns {Promise} Paginated tutorials result
 */
async function getAll(options = {}) {
	try {
		const {
			page = 1,
			limit = 20,
			sortBy = "priority",
			sortOrder = "desc",
			scenario_id,
			status,
			isActive,
			triggerType,
			createdBy,
		} = options;

		const db = getFirestore();
		let query = db.collection(COLLECTION_NAME);

		// Apply filters
		if (scenario_id) {
			query = query.where("scenario_id", "==", scenario_id);
		}
		if (status) {
			query = query.where("status", "==", status);
		}
		if (isActive !== undefined) {
			query = query.where("isActive", "==", isActive);
		}
		if (triggerType) {
			query = query.where("triggerType", "==", triggerType);
		}
		if (createdBy) {
			query = query.where("createdBy", "==", createdBy);
		}

		// Apply sorting
		query = query.orderBy(sortBy, sortOrder);

		// Get all matching documents
		const snapshot = await query.get();
		let tutorials = snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		}));

		// Calculate pagination
		const total = tutorials.length;
		const offset = (page - 1) * limit;
		const paginatedTutorials = tutorials.slice(offset, offset + limit);

		// Sanitize data
		const sanitizedTutorials = paginatedTutorials.map(sanitizeTutorial);

		return {
			data: sanitizedTutorials,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	} catch (error) {
		logger.error("Failed to fetch all tutorials", { error: error.message });
		throw error;
	}
}

/**
 * Get tutorial by ID
 *
 * @param {string} id - Tutorial ID
 * @param {object} options - Query options for ownership scoping
 * @param {string} options.createdBy - Filter by creator (ownership scoping)
 * @returns {Promise} Tutorial data or null if not found
 */
async function getById(id, options = {}) {
	try {
		const db = getFirestore();
		const doc = await db.collection(COLLECTION_NAME).doc(id).get();

		if (!doc.exists) {
			return null;
		}

		const tutorial = {
			id: doc.id,
			...doc.data(),
		};

		// Apply ownership scoping if specified
		if (options.createdBy && tutorial.createdBy !== options.createdBy) {
			return null; // User doesn't own this tutorial
		}

		return sanitizeTutorial(tutorial);
	} catch (error) {
		logger.error("Failed to fetch tutorial by ID", {
			error: error.message,
			id,
		});
		throw error;
	}
}

/**
 * Get tutorials by scenario ID
 *
 * @param {string} scenarioId - Scenario ID
 * @param {object} options - Query options
 * @returns {Promise} Array of tutorials for scenario
 */
async function getByScenarioId(scenarioId, options = {}) {
	try {
		const { isActive = true, status = "PUBLISHED" } = options;

		const db = getFirestore();
		let query = db
			.collection(COLLECTION_NAME)
			.where("scenario_id", "==", scenarioId);

		if (isActive !== undefined) {
			query = query.where("isActive", "==", isActive);
		}
		if (status) {
			query = query.where("status", "==", status);
		}

		// Sort by priority (highest first)
		query = query.orderBy("priority", "desc");

		const snapshot = await query.get();
		const tutorials = snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		}));

		return tutorials.map(sanitizeTutorial);
	} catch (error) {
		logger.error("Failed to fetch tutorials by scenario ID", {
			error: error.message,
			scenarioId,
		});
		throw error;
	}
}

/**
 * Create new tutorial
 *
 * @param {object} tutorialData - Tutorial data
 * @param {object} metadata - Creation metadata
 * @returns {Promise} Created tutorial data
 */
async function create(tutorialData, metadata = {}) {
	try {
		const db = getFirestore();

		// Prepare Firestore document
		const tutorialDoc = {
			...tutorialData,
			createdAt: new Date(),
			updatedAt: new Date(),
			createdBy: metadata.createdBy || null,
			createdByCallSign: metadata.createdByCallSign || null,
		};

		// Add to Firestore
		const docRef = await db.collection(COLLECTION_NAME).add(tutorialDoc);

		logger.info("Tutorial created successfully", {
			id: docRef.id,
			title: tutorialData.title,
		});

		return sanitizeTutorial({
			id: docRef.id,
			...tutorialDoc,
		});
	} catch (error) {
		logger.error("Failed to create tutorial", { error: error.message });
		throw error;
	}
}

/**
 * Update tutorial (full replacement)
 *
 * @param {string} id - Tutorial ID
 * @param {object} tutorialData - Updated tutorial data
 * @param {object} metadata - Update metadata
 * @returns {Promise} Updated tutorial data
 */
async function update(id, tutorialData, metadata = {}) {
	try {
		const db = getFirestore();

		// Prepare Firestore update
		const tutorialDoc = {
			...tutorialData,
			updatedAt: new Date(),
			updatedBy: metadata.updatedBy || null,
			updatedByCallSign: metadata.updatedByCallSign || null,
		};

		// Update Firestore document
		await db.collection(COLLECTION_NAME).doc(id).update(tutorialDoc);

		logger.info("Tutorial updated successfully", {
			id,
			title: tutorialData.title,
		});

		return sanitizeTutorial({
			id,
			...tutorialDoc,
		});
	} catch (error) {
		logger.error("Failed to update tutorial", { error: error.message, id });
		throw error;
	}
}

/**
 * Patch tutorial (partial update)
 *
 * @param {string} id - Tutorial ID
 * @param {object} updates - Partial tutorial data updates
 * @param {object} metadata - Update metadata
 * @returns {Promise} Updated tutorial data
 */
async function patch(id, updates, metadata = {}) {
	try {
		const db = getFirestore();

		// Prepare Firestore update
		const tutorialDoc = {
			...updates,
			updatedAt: new Date(),
			updatedBy: metadata.updatedBy || null,
			updatedByCallSign: metadata.updatedByCallSign || null,
		};

		// Update Firestore document
		await db.collection(COLLECTION_NAME).doc(id).update(tutorialDoc);

		// Fetch updated tutorial
		const updatedTutorial = await getById(id);

		logger.info("Tutorial patched successfully", { id });

		return updatedTutorial;
	} catch (error) {
		logger.error("Failed to patch tutorial", { error: error.message, id });
		throw error;
	}
}

/**
 * Delete tutorial
 *
 * @param {string} id - Tutorial ID
 * @param {object} metadata - Deletion metadata
 * @returns {Promise}
 */
async function deleteTut(id, metadata = {}) {
	try {
		const db = getFirestore();

		// Delete from Firestore
		await db.collection(COLLECTION_NAME).doc(id).delete();

		logger.info("Tutorial deleted successfully", {
			id,
			deletedBy: metadata.deletedBy,
		});
	} catch (error) {
		logger.error("Failed to delete tutorial", { error: error.message, id });
		throw error;
	}
}

/**
 * Remove sensitive fields and convert timestamps from tutorial object
 *
 * @param {object} tutorial - Tutorial object
 * @returns {object} Sanitized tutorial object
 */
function sanitizeTutorial(tutorial) {
	const sanitized = { ...tutorial };

	// Convert Firestore timestamps to ISO strings
	if (sanitized.createdAt?.toDate) {
		sanitized.createdAt = sanitized.createdAt.toDate().toISOString();
	}

	if (sanitized.updatedAt?.toDate) {
		sanitized.updatedAt = sanitized.updatedAt.toDate().toISOString();
	}

	return sanitized;
}

module.exports = {
	getAll,
	getById,
	getByScenarioId,
	create,
	update,
	patch,
	delete: deleteTut,
};
