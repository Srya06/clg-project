import rateLimit, { Options } from 'express-rate-limit';
import { Request, Response } from 'express';

// Minimal interface for what we use from req.rateLimit
interface RateLimitedRequest extends Request {
  rateLimit: {
    resetTime: Date;
  };
}

/**
 * Standard response when a client is rate-limited.
 */
const rateLimitHandler = (req: Request, res: Response): void => {
  const resetTime = (req as RateLimitedRequest).rateLimit?.resetTime;
  const retryAfter = resetTime
    ? Math.ceil(resetTime.getTime() / 1000 - Date.now() / 1000)
    : 60;

  res.status(429).json({
    success: false,
    message: 'Too many requests. Please slow down and try again later.',
    retryAfter,
  });
};

/**
 * AUTH rate limiter — Strict.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 5000 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: rateLimitHandler,
} as Partial<Options>);

/**
 * GENERAL API rate limiter — Normal.
 */
export const apiLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 5000 : (Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100),
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  handler: rateLimitHandler,
} as Partial<Options>);

/**
 * HOD Login rate limiter — Strictly enforced in all environments.
 * 5 attempts per 15 minutes to protect the privileged HOD endpoint.
 */
export const hodLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 100 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  message: 'Too many HOD login attempts. Access locked for 15 minutes.',
} as Partial<Options>);
