/**
 * Tutorial Seeder
 *
 * Seeds tutorial data for scenarios
 * Based on frontend tutorial configuration
 */

require("dotenv").config();
const admin = require("firebase-admin");

const CREATED_BY_UID = "5usOQ3eOm7OjXmDOFjEmKSQovs42";

// Initialize Firebase Admin with credentials from .env
if (!admin.apps.length) {
	try {
		const privateKey = process.env.FIREBASE_PRIVATE_KEY
			? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
			: undefined;

		if (
			!privateKey ||
			!process.env.FIREBASE_PROJECT_ID ||
			!process.env.FIREBASE_CLIENT_EMAIL
		) {
			console.error("Missing Firebase credentials in .env file");
			console.error(
				"Please ensure FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL are set",
			);
			process.exit(1);
		}

		admin.initializeApp({
			credential: admin.credential.cert({
				projectId: process.env.FIREBASE_PROJECT_ID,
				clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
				privateKey: privateKey,
			}),
		});

		console.log("✅ Firebase Admin initialized successfully");
	} catch (error) {
		console.error("❌ Failed to initialize Firebase Admin:", error.message);
		process.exit(1);
	}
}

/**
 * Seed tutorial data
 * @param {string} scenarioId - ID of the scenario to attach tutorial to (optional for testing)
 */
