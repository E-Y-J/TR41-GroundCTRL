/**
 * Master Seeder
 * Runs all help domain seeders in the correct order
 */

const { getFirestore } = require('../src/config/firebase');
const { seedHelpCategories } = require('./helpCategoriesSeeder');
const { seedHelpArticles } = require('./helpArticlesSeeder');
const { seedHelpFaqs } = require('./helpFaqsSeeder');

async function seedAll() {
  console.log('🚀 Starting Help Domain Seeding...\n');

  try {
    // Step 1: Seed categories first (needed for foreign keys)
    console.log('Step 1: Seeding categories...');
    await seedHelpCategories();
    
    // Get category IDs to map to articles/FAQs
    const db = getFirestore();
    const categoriesSnapshot = await db.collection('help_categories').get();
    const categoryMap = {};
    
    categoriesSnapshot.forEach(doc => {
      const data = doc.data();
      categoryMap[`PLACEHOLDER_${data.code}`] = doc.id;
    });
    
    console.log('✅ Category ID mapping created\n');

    // Step 2: Seed articles
    console.log('Step 2: Seeding articles...');
    await seedHelpArticles(categoryMap);
    console.log('');

    // Step 3: Seed FAQs
    console.log('Step 3: Seeding FAQs...');
    await seedHelpFaqs(categoryMap);
    console.log('');

    console.log('🎉 All help domain data seeded successfully!');
    console.log('\nSummary:');
    console.log(`- Categories: ${categoriesSnapshot.size}`);
    console.log('- Articles: 3');
    console.log('- FAQs: 8');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedAll()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { seedAll };
