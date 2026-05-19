import dotenv from 'dotenv';
dotenv.config();

// MUST be first - validate environment before anything else
import validateEnv from './utils/validateEnv';
validateEnv();

// Now safe to import other modules
import app from './app';
import connectDatabase from './config/database';
import { logger } from './utils';
import initializeScheduledJobs from './jobs/scheduledJobs';

// Catch Uncaught Exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(`${err.name}: ${err.message}\n${err.stack}`);
  process.exit(1);
});

// Init DB connections and Cron schedules
const startServer = async () => {
  try {
    if (typeof connectDatabase === 'function') {
      await connectDatabase();
    } else if (connectDatabase && typeof (connectDatabase as any).connectDB === 'function') {
      await (connectDatabase as any).connectDB();
    }

    initializeScheduledJobs();

    const port = process.env.PORT || 5000;

    const server = app.listen(port, () => {
      logger.info(`App running on port ${port} in ${process.env.NODE_ENV} mode...`);
      logger.info(`Test the backend API here: http://localhost:${port}/health`);
    });

    // Catch Unhandled Rejections
    process.on('unhandledRejection', (err: any) => {
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
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
