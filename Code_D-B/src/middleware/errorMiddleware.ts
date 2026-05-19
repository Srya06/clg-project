import { Request, Response, NextFunction } from 'express';
import { AppError, logger } from '../utils';

interface ExtendedError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
  code?: number;
  path?: string;
  value?: string;
  errmsg?: string;
  errors?: Record<string, { message: string }>;
  errorsArray?: string[];
}

const handleCastErrorDB = (err: ExtendedError): AppError => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err: ExtendedError): AppError => {
  const value = err.errmsg ? err.errmsg.match(/(["'])(\\?.)*?\1/)?.[0] : '';
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err: ExtendedError): AppError => {
  const errors = err.errors ? Object.values(err.errors).map((el) => el.message) : [];
  const message = `Invalid input data.`;
  return new AppError(message, 400, errors);
};

const handleJWTError = (): AppError =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = (): AppError =>
  new AppError('Your token has expired! Please log in again.', 401);

export default (
  err: ExtendedError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  err.statusCode = err.statusCode || 500;

  let error = { ...err };
  error.message = err.message;
  error.name = err.name;
  
  let errorsArray = err.errorsArray || [err.message];

  if (error.name === 'CastError') {
    error = handleCastErrorDB(error);
    errorsArray = [error.message];
  }
  if (error.code === 11000) {
    error = handleDuplicateFieldsDB(error);
    errorsArray = [error.message];
  }
  if (error.name === 'ValidationError') {
    const valErr = handleValidationErrorDB(error);
    error = valErr;
    errorsArray = (valErr as any).errorsArray || [];
  }
  if (error.name === 'JsonWebTokenError') {
    error = handleJWTError();
    errorsArray = [error.message];
  }
  if (error.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
    errorsArray = [error.message];
  }

  // Handle unhandled programming errors cleanly in prod
  if (process.env.NODE_ENV === 'production' && !error.isOperational) {
    logger.error('ERROR 💥', err);
    error.message = 'Something went very wrong!';
    errorsArray = ['Internal Server Error'];
    error.statusCode = 500;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message,
    errors:
      process.env.NODE_ENV === 'development' && !error.isOperational
        ? [err.message, err.stack]
        : errorsArray,
  });
};
