import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import routes from './routes';
import { AppError } from './utils';
import './models'; // Register all Mongoose models globally

// --- Middleware imports ---
import helmetMiddleware from './middleware/helmetMiddleware';
import corsMiddleware from './middleware/corsMiddleware';
import requestLogger from './middleware/requestLoggerMiddleware';
import errorMiddleware from './middleware/errorMiddleware';
import { authLimiter, apiLimiter } from './middleware/rateLimitMiddleware';
import swaggerSetup from './config/swagger';

const app = express();

// 1. Security headers
app.use(helmetMiddleware);

// 2. CORS
app.use(corsMiddleware);

// 3. HTTP request logger
app.use(requestLogger);

// 4. Body parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 5. Serve uploaded resumes as static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 6. Rate limiting
app.use('/api/v1/auth', authLimiter);
app.use('/api', apiLimiter);

// 7. Health Check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'ok',
    uptime: process.uptime()
  });
});

// 8. Swagger Documentation
if (typeof swaggerSetup === 'function') {
  swaggerSetup(app);
}

// 9. API routes
app.use('/api/v1', routes);

// 10. 404 handler
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 11. Global error handler
app.use(errorMiddleware);

export default app;
