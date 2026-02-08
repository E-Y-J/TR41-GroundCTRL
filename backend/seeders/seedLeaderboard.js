/**
 * Leaderboard Data Seeder
 * Creates sample completed scenarioSessions for leaderboard testing
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });

    console.log('✅ Firebase Admin initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error.message);
    process.exit(1);
  }
}

const db = admin.firestore();

// Sample operators
const operators = [
  { uid: '5usOQ3eOm7OjXmDOFjEmKSQovs42', callSign: 'APOLLO-1' },
  { uid: 'user_001', callSign: 'MERCURY-7' },
  { uid: 'user_002', callSign: 'GEMINI-4' },
  { uid: 'user_003', callSign: 'SKYLAB-3' },
  { uid: 'user_004', callSign: 'SHUTTLE-5' },
  { uid: 'user_005', callSign: 'ISS-ALPHA' },
  { uid: 'user_006', callSign: 'ARTEMIS-2' },
  { uid: 'user_007', callSign: 'ORION-9' },
  { uid: 'user_008', callSign: 'DRAGON-6' },
  { uid: 'user_009', callSign: 'SOYUZ-8' },
];

/**
 * Generate random score between min and max
 */
function randomScore(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate random date within last N days
 */
function randomDate(daysAgo) {
  const now = new Date();
  const past = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
  const randomTime = past.getTime() + Math.random() * (now.getTime() - past.getTime());
  return new Date(randomTime);
}

/**
 * Seed sample completed scenario sessions for leaderboard
 */
async function seedLeaderboard() {
  console.log('🏆 Seeding leaderboard data...');
  
  try {
    // Fetch existing scenarios
    const scenariosSnapshot = await db.collection('scenarios').limit(5).get();
    
    if (scenariosSnapshot.empty) {
      console.error('❌ No scenarios found. Please run: node seed.js --scenarios');
      return 0;
    }
    
    const scenarios = [];
    scenariosSnapshot.forEach(doc => {
      scenarios.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`   Found ${scenarios.length} scenarios`);
    
    let count = 0;
    const batch = db.batch();
    
    // Create multiple completed sessions per operator
    for (const operator of operators) {
      // Each operator completes 2-4 random scenarios
      const numMissions = randomScore(2, 4);
      const selectedScenarios = scenarios
        .sort(() => 0.5 - Math.random())
        .slice(0, numMissions);
      
      for (const scenario of selectedScenarios) {
        const completedDate = randomDate(30); // Within last 30 days
        const startDate = new Date(completedDate.getTime() - (randomScore(10, 60) * 60 * 1000)); // 10-60 min earlier
        
        const sessionRef = db.collection('scenarioSessions').doc();
        const sessionData = {
          userId: operator.uid,
          userCallSign: operator.callSign,
          scenarioId: scenario.id,
          scenarioTitle: scenario.title || 'Training Mission',
          status: 'completed',
          startTime: startDate.toISOString(),
          endTime: completedDate.toISOString(),
          performance: {
            overallScore: randomScore(60, 100),
            accuracy: randomScore(70, 100),
            efficiency: randomScore(65, 95),
            timeScore: randomScore(60, 90),
            commandsExecuted: randomScore(10, 50),
            errorsCount: randomScore(0, 5),
            duration: `${randomScore(10, 60)} minutes`,
          },
          completedSteps: randomScore(5, 15),
          totalSteps: randomScore(10, 20),
          createdAt: startDate.toISOString(),
          updatedAt: completedDate.toISOString(),
        };
        
        batch.set(sessionRef, sessionData);
        count++;
      }
    }
    
    // Commit batch
    await batch.commit();
    
    console.log(`   ✓ ${count} completed sessions created`);
    console.log(`   ✓ ${operators.length} operators with scores`);
    return count;
    
  } catch (error) {
    console.error('❌ Error seeding leaderboard:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedLeaderboard()
    .then((count) => {
      console.log('\n✅ Leaderboard seeding complete!');
      console.log(`   📊 ${count} completed missions created\n`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedLeaderboard };
