require('dotenv').config();
const app = require('./app');

// Get port from environment variables or default to 3001
const PORT = process.env.PORT || 3001;

// Start the server
const server = app.listen(PORT, () => {
  console.log(`\n🚀 GroundCTRL Backend is running on port ${PORT}`);
  console.log(`➡️  Base API: http://localhost:${PORT}/api/v1`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/api/v1/health`);
  console.log(`🔥  Firebase Status: http://localhost:${PORT}/api/v1/firebase/status`);
  console.log(`🔒  Auth Routes: http://localhost:${PORT}/api/v1/auth/{register,login,logout,me}\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  server.close(() => process.exit(1));
});

// Graceful shutdown (CTRL+C)
process.on('SIGINT', () => {
  console.log('\n🛑 Server shutting down...');
  server.close(() => {
    console.log('Server closed gracefully.');
    process.exit(0);
  });
});
