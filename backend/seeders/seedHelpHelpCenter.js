// seedHelpHelpCenter.js

/**
 * Seed GroundCTRL Help Center categories + articles into Firestore.
 *
 * Usage:
 *   - Ensure .env file is configured with Firebase credentials
 *   - Run: node seeders/seedHelpHelpCenter.js
 */

// Load environment variables from .env file
require('dotenv').config();

const { initializeFirebase, getFirestore } = require('../src/config/firebase');

// ---------------------------------------------------------------------------
// Firebase initialization (uses .env configuration)
// ---------------------------------------------------------------------------

// Initialize Firebase Admin SDK
initializeFirebase();
const db = getFirestore();

// ---------------------------------------------------------------------------
// Category definitions (help_categories)
// Codes must match categoryEnum in helpSchemas.js [file:12]
// ---------------------------------------------------------------------------

const CATEGORY_DEFS = [
  {
    code: 'GETTING_STARTED',
    name: 'Getting Started',
    description: 'Core onboarding and first-steps guides for new GroundCTRL operators.',
    icon: 'rocket',
    color: '#2563EB',
    orderIndex: 0,
    isActive: true,
  },
  {
    code: 'MISSIONS',
    name: 'Missions & Objectives',
    description: 'Mission structure, objectives, difficulty levels, and mission points.',
    icon: 'target',
    color: '#16A34A',
    orderIndex: 1,
    isActive: true,
  },
  {
    code: 'SATELLITE_OPERATIONS',
    name: 'Satellite Operations',
    description: 'Subsystems, power, thermal control, attitude, and orbital basics.',
    icon: 'satellite',
    color: '#F97316',
    orderIndex: 2,
    isActive: true,
  },
  {
    code: 'COMMUNICATIONS',
    name: 'Communications',
    description: 'Ground stations, links, downlink procedures, and signal quality.',
    icon: 'radio',
    color: '#0EA5E9',
    orderIndex: 3,
    isActive: true,
  },
  {
    code: 'NOVA_AI',
    name: 'Nova AI Assistant',
    description: 'Using Nova as an AI guide during training missions.',
    icon: 'sparkles',
    color: '#A855F7',
    orderIndex: 4,
    isActive: true,
  },
  {
    code: 'ACCOUNT_SETTINGS',
    name: 'Account & Settings',
    description: 'Account configuration, notifications, and progress tracking.',
    icon: 'settings',
    color: '#6B7280',
    orderIndex: 5,
    isActive: true,
  },
];

// ---------------------------------------------------------------------------
// Helper: simple slug generator from title (lowercase, hyphenated)
// ---------------------------------------------------------------------------

function makeSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 200);
}

// ---------------------------------------------------------------------------
// Article definitions (high level) – content is minimal but schema-valid
// All views start at 0 via articleStats or default [file:12]
// ---------------------------------------------------------------------------

