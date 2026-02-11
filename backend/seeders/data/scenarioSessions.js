/**
 * Scenario Sessions Seed Data
 * Sample completed missions for leaderboard display
 * Creates realistic operator performance data across different scenarios and users
 * Only includes HUD_INTRODUCTION scenario for initial testing
 */

// Sample user IDs and call signs for leaderboard
const OPERATORS = [
  { userId: 'user_001', callSign: 'APOLLO' },
  { userId: 'user_002', callSign: 'MERCURY' },
  { userId: 'user_003', callSign: 'GEMINI' },
  { userId: 'user_004', callSign: 'VOYAGER' },
  { userId: 'user_005', callSign: 'PIONEER' },
  { userId: 'user_006', callSign: 'MARINER' },
  { userId: 'user_007', callSign: 'VIKING' },
  { userId: 'user_008', callSign: 'CASSINI' },
  { userId: 'user_009', callSign: 'GALILEO' },
  { userId: 'user_010', callSign: 'JUNO' },
  { userId: 'user_011', callSign: 'KEPLER' },
  { userId: 'user_012', callSign: 'HUBBLE' },
  { userId: 'user_013', callSign: 'SPITZER' },
  { userId: 'user_014', callSign: 'CHANDRA' },
  { userId: 'user_015', callSign: 'PHOENIX' },
];

// All 7 ground stations that should be available in scenarios
const ALL_GROUND_STATIONS = [
  'SVALBARD',
  'ALASKA', 
  'HAWAII',
  'AUSTRALIA',
  'SOUTH_AFRICA',
  'CHILE',
  'ANTARCTICA'
];

/**
 * Generate completed scenario session
 */
function createCompletedSession(operator, scenarioCode, performance, daysAgo = 0) {
  const now = new Date();
  const completedAt = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
  const startedAt = new Date(completedAt.getTime() - (performance.durationMinutes * 60 * 1000));
  
  return {
    scenarioCode, // Will be replaced with scenarioId in seeder
    userId: operator.userId,
    userCallSign: operator.callSign,
    status: 'completed',
    startTime: startedAt.toISOString(),
    endTime: completedAt.toISOString(),
    groundStationCodes: ALL_GROUND_STATIONS, // Include all 7 ground stations
    performance: {
      overallScore: performance.overallScore,
      duration: `${performance.durationMinutes}m`,
      scores: {
        commandAccuracy: performance.commandAccuracy || performance.overallScore,
        responseTime: performance.responseTime || performance.overallScore - 5,
        resourceManagement: performance.resourceManagement || performance.overallScore + 2,
        completionTime: performance.completionTime || performance.overallScore - 3,
        errorAvoidance: performance.errorAvoidance || performance.overallScore + 5,
      },
      breakdown: {
        coverage: performance.overallScore,
        efficiency: performance.overallScore - 5,
        accuracy: performance.overallScore + 3,
      },
      missionsCompleted: 1,
      hintsUsed: performance.hintsUsed || 0,
      errorsEncountered: performance.errors || 0,
    },
    completedAt: completedAt.toISOString(),
    version: 1,
  };
}

// Generate diverse leaderboard data
const scenarioSessions = [];

