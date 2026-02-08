/**
 * Scenario Sessions Seed Data
 * Sample completed missions for leaderboard display
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

// Generate leaderboard data for HUD_INTRODUCTION only
const scenarioSessions = [];

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
