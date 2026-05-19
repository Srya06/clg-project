import mongoose from 'mongoose';
import logger from '../utils/logger';

const connectDB = async (): Promise<void> => {
  try {
    const uri =
      process.env.NODE_ENV === 'production'
        ? process.env.MONGODB_URI_PROD!
        : process.env.MONGODB_URI!;

    const maskedUri = uri.replace(/:([^@]+)@/, ':****@');
    logger.info(`Attempting to connect to: ${maskedUri}`);

    const conn = await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('connected', () => {
      logger.info('Mongoose connected to DB');
    });

    mongoose.connection.on('error', (err: Error) => {
      logger.error(`Mongoose connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('Mongoose disconnected');
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Error connecting to MongoDB: ${message}`);
    logger.info('Database connection failed. Retrying in 5 seconds...');
    setTimeout(() => connectDB(), 5000);
  }
};

export default connectDB;
