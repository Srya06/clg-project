import { protect } from './authMiddleware';
import authorizeRole from './roleMiddleware';
import errorMiddleware from './errorMiddleware';
import validationMiddleware from './validationMiddleware';
import { authLimiter, apiLimiter } from './rateLimitMiddleware';
import corsMiddleware from './corsMiddleware';
import helmetMiddleware from './helmetMiddleware';
import requestLoggerMiddleware from './requestLoggerMiddleware';
import { uploadResume, handleResumeUpload } from './fileUploadMiddleware';

export {
  protect,
  authorizeRole,
  errorMiddleware,
  validationMiddleware,
  authLimiter,
  apiLimiter,
  corsMiddleware,
  helmetMiddleware,
  requestLoggerMiddleware,
  uploadResume,
  handleResumeUpload,
};
