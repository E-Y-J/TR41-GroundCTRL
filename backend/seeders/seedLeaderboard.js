/**
 * Leaderboard Data Seeder
 * Seeds scenario sessions (completed missions) for leaderboard display
 * 
 * Usage:
 *   - Ensure .env file is configured with Firebase credentials
 *   - Run: node seeders/seedLeaderboard.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const admin = require('firebase-admin');
const scenarioSessionsData = require('./data/scenarioSessions');

const CREATED_BY_UID = '5usOQ3eOm7OjXmDOFjEmKSQovs42';

// Initialize Firebase Admin with credentials from .env
if (!admin.apps.length) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;

    if (
      !privateKey ||
      !process.env.FIREBASE_PROJECT_ID ||
      !process.env.FIREBASE_CLIENT_EMAIL
    ) {
      console.error('❌ Missing Firebase credentials in .env file');
      console.error(
        'Please ensure FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL are set'
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

    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error.message);
    process.exit(1);
  }
}

/**
 * Fetch existing scenarios and create code-to-id mapping
 * @returns {Promise<Object>} Map of scenario codes to IDs
 */
async function fetchExistingScenarios() {
  const db = admin.firestore();
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
 * @param {Object} scenarioMap - Optional map of scenario codes to IDs
 * @returns {Promise<number>} Number of sessions seeded
 */
async function seedLeaderboard(scenarioMap = null) {
  const db = admin.firestore();
  
  console.log('🏆 Seeding leaderboard data (scenario sessions)...');
  
  // Fetch scenarios if not provided
  if (!scenarioMap || Object.keys(scenarioMap).length === 0) {
    console.log('⚠️  Fetching existing scenarios for leaderboard...');
    scenarioMap = await fetchExistingScenarios();
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
    
    // Add creator metadata
    sessionData.createdBy = CREATED_BY_UID;
    sessionData.createdByCallSign = 'GROUNDCTRL-SEEDER';
    
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

/**
 * Main seeder execution
 */
async function main() {
  try {
    console.log('🌱 Leaderboard Seeder Started\n');

    const count = await seedLeaderboard();

    console.log(
      `\n✨ Leaderboard seeding finished: ${count} sessions created`
    );

    process.exit(0);
  } catch (error) {
    console.error('💥 Leaderboard seeding failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { seedLeaderboard };
