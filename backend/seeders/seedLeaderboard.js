/**
 * Leaderboard Data Seeder
 * Seeds scenario sessions (completed missions) for leaderboard display
 */

const admin = require('firebase-admin');
const scenarioSessionsData = require('./data/scenarioSessions');

/**
 * Fetch existing scenarios and create code-to-id mapping
 * @param {Object} db - Firestore database instance
 * @returns {Promise<Object>} Map of scenario codes to IDs
 */
async function fetchExistingScenarios(db) {
  const scenarioMap = {};
  const snapshot = await db.collection('scenarios').get();
  snapshot.forEach((doc) => {
    const data = doc.data();
    if (data.code) {
      scenarioMap[data.code] = doc.id;
    }
  });
  return scenarioMap;
}

/**
 * Seed scenario sessions for leaderboard
 * @param {Object} db - Firestore database instance
 * @param {Object} scenarioMap - Map of scenario codes to IDs
 * @returns {Promise<number>} Number of sessions seeded
 */
async function seedLeaderboard(db, scenarioMap) {
  console.log('🏆 Seeding leaderboard data (scenario sessions)...');
  
  if (!scenarioMap || Object.keys(scenarioMap).length === 0) {
    console.log('⚠️  Fetching existing scenarios for leaderboard...');
    scenarioMap = await fetchExistingScenarios(db);
    console.log(`   Found ${Object.keys(scenarioMap).length} scenarios\n`);
  }
  
  if (Object.keys(scenarioMap).length === 0) {
    console.log('   ⚠️  No scenarios found. Please seed scenarios first.');
    return 0;
  }
  
  let count = 0;
  let skipped = 0;
  
  for (const session of scenarioSessionsData) {
    const scenarioId = scenarioMap[session.scenarioCode];
    
    if (!scenarioId) {
      console.log(`   ⚠️  Skipping session for unknown scenario: ${session.scenarioCode}`);
      skipped++;
      continue;
    }
    
    // Replace scenarioCode with scenarioId
    const sessionData = { ...session };
    delete sessionData.scenarioCode;
    sessionData.scenarioId = scenarioId;
    
    // Add timestamps if not present
    const now = new Date().toISOString();
    if (!sessionData.createdAt) {
      sessionData.createdAt = now;
    }
    if (!sessionData.updatedAt) {
      sessionData.updatedAt = now;
    }
    
    // Add to scenarioSessions collection
    await db.collection('scenarioSessions').add(sessionData);
    count++;
  }
  
  console.log(`   ✓ ${count} scenario sessions seeded for leaderboard`);
  if (skipped > 0) {
    console.log(`   ⚠️  ${skipped} sessions skipped (missing scenarios)`);
  }
  
  return count;
}

module.exports = {
  seedLeaderboard,
};
