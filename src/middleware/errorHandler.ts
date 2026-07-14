import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../helpers/CustomError.js';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): any {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  console.error('🔥 Internal Server Error:', err);
  return res.status(500).json({
    success: false,
    message: 'An unexpected internal server error occurred',
  });
}
