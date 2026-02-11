/**
 * Routes Index
 * Aggregates and versions all API routes
 */

const express = require("express");
const router = express.Router();
const missionControl = require("../config/missionControl");
const { authMiddleware } = require("../middleware/authMiddleware");
const {
	restrictBetaUsers,
} = require("../middleware/betaRestrictionMiddleware");

// Import route modules
const healthRoutes = require("./health");
const authRoutes = require("./auth");
const userRoutes = require("./users");
const satelliteRoutes = require("./satellites");
const scenarioRoutes = require("./scenarios");
const scenarioStepRoutes = require("./scenarioSteps");
const scenarioSessionRoutes = require("./scenarioSessions");
const tutorialRoutes = require("./tutorials");
const aiRoutes = require("./ai");
const commandRoutes = require("./commands");
const helpRoutes = require("./help");
const websocketLogsRoutes = require("./websocket-logs");
const leaderboardRoutes = require("./leaderboard");

/**
 * API v1 Routes
 */

// Public routes (no auth required)
router.use("/health", healthRoutes);
router.use("/auth", authRoutes);

// CSP violation reports (public endpoint)
router.post("/csp-report", express.json(), (req, res) => {
	const logger = require("../utils/logger");
	logger.warn("CSP Violation Report", {
		report: req.body,
		userAgent: req.get("User-Agent"),
		ip: req.ip,
	});
	res.status(204).end(); // No content response
});

// Protected routes (auth required + beta restriction)
router.use("/users", authMiddleware, restrictBetaUsers, userRoutes);
router.use("/satellites", authMiddleware, restrictBetaUsers, satelliteRoutes);
router.use("/scenarios", authMiddleware, restrictBetaUsers, scenarioRoutes);
router.use(
	"/scenario-steps",
	authMiddleware,
	restrictBetaUsers,
	scenarioStepRoutes,
);
router.use(
	"/scenario-sessions",
	authMiddleware,
	restrictBetaUsers,
	scenarioSessionRoutes,
);
router.use("/tutorials", authMiddleware, restrictBetaUsers, tutorialRoutes);
// AI routes handle their own auth (some endpoints use optionalAuth)
router.use("/ai", aiRoutes);
router.use("/commands", authMiddleware, restrictBetaUsers, commandRoutes);
router.use("/help", authMiddleware, restrictBetaUsers, helpRoutes);
router.use(
	"/websocket-logs",
	authMiddleware,
	restrictBetaUsers,
	websocketLogsRoutes,
);
router.use("/leaderboard", leaderboardRoutes); // Leaderboard routes handle their own auth

// Root API endpoint
router.get("/", (req, res) => {
	res.json({
		status: "GO",
		code: 200,
		payload: {
			message: "GroundCTRL API v1",
			version: missionControl.version,
			availableRoutes: [
				{
					path: "/health",
					methods: ["GET"],
					description: "Health check and system status",
				},
				{
					path: "/auth/login",
					methods: ["POST"],
					description: "Operator authentication",
				},
				{
					path: "/auth/logout",
					methods: ["POST"],
					description: "Operator session termination",
				},
				{
					path: "/auth/refresh",
					methods: ["POST"],
					description: "Token refresh",
				},
				{
					path: "/users",
					methods: ["GET", "POST"],
					description: "User management",
				},
				{
					path: "/satellites",
					methods: ["GET"],
					description: "Satellite operations",
				},
				{
					path: "/scenarios",
					methods: ["GET"],
					description: "Mission scenarios",
				},
				{
					path: "/scenario-steps",
					methods: ["GET"],
					description: "Scenario steps",
				},
				{
					path: "/scenario-sessions",
					methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
					description: "Scenario sessions",
				},
				{
					path: "/tutorials",
					methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
					description: "Interactive tutorials",
				},
				{ path: "/ai", methods: ["GET"], description: "AI-powered features" },
				{
					path: "/commands",
					methods: ["GET"],
					description: "Command operations",
				},
				{
					path: "/help",
					methods: ["GET"],
					description: "Help documentation and knowledge base",
				},
				{
					path: "/leaderboard",
					methods: ["GET"],
					description: "Global and scenario leaderboards",
				},
			],
		},
		telemetry: {
			missionTime: new Date().toISOString(),
			operatorCallSign: "SYSTEM",
			stationId: "GROUNDCTRL-01",
			requestId: req.id || "N/A",
		},
		timestamp: Date.now(),
	});
});

module.exports = router;
