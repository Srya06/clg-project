import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';
import { AppError } from '../utils';

export const validateRequest = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorDetails = error.details.map((detail) => detail.message);
      console.error('Validation Error details:', errorDetails);

      const appErr = new AppError('Validation failed', 400);
      appErr.errorsArray = errorDetails; // Pack array natively to trigger error format structure
      return next(appErr);
    }

    req.body = value;
    next();
  };
};

export default validateRequest;
