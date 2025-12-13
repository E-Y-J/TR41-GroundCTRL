const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const healthRoutes = require('./health');
const firebaseRoutes = require('./firebase');
const apiRoutes = require('./api');

// Route grouping with version prefix
router.use('/auth', authRoutes);
router.use('/health', healthRoutes);
router.use('/firebase', firebaseRoutes);
router.use('/', apiRoutes);

module.exports = router;
