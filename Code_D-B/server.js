require('dotenv').config();

// MUST be first - validate environment before anything else
const validateEnv = require('./src/utils/validateEnv');
const validatedEnv = validateEnv();

// Now safe to import other modules
const app = require('./src/app');
const connectDatabase = require('./src/config/database');
const logger = require('./src/utils/logger');
const initializeScheduledJobs = require('./src/jobs/scheduledJobs');

// Catch Uncaught Exceptions
process.on('uncaughtException', err => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(`${err.name}: ${err.message}\n${err.stack}`);
  process.exit(1);
});

// Init DB connections and Cron schedules
if (typeof connectDatabase === 'function') {
  connectDatabase();
} else if (typeof connectDatabase.connectDB === 'function') {
  connectDatabase.connectDB();
}

initializeScheduledJobs();

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
  logger.info(`App running on port ${port} in ${process.env.NODE_ENV} mode...`);
  logger.info(`Test the backend API here: http://localhost:${port}/health`);
});

// Catch Unhandled Rejections
process.on('unhandledRejection', err => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(`${err.name}: ${err.message}\n${err.stack}`);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    logger.info('💥 Process terminated!');
  });
});