const ARTICLE_DEFS = [
  // Getting Started (5)
  {
    categoryCode: 'GETTING_STARTED',
    title: 'Welcome to GroundCTRL',
    description: 'An introduction to the GroundCTRL satellite operations training simulator.',
    estimatedReadMinutes: 3,
  },
  {
    categoryCode: 'GETTING_STARTED',
    title: 'Creating Your Account',
    description: 'Step-by-step guide to account creation and initial setup.',
    estimatedReadMinutes: 4,
  },
  {
    categoryCode: 'GETTING_STARTED',
    title: 'Understanding the Dashboard',
    description: 'Navigate and understand all dashboard components.',
    estimatedReadMinutes: 5,
  },
  {
    categoryCode: 'GETTING_STARTED',
    title: 'Your First Mission',
    description: 'A walkthrough of completing your first satellite mission.',
    estimatedReadMinutes: 6,
  },
  {
    categoryCode: 'GETTING_STARTED',
    title: 'Navigating the Simulator',
    description: 'Learn to navigate the satellite operations simulator interface.',
    estimatedReadMinutes: 5,
  },

  // Missions & Objectives (5)
  {
    categoryCode: 'MISSIONS',
    title: 'Mission Types Explained',
    description: 'Understanding the different types of training missions available.',
    estimatedReadMinutes: 6,
  },
  {
    categoryCode: 'MISSIONS',
    title: 'Understanding Objectives',
    description: 'How mission objectives work and strategies for completion.',
    estimatedReadMinutes: 6,
  },
  {
    categoryCode: 'MISSIONS',
    title: 'Earning Mission Points (MP)',
    description: 'How to earn and use Mission Points in GroundCTRL.',
    estimatedReadMinutes: 4,
  },
  {
    categoryCode: 'MISSIONS',
    title: 'Mission Difficulty Levels',
    description: 'Understanding mission difficulty ratings and prerequisites.',
    estimatedReadMinutes: 5,
  },
  {
    categoryCode: 'MISSIONS',
    title: 'Completing Your First Orbit',
    description: 'Walkthrough of the introductory orbital mechanics mission.',
    estimatedReadMinutes: 7,
  },

  // Satellite Operations (5)
  {
    categoryCode: 'SATELLITE_OPERATIONS',
    title: 'Satellite Subsystems Overview',
    description: 'Introduction to the major satellite subsystems you will manage.',
    estimatedReadMinutes: 6,
  },
  {
    categoryCode: 'SATELLITE_OPERATIONS',
    title: 'Power Management',
    description: 'Managing satellite power generation and consumption.',
    estimatedReadMinutes: 6,
  },
  {
    categoryCode: 'SATELLITE_OPERATIONS',
    title: 'Thermal Control',
    description: 'Understanding and managing satellite thermal conditions.',
    estimatedReadMinutes: 6,
  },
  {
    categoryCode: 'SATELLITE_OPERATIONS',
    title: 'Attitude Control & Orientation',
    description: 'How to control and monitor satellite orientation.',
    estimatedReadMinutes: 7,
  },
  {
    categoryCode: 'SATELLITE_OPERATIONS',
    title: 'Orbital Mechanics Basics',
    description: 'Fundamental concepts of orbital mechanics for operators.',
    estimatedReadMinutes: 8,
  },

  // Communications (5)
  {
    categoryCode: 'COMMUNICATIONS',
    title: 'Ground Station Contacts',
    description: 'Understanding ground station networks and contact scheduling.',
    estimatedReadMinutes: 5,
  },
  {
    categoryCode: 'COMMUNICATIONS',
    title: 'Establishing Communication Links',
    description: 'How to establish and maintain satellite communication links.',
    estimatedReadMinutes: 6,
  },
  {
    categoryCode: 'COMMUNICATIONS',
    title: 'Data Downlink Procedures',
    description: 'Step-by-step data downlink and retrieval processes.',
    estimatedReadMinutes: 6,
  },
  {
    categoryCode: 'COMMUNICATIONS',
    title: 'Signal Strength & Quality',
    description: 'Monitoring and optimizing communication signal quality.',
    estimatedReadMinutes: 6,
  },
  {
    categoryCode: 'COMMUNICATIONS',
    title: 'Communication Windows',
    description: 'Planning around satellite visibility and communication windows.',
    estimatedReadMinutes: 5,
  },

  // Nova AI Assistant (5)
  {
    categoryCode: 'NOVA_AI',
    title: 'Introduction to Nova',
    description: 'Meet Nova, your AI guide for satellite operations training.',
    estimatedReadMinutes: 4,
  },
  {
    categoryCode: 'NOVA_AI',
    title: 'Asking Effective Questions',
    description: 'Tips for communicating effectively with the Nova AI.',
    estimatedReadMinutes: 5,
  },
  {
    categoryCode: 'NOVA_AI',
    title: 'Using Hints Strategically',
    description: 'When and how to use Nova’s hint system effectively.',
    estimatedReadMinutes: 5,
  },
  {
    categoryCode: 'NOVA_AI',
    title: 'Understanding Nova\'s Guidance',
    description: 'How Nova\'s guidance system works and adapts to you.',
    estimatedReadMinutes: 5,
  },
  {
    categoryCode: 'NOVA_AI',
    title: 'Nova Commands Reference',
    description: 'Complete reference of Nova commands and capabilities.',
    estimatedReadMinutes: 7,
  },

  // Account & Settings (5)
  {
    categoryCode: 'ACCOUNT_SETTINGS',
    title: 'Account Settings',
    description: 'How to access and modify your account settings.',
    estimatedReadMinutes: 4,
  },
  {
    categoryCode: 'ACCOUNT_SETTINGS',
    title: 'Profile Customization',
    description: 'Customize your GroundCTRL operator profile.',
    estimatedReadMinutes: 4,
  },
  {
    categoryCode: 'ACCOUNT_SETTINGS',
    title: 'Notification Preferences',
    description: 'Managing email and in-app notification settings.',
    estimatedReadMinutes: 4,
  },
  {
    categoryCode: 'ACCOUNT_SETTINGS',
    title: 'Progress & Statistics',
    description: 'Understanding your progress tracking and statistics.',
    estimatedReadMinutes: 5,
  },
];

