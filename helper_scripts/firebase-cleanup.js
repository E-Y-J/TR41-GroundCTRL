/**
 * Firebase Cleanup Script (Unified)
 * Interactive CLI to choose cleanup mode:
 *   1. Nuclear Option - Delete ALL (Auth users + all Firestore data)
 *   2. Keep Users - Preserve Auth users and users collection
 * 
 * Run from project root: node helper_scripts/firebase-cleanup.js
 */

const path = require('path');
const readline = require('readline');

// Load dotenv from backend's node_modules
const dotenvPath = path.join(__dirname, '../backend/node_modules/dotenv');
const dotenv = require(dotenvPath);
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

// Load Firebase config from backend
const { initializeFirebase, getAuth, getFirestore } = require(path.join(__dirname, '../backend/src/config/firebase'));

/**
 * Create readline interface for user input
 */
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Prompt user for input
 */
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

/**
 * Display main menu and get user choice
 */
async function showMenu() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║        Firebase Cleanup Tool - GroundCTRL                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('\nSelect cleanup mode:\n');
  console.log('  1️⃣  NUCLEAR OPTION - Delete EVERYTHING');
  console.log('     • Deletes ALL Firebase Auth users');
  console.log('     • Deletes ALL Firestore collections');
  console.log('     • Complete database wipe\n');
  console.log('  2️⃣  KEEP USERS - Preserve user accounts');
  console.log('     • Preserves Firebase Auth users');
  console.log('     • Preserves "users" collection');
  console.log('     • Deletes all other Firestore data\n');
  console.log('  3️⃣  Cancel - Exit without changes\n');
  
  const choice = await askQuestion('Enter your choice (1, 2, or 3): ');
  return choice.trim();
}

/**
 * Delete all Firebase Auth users
 */
async function deleteAllAuthUsers(auth) {
  console.log('\n🔥 Starting Firebase Auth cleanup...');
  
  let deletedCount = 0;
  let pageToken;
  
  try {
    do {
      // List users in batches of 1000 (Firebase limit)
      const listUsersResult = await auth.listUsers(1000, pageToken);
      
      if (listUsersResult.users.length === 0) {
        break;
      }
      
      // Delete users in parallel batches
      const deletePromises = listUsersResult.users.map(user => 
        auth.deleteUser(user.uid)
          .then(() => {
            deletedCount++;
            process.stdout.write(`\r   Deleted ${deletedCount} Auth users...`);
            return true;
          })
          .catch(error => {
            console.error(`\n   ⚠️  Failed to delete user ${user.uid}:`, error.message);
            return false;
          })
      );
      
      await Promise.all(deletePromises);
      
      pageToken = listUsersResult.pageToken;
    } while (pageToken);
    
    console.log(`\n✅ Deleted ${deletedCount} Firebase Auth users`);
    return deletedCount;
  } catch (error) {
    console.error('\n❌ Error deleting Auth users:', error.message);
    throw error;
  }
}

/**
 * Delete all documents in a collection (including subcollections recursively)
 */
async function deleteCollection(db, collectionName, batchSize = 500, collectionRef = null) {
  if (!collectionRef) {
    collectionRef = db.collection(collectionName);
  }
  let deletedCount = 0;
  let subcollectionCount = 0;
  
  try {
    let hasMore = true;
    
    while (hasMore) {
      // Get batch of documents
      const snapshot = await collectionRef.limit(batchSize).get();
      
      if (snapshot.empty) {
        hasMore = false;
        break;
      }
      
      // Delete subcollections first (recursively)
      for (const doc of snapshot.docs) {
        const subcollections = await doc.ref.listCollections();
        if (subcollections.length > 0) {
          for (const subcollection of subcollections) {
            subcollectionCount++;
            process.stdout.write(`\r   Deleting subcollection ${subcollection.id} in ${collectionName}...`);
            await deleteCollection(db, `${collectionName}/${doc.id}/${subcollection.id}`, batchSize, subcollection);
          }
        }
      }
      
      // Delete documents in batch
      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
        deletedCount++;
      });
      
      await batch.commit();
      process.stdout.write(`\r   Deleted ${deletedCount} documents from ${collectionName}...`);
      
      // Check if there are more documents
      if (snapshot.docs.length < batchSize) {
        hasMore = false;
      }
    }
    
    if (subcollectionCount > 0) {
      console.log(`\n✅ Deleted ${deletedCount} documents and ${subcollectionCount} subcollections from '${collectionName}'`);
    } else {
      console.log(`\n✅ Deleted ${deletedCount} documents from collection '${collectionName}'`);
    }
    return deletedCount;
  } catch (error) {
    console.error(`\n❌ Error deleting collection '${collectionName}':`, error.message);
    throw error;
  }
}