async function seedTutorials(scenarioId = null) {
	const db = admin.firestore();
	const tutorialsCollection = db.collection("tutorials");

	// If no scenario ID provided, fetch first available scenario
	let targetScenarioId = scenarioId;
	if (!targetScenarioId) {
		console.log(
			"⚠️  No scenario ID provided. Fetching first available scenario...",
		);
		const scenariosSnapshot = await db
			.collection("scenarios")
			.limit(1)
			.get();
		if (!scenariosSnapshot.empty) {
			targetScenarioId = scenariosSnapshot.docs[0].id;
			console.log(`   Using scenario: ${targetScenarioId}`);
		} else {
			console.warn(
				"   No scenarios found. Tutorials will need scenario_id updated.",
			);
			targetScenarioId = "UPDATE_ME"; // Placeholder
		}
	}

	const tutorials = [
		{
			code: "RENDERING_2D_INTRO",
			title: "2D Satellite View Tutorial",
			description: "Learn how to use the 2D orbital map visualization",
			scenario_id: targetScenarioId,
			icon: "🗺️",
			estimatedDurationMinutes: 5,
			triggerType: "ON_SCENARIO_START",
			triggerConditions: {},
			steps: [
				{
					order: 0,
					title: "Welcome to 2D View 🗺️",
					content:
						"This is the 2D satellite visualization - a flat map projection showing your satellite's orbit. It uses a sinusoidal projection to accurately represent orbital tracks on Earth's surface.",
					targetElement: ".satellite-canvas-2d",
					placement: "center",
					isOptional: false,
				},
				{
					order: 1,
					title: "Satellite Position",
					content:
						"The red dot shows your satellite's current position. The altitude is displayed next to the marker.",
					targetElement: ".satellite-canvas-2d canvas",
					placement: "right",
					isOptional: false,
				},
				{
					order: 2,
					title: "Ground Track",
					content:
						"The blue line shows where your satellite travels over Earth. This is the ground track - the path directly below the satellite.",
					targetElement: ".satellite-canvas-2d canvas",
					placement: "right",
					isOptional: false,
				},
				{
					order: 3,
					title: "Day/Night Boundary",
					content:
						"The glowing line shows the day/night terminator. This helps you understand when your satellite is in sunlight or shadow.",
					targetElement: ".satellite-canvas-2d canvas",
					placement: "bottom",
					isOptional: false,
				},
				{
					order: 4,
					title: "Playback Controls",
					content:
						"Use these controls to pause, play, or reset the simulation. Time is accelerated to show orbital motion clearly.",
					targetElement: ".satellite-canvas-2d button",
					placement: "top",
					isOptional: false,
				},
			],
			status: "PUBLISHED",
			isActive: true,
			priority: 80,
			tags: ["rendering", "2d", "visualization", "beginner"],
			prerequisites: [],
		},
		{
			code: "RENDERING_3D_INTRO",
			title: "3D Globe View Tutorial",
			description:
				"Master the 3D interactive globe and camera controls",
			scenario_id: targetScenarioId,
			icon: "🌍",
			estimatedDurationMinutes: 5,
			triggerType: "ON_SCENARIO_START",
			triggerConditions: {},
			steps: [
				{
					order: 0,
					title: "Welcome to 3D View 🌍",
					content:
						"This is the 3D globe visualization - an interactive view of Earth and your satellite. You can rotate, zoom, and explore from any angle.",
					targetElement: ".satellite-globe-3d",
					placement: "center",
					isOptional: false,
				},
				{
					order: 1,
					title: "Camera Controls",
					content:
						"Left-click and drag to rotate the view. Right-click and drag to pan. Scroll to zoom in and out.",
					targetElement: ".satellite-globe-3d canvas",
					placement: "right",
					isOptional: false,
				},
				{
					order: 2,
					title: "Satellite in 3D",
					content:
						"The glowing red sphere is your satellite. It moves along its orbital path in real-time.",
					targetElement: ".satellite-globe-3d canvas",
					placement: "bottom",
					isOptional: false,
				},
				{
					order: 3,
					title: "Orbital Path",
					content:
						"The cyan line shows the complete orbital path. This helps visualize the satellite's trajectory through space.",
					targetElement: ".satellite-globe-3d canvas",
					placement: "left",
					isOptional: false,
				},
				{
					order: 4,
					title: "Reset View",
					content:
						"Click 'Reset View' to return to the default camera position. Useful if you get lost while exploring!",
					targetElement: '[data-tutorial="reset-view"]',
					placement: "top",
					isOptional: false,
				},
			],
			status: "PUBLISHED",
			isActive: true,
			priority: 80,
			tags: ["rendering", "3d", "visualization", "beginner"],
			prerequisites: [],
		},
		{
			code: "MISSION_CONTROL_INTRO",
			title: "Mission Control Operations",
			description: "Learn the mission control interface and operations",
			scenario_id: targetScenarioId,
			icon: "🎮",
			estimatedDurationMinutes: 7,
			triggerType: "ON_SCENARIO_START",
			triggerConditions: {},
			steps: [
				{
					order: 0,
					title: "Mission Control 🎮",
					content:
						"Welcome to Mission Control - your command center for satellite operations. Here you can monitor telemetry, send commands, and track your mission.",
					targetElement: null,
					placement: "center",
					isOptional: false,
				},
				{
					order: 1,
					title: "Telemetry Panel",
					content:
						"This panel shows real-time satellite data: Power levels, Attitude information, Thermal status, and Communications link.",
					targetElement: '[data-tutorial="telemetry"]',
					placement: "right",
					isOptional: false,
				},
				{
					order: 2,
					title: "Command Console",
					content:
						"Use this console to send commands to your satellite. Commands are queued and executed when the satellite is in communication range.",
					targetElement: '[data-tutorial="commands"]',
					placement: "left",
					isOptional: false,
				},
				{
					order: 3,
					title: "Orbital Visualization",
					content:
						"The orbital view shows your satellite's position and ground track. Toggle between 2D and 3D views for different perspectives.",
					targetElement: '[data-tutorial="orbit-view"]',
					placement: "bottom",
					isOptional: false,
				},
			],
			status: "PUBLISHED",
			isActive: true,
			priority: 90,
			tags: ["mission-control", "operations", "beginner"],
			prerequisites: [],
		},
		{
			code: "POWER_MANAGEMENT_BASICS",
			title: "Power Management Basics",
			description: "Learn to monitor and manage satellite power systems",
			scenario_id: targetScenarioId,
			icon: "🔋",
			estimatedDurationMinutes: 5,
			triggerType: "ON_PANEL_OPEN",
			triggerConditions: {
				panelId: "power-panel",
			},
			steps: [
				{
					order: 0,
					title: "Power Systems Overview",
					content:
						"Satellite power management is critical for mission success. Monitor battery charge, solar panel output, and power consumption.",
					targetElement: "#power-panel",
					placement: "right",
					isOptional: false,
				},
				{
					order: 1,
					title: "Battery Status",
					content:
						"Watch the battery charge percentage. Keep it above 20% to maintain mission safety margins.",
					targetElement: "#battery-indicator",
					placement: "bottom",
					isOptional: false,
				},
				{
					order: 2,
					title: "Solar Panel Output",
					content:
						"Solar panels charge the battery when in sunlight. Output varies based on sun angle and panel orientation.",
					targetElement: "#solar-output",
					placement: "bottom",
					isOptional: false,
				},
			],
			status: "PUBLISHED",
			isActive: true,
			priority: 70,
			tags: ["power", "subsystems", "intermediate"],
			prerequisites: [],
		},
		{
			code: "ATTITUDE_CONTROL_INTRO",
			title: "Attitude Control Introduction",
			description: "Learn satellite orientation and pointing",
			scenario_id: targetScenarioId,
			icon: "🎯",
			estimatedDurationMinutes: 6,
			triggerType: "ON_PANEL_OPEN",
			triggerConditions: {
				panelId: "attitude-panel",
			},
			steps: [
				{
					order: 0,
					title: "Attitude Control Systems",
					content:
						"Attitude control determines where your satellite is pointing. This is crucial for communications, Earth observation, and power generation.",
					targetElement: "#attitude-panel",
					placement: "right",
					isOptional: false,
				},
				{
					order: 1,
					title: "Pointing Modes",
					content:
						"Common modes include NADIR (pointing at Earth), SUN (maximizing solar power), and INERTIAL (fixed orientation).",
					targetElement: "#pointing-mode-selector",
					placement: "bottom",
					isOptional: false,
				},
				{
					order: 2,
					title: "Pointing Error",
					content:
						"Monitor pointing error in degrees. Lower is better - aim for less than 1 degree for most operations.",
					targetElement: "#pointing-error",
					placement: "top",
					isOptional: false,
				},
			],
			status: "PUBLISHED",
			isActive: true,
			priority: 70,
			tags: ["attitude", "control", "subsystems", "intermediate"],
			prerequisites: [],
		},
	];

	console.log(`🚀 Starting tutorial seeding for scenario: ${targetScenarioId}`);

	const results = {
		created: 0,
		skipped: 0,
		errors: 0,
	};

	for (const tutorial of tutorials) {
		try {
			// Check if tutorial already exists by code
			const existingQuery = await tutorialsCollection
				.where("code", "==", tutorial.code)
				.limit(1)
				.get();

			if (!existingQuery.empty) {
				console.log(`⏭️  Tutorial ${tutorial.code} already exists, skipping`);
				results.skipped++;
				continue;
			}

			// Add timestamps and metadata
			const now = new Date().toISOString();
			const tutorialDoc = {
				...tutorial,
				createdAt: now,
				updatedAt: now,
				createdBy: CREATED_BY_UID,
				createdByCallSign: "GROUNDCTRL-SEEDER",
			};

			const docRef = await tutorialsCollection.add(tutorialDoc);

			console.log(`✅ Created tutorial: ${tutorial.code} (${docRef.id})`);
			results.created++;
		} catch (error) {
			console.error(`❌ Failed to create tutorial ${tutorial.code}:`, {
				error: error.message,
			});
			results.errors++;
		}
	}

	console.log("📊 Tutorial seeding complete:", results);
	return results;
}

/**
 * Main seeder execution
 */
async function main() {
	try {
		console.log("🌱 Tutorial Seeder Started\n");

		// Get scenario ID from command line args if provided
		const scenarioId = process.argv[2] || null;

		const results = await seedTutorials(scenarioId);

		console.log(
			`\n✨ Tutorial seeding finished: ${results.created} created, ${results.skipped} skipped, ${results.errors} errors`,
		);

		process.exit(results.errors > 0 ? 1 : 0);
	} catch (error) {
		console.error("💥 Tutorial seeding failed:", error.message);
		process.exit(1);
	}
}

// Run if called directly
if (require.main === module) {
	main();
}

module.exports = { seedTutorials };