// ROOKIE_COMMISSIONING_101 - Beginner scenario (15 operators)
scenarioSessions.push(
  createCompletedSession(OPERATORS[0], 'ROOKIE_COMMISSIONING_101', { overallScore: 98, durationMinutes: 18, hintsUsed: 0, errors: 0 }, 1),
  createCompletedSession(OPERATORS[1], 'ROOKIE_COMMISSIONING_101', { overallScore: 95, durationMinutes: 19, hintsUsed: 1, errors: 0 }, 2),
  createCompletedSession(OPERATORS[2], 'ROOKIE_COMMISSIONING_101', { overallScore: 92, durationMinutes: 21, hintsUsed: 1, errors: 1 }, 3),
  createCompletedSession(OPERATORS[3], 'ROOKIE_COMMISSIONING_101', { overallScore: 88, durationMinutes: 23, hintsUsed: 2, errors: 1 }, 5),
  createCompletedSession(OPERATORS[4], 'ROOKIE_COMMISSIONING_101', { overallScore: 85, durationMinutes: 25, hintsUsed: 3, errors: 2 }, 7),
  createCompletedSession(OPERATORS[5], 'ROOKIE_COMMISSIONING_101', { overallScore: 82, durationMinutes: 22, hintsUsed: 2, errors: 2 }, 10),
  createCompletedSession(OPERATORS[6], 'ROOKIE_COMMISSIONING_101', { overallScore: 79, durationMinutes: 26, hintsUsed: 4, errors: 3 }, 12),
  createCompletedSession(OPERATORS[7], 'ROOKIE_COMMISSIONING_101', { overallScore: 75, durationMinutes: 28, hintsUsed: 5, errors: 3 }, 15),
  createCompletedSession(OPERATORS[8], 'ROOKIE_COMMISSIONING_101', { overallScore: 72, durationMinutes: 24, hintsUsed: 3, errors: 4 }, 18),
  createCompletedSession(OPERATORS[9], 'ROOKIE_COMMISSIONING_101', { overallScore: 68, durationMinutes: 30, hintsUsed: 6, errors: 5 }, 20),
  createCompletedSession(OPERATORS[10], 'ROOKIE_COMMISSIONING_101', { overallScore: 65, durationMinutes: 27, hintsUsed: 5, errors: 5 }, 25),
  createCompletedSession(OPERATORS[11], 'ROOKIE_COMMISSIONING_101', { overallScore: 60, durationMinutes: 32, hintsUsed: 7, errors: 6 }, 28),
  createCompletedSession(OPERATORS[12], 'ROOKIE_COMMISSIONING_101', { overallScore: 55, durationMinutes: 35, hintsUsed: 8, errors: 7 }, 30),
  createCompletedSession(OPERATORS[13], 'ROOKIE_COMMISSIONING_101', { overallScore: 50, durationMinutes: 38, hintsUsed: 10, errors: 8 }, 35),
  createCompletedSession(OPERATORS[14], 'ROOKIE_COMMISSIONING_101', { overallScore: 45, durationMinutes: 40, hintsUsed: 12, errors: 10 }, 40),
);

// ROOKIE_ORBIT_101 - Beginner scenario (12 operators)
scenarioSessions.push(
  createCompletedSession(OPERATORS[0], 'ROOKIE_ORBIT_101', { overallScore: 97, durationMinutes: 14, commandAccuracy: 98, responseTime: 95 }, 2),
  createCompletedSession(OPERATORS[1], 'ROOKIE_ORBIT_101', { overallScore: 94, durationMinutes: 15, commandAccuracy: 95, responseTime: 92 }, 4),
  createCompletedSession(OPERATORS[2], 'ROOKIE_ORBIT_101', { overallScore: 90, durationMinutes: 16, commandAccuracy: 92, responseTime: 88 }, 6),
  createCompletedSession(OPERATORS[3], 'ROOKIE_ORBIT_101', { overallScore: 86, durationMinutes: 17, commandAccuracy: 88, responseTime: 84 }, 8),
  createCompletedSession(OPERATORS[4], 'ROOKIE_ORBIT_101', { overallScore: 83, durationMinutes: 18, commandAccuracy: 85, responseTime: 80 }, 11),
  createCompletedSession(OPERATORS[5], 'ROOKIE_ORBIT_101', { overallScore: 78, durationMinutes: 19, commandAccuracy: 80, responseTime: 76 }, 14),
  createCompletedSession(OPERATORS[6], 'ROOKIE_ORBIT_101', { overallScore: 74, durationMinutes: 21, commandAccuracy: 76, responseTime: 72 }, 17),
  createCompletedSession(OPERATORS[7], 'ROOKIE_ORBIT_101', { overallScore: 70, durationMinutes: 22, commandAccuracy: 72, responseTime: 68 }, 21),
  createCompletedSession(OPERATORS[8], 'ROOKIE_ORBIT_101', { overallScore: 66, durationMinutes: 23, commandAccuracy: 68, responseTime: 64 }, 24),
  createCompletedSession(OPERATORS[9], 'ROOKIE_ORBIT_101', { overallScore: 62, durationMinutes: 25, commandAccuracy: 64, responseTime: 60 }, 27),
  createCompletedSession(OPERATORS[10], 'ROOKIE_ORBIT_101', { overallScore: 58, durationMinutes: 26, commandAccuracy: 60, responseTime: 56 }, 32),
  createCompletedSession(OPERATORS[11], 'ROOKIE_ORBIT_101', { overallScore: 52, durationMinutes: 28, commandAccuracy: 54, responseTime: 50 }, 38),
);

