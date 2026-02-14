/**
 * Scenario Sessions Seed Data
 * Sample completed missions for leaderboard display
 * Only includes the HUD Demonstration scenario
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

// DEMO_COMPLETE_HUD - Demo scenario (15 operators)
scenarioSessions.push(
  createCompletedSession(OPERATORS[0], 'DEMO_COMPLETE_HUD', { overallScore: 98, durationMinutes: 40 }, 1),
  createCompletedSession(OPERATORS[1], 'DEMO_COMPLETE_HUD', { overallScore: 95, durationMinutes: 42 }, 2),
  createCompletedSession(OPERATORS[2], 'DEMO_COMPLETE_HUD', { overallScore: 92, durationMinutes: 45 }, 3),
  createCompletedSession(OPERATORS[3], 'DEMO_COMPLETE_HUD', { overallScore: 88, durationMinutes: 48 }, 5),
  createCompletedSession(OPERATORS[4], 'DEMO_COMPLETE_HUD', { overallScore: 85, durationMinutes: 50 }, 7),
  createCompletedSession(OPERATORS[5], 'DEMO_COMPLETE_HUD', { overallScore: 82, durationMinutes: 52 }, 10),
  createCompletedSession(OPERATORS[6], 'DEMO_COMPLETE_HUD', { overallScore: 79, durationMinutes: 55 }, 12),
  createCompletedSession(OPERATORS[7], 'DEMO_COMPLETE_HUD', { overallScore: 75, durationMinutes: 58 }, 15),
  createCompletedSession(OPERATORS[8], 'DEMO_COMPLETE_HUD', { overallScore: 72, durationMinutes: 60 }, 18),
  createCompletedSession(OPERATORS[9], 'DEMO_COMPLETE_HUD', { overallScore: 68, durationMinutes: 62 }, 20),
  createCompletedSession(OPERATORS[10], 'DEMO_COMPLETE_HUD', { overallScore: 65, durationMinutes: 65 }, 25),
  createCompletedSession(OPERATORS[11], 'DEMO_COMPLETE_HUD', { overallScore: 60, durationMinutes: 68 }, 28),
  createCompletedSession(OPERATORS[12], 'DEMO_COMPLETE_HUD', { overallScore: 55, durationMinutes: 70 }, 30),
  createCompletedSession(OPERATORS[13], 'DEMO_COMPLETE_HUD', { overallScore: 50, durationMinutes: 75 }, 35),
  createCompletedSession(OPERATORS[14], 'DEMO_COMPLETE_HUD', { overallScore: 45, durationMinutes: 80 }, 40),
);

module.exports = scenarioSessions;