/**
 * Get all collection names in Firestore
 */
async function getAllCollections(db) {
  try {
    const collections = await db.listCollections();
    return collections.map(col => col.id);
  } catch (error) {
    console.error('❌ Error listing collections:', error.message);
    throw error;
  }
}

/**
 * Mode 1: Delete ALL Firestore collections
 */
async function deleteAllCollections(db) {
  console.log('\n🔥 Starting Firestore cleanup (ALL collections)...');
  
  // Discover all collections dynamically
  console.log('🔍 Discovering all collections...');
  const collections = await getAllCollections(db);
  
  if (collections.length === 0) {
    console.log('   ℹ️  No collections found');
    return { collections: 0, documents: 0 };
  }
  
  console.log(`   Found ${collections.length} collection(s): ${collections.join(', ')}\n`);
  
  let totalDeleted = 0;
  let collectionsDeleted = 0;
  
  for (const collectionName of collections) {
    console.log(`📦 Cleaning collection: ${collectionName}`);
    const count = await deleteCollection(db, collectionName);
    totalDeleted += count;
    collectionsDeleted++;
  }
  
  console.log(`\n✅ Total collections deleted: ${collectionsDeleted}`);
  console.log(`✅ Total documents deleted: ${totalDeleted}`);
  
  return { collections: collectionsDeleted, documents: totalDeleted };
}

/**
 * Mode 2: Delete all Firestore collections EXCEPT users
 */
async function deleteAllCollectionsExceptUsers(db) {
  console.log('\n🔥 Starting Firestore cleanup (preserving users)...');
  
  // Discover all collections dynamically
  console.log('🔍 Discovering all collections...');
  const collections = await getAllCollections(db);
  
  if (collections.length === 0) {
    console.log('   ℹ️  No collections found');
    return { collections: 0, documents: 0 };
  }
  
  console.log(`   Found ${collections.length} collection(s): ${collections.join(', ')}\n`);
  
  // Filter out users collection
  const collectionsToDelete = collections.filter(name => name !== 'users');
  const usersCollectionExists = collections.includes('users');
  
  if (usersCollectionExists) {
    console.log('👤 Skipping "users" collection (will be preserved)');
  }
  
  if (collectionsToDelete.length === 0) {
    console.log('   ℹ️  No collections to delete (only users collection exists)\n');
    return { collections: 0, documents: 0 };
  }
  
  console.log(`📦 Will delete ${collectionsToDelete.length} collection(s):\n   ${collectionsToDelete.join(', ')}\n`);
  
  let totalDeleted = 0;
  let collectionsDeleted = 0;
  
  for (const collectionName of collectionsToDelete) {
    console.log(`📦 Cleaning collection: ${collectionName}`);
    const count = await deleteCollection(db, collectionName);
    totalDeleted += count;
    collectionsDeleted++;
  }
  
  console.log(`\n✅ Total collections deleted: ${collectionsDeleted}`);
  console.log(`✅ Total documents deleted: ${totalDeleted}`);
  
  if (usersCollectionExists) {
    console.log(`✅ Users collection preserved ✓`);
  }
  
  return { collections: collectionsDeleted, documents: totalDeleted };
}

/**
 * Mode 1: Nuclear Option - Delete everything
 */