// ROOKIE_POWER_101 - Beginner scenario (10 operators)
scenarioSessions.push(
  createCompletedSession(OPERATORS[0], 'ROOKIE_POWER_101', { overallScore: 96, durationMinutes: 23, resourceManagement: 98 }, 3),
  createCompletedSession(OPERATORS[1], 'ROOKIE_POWER_101', { overallScore: 93, durationMinutes: 24, resourceManagement: 95 }, 5),
  createCompletedSession(OPERATORS[2], 'ROOKIE_POWER_101', { overallScore: 89, durationMinutes: 26, resourceManagement: 91 }, 8),
  createCompletedSession(OPERATORS[3], 'ROOKIE_POWER_101', { overallScore: 84, durationMinutes: 28, resourceManagement: 86 }, 11),
  createCompletedSession(OPERATORS[4], 'ROOKIE_POWER_101', { overallScore: 80, durationMinutes: 30, resourceManagement: 82 }, 15),
  createCompletedSession(OPERATORS[5], 'ROOKIE_POWER_101', { overallScore: 76, durationMinutes: 32, resourceManagement: 78 }, 19),
  createCompletedSession(OPERATORS[6], 'ROOKIE_POWER_101', { overallScore: 71, durationMinutes: 34, resourceManagement: 73 }, 23),
  createCompletedSession(OPERATORS[7], 'ROOKIE_POWER_101', { overallScore: 67, durationMinutes: 36, resourceManagement: 69 }, 29),
  createCompletedSession(OPERATORS[8], 'ROOKIE_POWER_101', { overallScore: 61, durationMinutes: 38, resourceManagement: 63 }, 34),
  createCompletedSession(OPERATORS[9], 'ROOKIE_POWER_101', { overallScore: 55, durationMinutes: 42, resourceManagement: 57 }, 42),
);

// SPECIALIST_GROUND_STATION_201 - Intermediate scenario (8 operators)
scenarioSessions.push(
  createCompletedSession(OPERATORS[0], 'SPECIALIST_GROUND_STATION_201', { overallScore: 95, durationMinutes: 28, errorAvoidance: 98 }, 4),
  createCompletedSession(OPERATORS[1], 'SPECIALIST_GROUND_STATION_201', { overallScore: 91, durationMinutes: 30, errorAvoidance: 94 }, 7),
  createCompletedSession(OPERATORS[2], 'SPECIALIST_GROUND_STATION_201', { overallScore: 87, durationMinutes: 32, errorAvoidance: 90 }, 10),
  createCompletedSession(OPERATORS[3], 'SPECIALIST_GROUND_STATION_201', { overallScore: 82, durationMinutes: 35, errorAvoidance: 85 }, 14),
  createCompletedSession(OPERATORS[4], 'SPECIALIST_GROUND_STATION_201', { overallScore: 77, durationMinutes: 38, errorAvoidance: 80 }, 18),
  createCompletedSession(OPERATORS[5], 'SPECIALIST_GROUND_STATION_201', { overallScore: 72, durationMinutes: 42, errorAvoidance: 75 }, 24),
  createCompletedSession(OPERATORS[6], 'SPECIALIST_GROUND_STATION_201', { overallScore: 68, durationMinutes: 45, errorAvoidance: 71 }, 31),
  createCompletedSession(OPERATORS[7], 'SPECIALIST_GROUND_STATION_201', { overallScore: 63, durationMinutes: 48, errorAvoidance: 66 }, 39),
);

