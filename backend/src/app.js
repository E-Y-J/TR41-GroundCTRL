/**
 * Express App Configuration
 * Initializes Express app with middleware and routes
 */

require('dotenv').config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
});
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const { initializeFirebase } = require('./config/firebase');
const swaggerSpec = require('./config/swagger');
const missionControl = require('./config/missionControl');
const auditLogger = require('./middleware/auditLogger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const authErrorNormalizer = require('./middleware/authErrorNormalizer');
const { apiLimiter } = require('./middleware/rateLimiter');
const { responseEnvelopeMiddleware } = require('./middleware/responseEnvelope');
const routes = require('./routes');
const logger = require('./utils/logger');

// Initialize Express app
const app = express();

console.log('DEBUG: App starting, about to initialize Firebase');

// Initialize Firebase
try {
  initializeFirebase();
} catch (error) {
  logger.error('Failed to initialize Firebase', { error: error.message });
  process.exit(1);
}

// Security headers middleware
app.use((req, res, next) => {
  console.log('DEBUG: Setting security headers');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  console.log('DEBUG: Headers set:', res.getHeaders());
  next();
});

// Security headers middleware (helmet)
if (process.env.NODE_ENV !== 'test') {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for now
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }));
}

// CORS configuration
if (process.env.NODE_ENV !== 'test') {
  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : ['http://localhost:3001', 'http://localhost:5173'];

  logger.info('CORS Configuration', {
    nodeEnv: process.env.NODE_ENV,
    allowedOriginsEnv: process.env.ALLOWED_ORIGINS,
    allowedOriginsArray: allowedOrigins
  });

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // Allow cookies/credentials with allowed origins
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  console.log('DEBUG: CORS allowedOrigins:', allowedOrigins);
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy (required for Cloud Run to get real client IPs from X-Forwarded-* headers)
app.set('trust proxy', 1);

// Response envelope middleware (must be early to wrap all responses)
// app.use(responseEnvelopeMiddleware); // Temporarily disabled for testing

// Global API rate limiter (applied to all routes)
// app.use(apiLimiter); // Temporarily disabled for testing

// Request logging middleware
app.use(auditLogger);

// Swagger API Documentation
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'GroundCTRL API Documentation',
  customfavIcon: '/favicon.ico'
}));

// API Routes (versioned)
app.use('/api/v1', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'GroundCTRL API',
    version: missionControl.version,
    status: 'operational',
    documentation: '/api/v1/docs',
    health: '/api/v1/health'
  });
});

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Auth error normalizer (must be before global error handler)
app.use(authErrorNormalizer);

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