// ---------------------------------------------------------------------------
// Build Firestore article payload matching createArticleSchema [file:12]
// ---------------------------------------------------------------------------

function buildArticleDoc(def, categoryId, orderIndexWithinCategory) {
  const slug = makeSlug(def.title);

  // Minimal but valid content: a heading + paragraph using contentBlockSchema [file:12]
  const contentBlocks = [
    {
      type: 'HEADING',
      level: 1,
      content: def.title,
    },
    {
      type: 'PARAGRAPH',
      content: def.description,
    },
  ];

  const doc = {
    // Identification
    slug,
    title: def.title,
    excerpt: def.description,

    // Classification
    category_id: categoryId,
    type: 'GUIDE',
    difficulty: 'BEGINNER',
    tags: [],

    // Content
    content: contentBlocks,
    plainTextContent: def.description,

    // Status & Visibility
    status: 'PUBLISHED',
    isActive: true,
    isFeatured: false,
    isPinned: false,

    // Ordering
    orderIndex: orderIndexWithinCategory,

    // Reading Experience
    estimatedReadMinutes: def.estimatedReadMinutes,

    // SEO
    seo: {
      metaTitle: def.title,
      metaDescription: def.description,
      keywords: [],
      noIndex: false,
    },

    // Version Control
    version: '1.0.0',

    // Scheduling
    publishedAt: new Date().toISOString(),
    lastReviewedAt: new Date().toISOString(),

    // Stats
    stats: {
      views: 0,
      helpfulCount: 0,
      notHelpfulCount: 0,
      searchAppearances: 0,
      avgTimeOnPage_seconds: 0,
    },

    // Timestamps
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return doc;
}

// ---------------------------------------------------------------------------
// Seeding logic
// ---------------------------------------------------------------------------

async function seed() {
  console.log('Seeding GroundCTRL Help Center categories and articles...');

  // 1) Seed categories, indexed by code
  const categoryCodeToId = {};

  for (const cat of CATEGORY_DEFS) {
    const snapshot = await db
      .collection('help_categories')
      .where('code', '==', cat.code)
      .limit(1)
      .get();

    let docRef;

    if (!snapshot.empty) {
      // Reuse existing category
      docRef = snapshot.docs[0].ref;
      await docRef.update({
        ...cat,
        updatedAt: new Date().toISOString(),
      });
      console.log(`Updated category: ${cat.code}`);
    } else {
      docRef = await db.collection('help_categories').add({
        ...cat,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      console.log(`Created category: ${cat.code} -> ${docRef.id}`);
    }

    categoryCodeToId[cat.code] = docRef.id;
  }

  // 2) Seed articles
  const articlesByCategory = ARTICLE_DEFS.reduce((acc, art) => {
    if (!acc[art.categoryCode]) acc[art.categoryCode] = [];
    acc[art.categoryCode].push(art);
    return acc;
  }, {});

  for (const [categoryCode, articles] of Object.entries(articlesByCategory)) {
    const categoryId = categoryCodeToId[categoryCode];
    if (!categoryId) {
      console.warn(
        `Skipping articles for category ${categoryCode} because no matching help_categories document was found.`,
      );
      continue;
    }

    let orderIndex = 0;
    for (const art of articles) {
      const slug = makeSlug(art.title);

      // Idempotent upsert: find by slug + category_id
      const existing = await db
        .collection('help_articles')
        .where('slug', '==', slug)
        .where('category_id', '==', categoryId)
        .limit(1)
        .get();

      const docData = buildArticleDoc(art, categoryId, orderIndex);

      if (!existing.empty) {
        const ref = existing.docs[0].ref;
        await ref.update(docData);
        console.log(`Updated article: [${categoryCode}] ${art.title}`);
      } else {
        await db.collection('help_articles').add(docData);
        console.log(`Created article: [${categoryCode}] ${art.title}`);
      }

      orderIndex += 1;
    }
  }

  console.log('Seeding complete.');
}

// Execute if run directly
if (require.main === module) {
  seed()
    .then(() => {
      console.log('Done.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
}

module.exports = { seed };
