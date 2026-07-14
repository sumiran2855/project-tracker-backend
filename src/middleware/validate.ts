import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { CustomError } from '../helpers/CustomError.js';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errorMsg = result.error.errors.map(e => e.message).join(', ');
      return next(new CustomError(400, errorMsg));
    }
    req.body = result.data;
    next();
  };
}