async function nuclearCleanup() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║               🚨 NUCLEAR OPTION 🚨                         ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('\n⚠️  This will permanently delete:');
  console.log('   • ALL Firebase Auth users');
  console.log('   • ALL Firestore collections (automatically discovered)');
  console.log('   • ALL Firestore subcollections (recursive)');
  console.log('\n🚨 THIS OPERATION CANNOT BE UNDONE! 🚨\n');
  
  // Confirmation
  const confirm1 = await askQuestion('Are you ABSOLUTELY sure? (yes/no): ');
  if (confirm1.toLowerCase() !== 'yes') {
    console.log('\n❌ Cleanup cancelled.');
    return false;
  }
  
  const confirm2 = await askQuestion('\n⚠️  Type "DELETE ALL DATA" to confirm: ');
  if (confirm2 !== 'DELETE ALL DATA') {
    console.log('\n❌ Cleanup cancelled. Confirmation text did not match.');
    return false;
  }
  
  console.log('\n🚀 Starting nuclear cleanup...\n');
  
  // Initialize Firebase
  console.log('📡 Connecting to Firebase...');
  initializeFirebase();
  const auth = getAuth();
  const db = getFirestore();
  console.log('✅ Connected to Firebase\n');
  
  const startTime = Date.now();
  
  // Delete Auth users
  const authUsersDeleted = await deleteAllAuthUsers(auth);
  
  // Delete all Firestore collections
  const firestoreStats = await deleteAllCollections(db);
  
  const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
  
  // Summary
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║            Nuclear Cleanup Complete!                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('\n📊 Summary:');
  console.log(`   • Firebase Auth users deleted: ${authUsersDeleted}`);
  console.log(`   • Firestore collections deleted: ${firestoreStats.collections}`);
  console.log(`   • Firestore documents deleted: ${firestoreStats.documents}`);
  console.log(`   • Time elapsed: ${elapsedTime}s`);
  console.log('\n✅ ALL Firebase data has been cleared!\n');
  
  return true;
}

/**
 * Mode 2: Keep Users - Preserve user accounts
 */
async function keepUsersCleanup() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║            Keep Users Mode (Safer)                        ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('\n⚠️  This will permanently delete:');
  console.log('   • ALL Firestore collections (EXCEPT users)');
  console.log('   • ALL Firestore subcollections (recursive)');
  console.log('\n✅ This will PRESERVE:');
  console.log('   • Firebase Auth users');
  console.log('   • Users collection in Firestore');
  console.log('\n💡 This is the SAFE option for resetting test data.\n');
  
  // Single confirmation (safer mode doesn't need double confirm)
  const confirm = await askQuestion('Continue with cleanup? (yes/no): ');
  if (confirm.toLowerCase() !== 'yes') {
    console.log('\n❌ Cleanup cancelled.');
    return false;
  }
  
  console.log('\n🚀 Starting cleanup (preserving users)...\n');
  
  // Initialize Firebase
  console.log('📡 Connecting to Firebase...');
  initializeFirebase();
  const db = getFirestore();
  console.log('✅ Connected to Firebase\n');
  
  const startTime = Date.now();
  
  // Delete Firestore collections (except users)
  const firestoreStats = await deleteAllCollectionsExceptUsers(db);
  
  const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
  
  // Summary
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║              Cleanup Complete (Users Safe)                ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('\n📊 Summary:');
  console.log(`   • Firestore collections deleted: ${firestoreStats.collections}`);
  console.log(`   • Firestore documents deleted: ${firestoreStats.documents}`);
  console.log(`   • Users collection: PRESERVED ✓`);
  console.log(`   • Auth users: PRESERVED ✓`);
  console.log(`   • Time elapsed: ${elapsedTime}s`);
  console.log('\n✅ Cleanup complete - users preserved!\n');
  console.log('💡 Next step: Run "cd backend && npm run seed" to populate fresh data\n');
  
  return true;
}

/**
 * Main function
 */
async function main() {
  try {
    const choice = await showMenu();
    
    switch (choice) {
      case '1':
        await nuclearCleanup();
        break;
      case '2':
        await keepUsersCleanup();
        break;
      case '3':
        console.log('\n✅ Operation cancelled. No changes made.\n');
        break;
      default:
        console.log('\n❌ Invalid choice. Exiting...\n');
        break;
    }
  } catch (error) {
    console.error('\n❌ Operation failed:', error.message);
    if (process.env.NODE_ENV === 'development') {
      console.error('\nError details:', error);
    }
    process.exit(1);
  } finally {
    rl.close();
    process.exit(0);
  }
}

// Run main
main();
