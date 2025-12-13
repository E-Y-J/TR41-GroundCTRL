require('dotenv').config();
const express = require('express');
const admin = require('firebase-admin');
const { notFoundHandler, errorHandler } = require('./middleware/error');

const app = express();

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});

// Middleware
app.use(express.json());

// API versioning and routing
app.use('/api/v1', require('./routes'));

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
