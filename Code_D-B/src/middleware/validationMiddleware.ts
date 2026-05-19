import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';

const validate =
  (schema: ObjectSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map((d) => d.message),
      });
      return;
    }

    req.body = value; // replace with sanitised, cast values
    next();
  };

export default validate;
