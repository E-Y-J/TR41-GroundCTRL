const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Firestore reference
const db = admin.firestore();

// Firebase status endpoint (new structure)
router.get('/status', async (req, res) => {
  try {
    await db.listCollections(); // Simple check that Firestore responds
    res.json({
      firebase: 'connected',
      projectId: process.env.FIREBASE_PROJECT_ID,
      status: 'success',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      firebase: 'error',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Backward compatibility for old endpoint
router.get('/-status', async (req, res) => {
  try {
    await db.listCollections(); // Simple check that Firestore responds
    res.json({
      firebase: 'connected',
      projectId: process.env.FIREBASE_PROJECT_ID,
      status: 'success',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      firebase: 'error',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = router;
