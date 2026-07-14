import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../helpers/jwt.js';
import { CustomError } from '../helpers/CustomError.js';

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new CustomError(401, 'Unauthorized: No token provided'));
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    (req as any).user = payload;
    next();
  } catch (error) {
    next(new CustomError(401, 'Unauthorized: Invalid token'));
  }
}
