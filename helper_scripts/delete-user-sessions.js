/**
 * Delete all Firestore sessions for a specific user
 * Run: node helper_scripts/delete-user-sessions.js maverick@topgun.navy.mil
 */

const path = require('path');

// Load dotenv from backend's node_modules
const dotenvPath = path.join(__dirname, '../backend/node_modules/dotenv');
const dotenv = require(dotenvPath);
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

// Load Firebase config from backend
const { initializeFirebase, getAuth, getFirestore } = require(path.join(__dirname, '../backend/src/config/firebase'));

async function deleteUserSessions(userEmail) {
  try {
    console.log(`\n🔥 Deleting all sessions for user: ${userEmail}\n`);
    
    // Initialize Firebase
    console.log('📡 Connecting to Firebase...');
    initializeFirebase();
    const auth = getAuth();
    const db = getFirestore();
    console.log('✅ Connected to Firebase\n');
    
    // Get user by email
    console.log(`🔍 Looking up user: ${userEmail}`);
    const userRecord = await auth.getUserByEmail(userEmail);
    const userId = userRecord.uid;
    console.log(`✅ Found user: ${userRecord.displayName || 'Unknown'} (${userId})\n`);
    
    // Query all scenario_sessions for this user
    console.log('🔍 Searching for sessions...');
    const sessionsRef = db.collection('scenario_sessions');
    const snapshot = await sessionsRef.where('created_by', '==', userId).get();
    
    if (snapshot.empty) {
      console.log('   ℹ️  No sessions found for this user\n');
      return { deleted: 0 };
    }
    
    console.log(`   Found ${snapshot.size} session(s)\n`);
    
    // Delete sessions in batches
    let deletedCount = 0;
    const batchSize = 500;
    let batch = db.batch();
    let batchCount = 0;
    
    for (const doc of snapshot.docs) {
      batch.delete(doc.ref);
      batchCount++;
      deletedCount++;
      
      // Commit batch when it reaches size limit
      if (batchCount >= batchSize) {
        await batch.commit();
        console.log(`   Deleted ${deletedCount} sessions...`);
        batch = db.batch();
        batchCount = 0;
      }
    }
    
    // Commit remaining batch
    if (batchCount > 0) {
      await batch.commit();
    }
    
    console.log(`\n✅ Successfully deleted ${deletedCount} session(s) for ${userEmail}\n`);
    
    return { deleted: deletedCount };
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    throw error;
  }
}

// Get email from command line argument
const userEmail = process.argv[2];

if (!userEmail) {
  console.error('\n❌ Error: No email provided');
  console.log('\nUsage: node helper_scripts/delete-user-sessions.js <email>');
  console.log('Example: node helper_scripts/delete-user-sessions.js maverick@topgun.navy.mil\n');
  process.exit(1);
}

// Run deletion
deleteUserSessions(userEmail)
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Operation failed:', error.message);
    process.exit(1);
  });