// SPECIALIST_MANEUVER_201 - Intermediate scenario (7 operators)
scenarioSessions.push(
  createCompletedSession(OPERATORS[0], 'SPECIALIST_MANEUVER_201', { overallScore: 94, durationMinutes: 33, completionTime: 96 }, 5),
  createCompletedSession(OPERATORS[1], 'SPECIALIST_MANEUVER_201', { overallScore: 89, durationMinutes: 35, completionTime: 91 }, 9),
  createCompletedSession(OPERATORS[2], 'SPECIALIST_MANEUVER_201', { overallScore: 85, durationMinutes: 37, completionTime: 87 }, 13),
  createCompletedSession(OPERATORS[3], 'SPECIALIST_MANEUVER_201', { overallScore: 79, durationMinutes: 40, completionTime: 81 }, 17),
  createCompletedSession(OPERATORS[4], 'SPECIALIST_MANEUVER_201', { overallScore: 74, durationMinutes: 43, completionTime: 76 }, 22),
  createCompletedSession(OPERATORS[5], 'SPECIALIST_MANEUVER_201', { overallScore: 69, durationMinutes: 46, completionTime: 71 }, 28),
  createCompletedSession(OPERATORS[6], 'SPECIALIST_MANEUVER_201', { overallScore: 64, durationMinutes: 50, completionTime: 66 }, 36),
);

// COMMANDER_EMERGENCY_301 - Advanced scenario (5 operators)
scenarioSessions.push(
  createCompletedSession(OPERATORS[0], 'COMMANDER_EMERGENCY_301', { overallScore: 92, durationMinutes: 38, hintsUsed: 0, errors: 0 }, 6),
  createCompletedSession(OPERATORS[1], 'COMMANDER_EMERGENCY_301', { overallScore: 87, durationMinutes: 41, hintsUsed: 1, errors: 1 }, 12),
  createCompletedSession(OPERATORS[2], 'COMMANDER_EMERGENCY_301', { overallScore: 81, durationMinutes: 44, hintsUsed: 2, errors: 2 }, 16),
  createCompletedSession(OPERATORS[3], 'COMMANDER_EMERGENCY_301', { overallScore: 75, durationMinutes: 48, hintsUsed: 3, errors: 3 }, 23),
  createCompletedSession(OPERATORS[4], 'COMMANDER_EMERGENCY_301', { overallScore: 70, durationMinutes: 52, hintsUsed: 5, errors: 4 }, 33),
);

// COMMANDER_FULL_MISSION_301 - Advanced scenario (3 operators - top performers only)
scenarioSessions.push(
  createCompletedSession(OPERATORS[0], 'COMMANDER_FULL_MISSION_301', { overallScore: 90, durationMinutes: 58, hintsUsed: 0, errors: 1 }, 8),
  createCompletedSession(OPERATORS[1], 'COMMANDER_FULL_MISSION_301', { overallScore: 84, durationMinutes: 62, hintsUsed: 2, errors: 2 }, 15),
  createCompletedSession(OPERATORS[2], 'COMMANDER_FULL_MISSION_301', { overallScore: 78, durationMinutes: 68, hintsUsed: 3, errors: 4 }, 25),
);

// DEMO_COMPLETE_HUD - Demo scenario (8 operators)
scenarioSessions.push(
  createCompletedSession(OPERATORS[0], 'DEMO_COMPLETE_HUD', { overallScore: 93, durationMinutes: 42 }, 7),
  createCompletedSession(OPERATORS[2], 'DEMO_COMPLETE_HUD', { overallScore: 88, durationMinutes: 45 }, 9),
  createCompletedSession(OPERATORS[4], 'DEMO_COMPLETE_HUD', { overallScore: 82, durationMinutes: 48 }, 13),
  createCompletedSession(OPERATORS[6], 'DEMO_COMPLETE_HUD', { overallScore: 76, durationMinutes: 52 }, 19),
  createCompletedSession(OPERATORS[8], 'DEMO_COMPLETE_HUD', { overallScore: 70, durationMinutes: 56 }, 26),
  createCompletedSession(OPERATORS[10], 'DEMO_COMPLETE_HUD', { overallScore: 64, durationMinutes: 60 }, 34),
  createCompletedSession(OPERATORS[12], 'DEMO_COMPLETE_HUD', { overallScore: 58, durationMinutes: 65 }, 41),
  createCompletedSession(OPERATORS[14], 'DEMO_COMPLETE_HUD', { overallScore: 52, durationMinutes: 70 }, 50),
// Generate leaderboard data for HUD_INTRODUCTION only

// HUD_INTRODUCTION - Beginner scenario (15 operators with varying scores)
scenarioSessions.push(
  createCompletedSession(OPERATORS[0], 'HUD_INTRODUCTION', { overallScore: 98, durationMinutes: 8, hintsUsed: 0, errors: 0 }, 1),
  createCompletedSession(OPERATORS[1], 'HUD_INTRODUCTION', { overallScore: 95, durationMinutes: 9, hintsUsed: 0, errors: 0 }, 2),
  createCompletedSession(OPERATORS[2], 'HUD_INTRODUCTION', { overallScore: 92, durationMinutes: 9, hintsUsed: 1, errors: 0 }, 3),
  createCompletedSession(OPERATORS[3], 'HUD_INTRODUCTION', { overallScore: 88, durationMinutes: 10, hintsUsed: 1, errors: 1 }, 5),
  createCompletedSession(OPERATORS[4], 'HUD_INTRODUCTION', { overallScore: 85, durationMinutes: 10, hintsUsed: 2, errors: 1 }, 7),
  createCompletedSession(OPERATORS[5], 'HUD_INTRODUCTION', { overallScore: 82, durationMinutes: 11, hintsUsed: 2, errors: 2 }, 10),
  createCompletedSession(OPERATORS[6], 'HUD_INTRODUCTION', { overallScore: 79, durationMinutes: 11, hintsUsed: 3, errors: 2 }, 12),
  createCompletedSession(OPERATORS[7], 'HUD_INTRODUCTION', { overallScore: 75, durationMinutes: 12, hintsUsed: 3, errors: 3 }, 15),
  createCompletedSession(OPERATORS[8], 'HUD_INTRODUCTION', { overallScore: 72, durationMinutes: 12, hintsUsed: 4, errors: 3 }, 18),
  createCompletedSession(OPERATORS[9], 'HUD_INTRODUCTION', { overallScore: 68, durationMinutes: 13, hintsUsed: 5, errors: 4 }, 20),
  createCompletedSession(OPERATORS[10], 'HUD_INTRODUCTION', { overallScore: 65, durationMinutes: 13, hintsUsed: 5, errors: 4 }, 25),
  createCompletedSession(OPERATORS[11], 'HUD_INTRODUCTION', { overallScore: 60, durationMinutes: 14, hintsUsed: 6, errors: 5 }, 28),
  createCompletedSession(OPERATORS[12], 'HUD_INTRODUCTION', { overallScore: 55, durationMinutes: 15, hintsUsed: 7, errors: 6 }, 30),
  createCompletedSession(OPERATORS[13], 'HUD_INTRODUCTION', { overallScore: 50, durationMinutes: 16, hintsUsed: 8, errors: 7 }, 35),
  createCompletedSession(OPERATORS[14], 'HUD_INTRODUCTION', { overallScore: 45, durationMinutes: 17, hintsUsed: 10, errors: 8 }, 40),
);

module.exports = scenarioSessions;
