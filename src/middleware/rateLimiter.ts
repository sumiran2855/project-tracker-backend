import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../helpers/CustomError.js';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

export interface RateLimiterOptions {
  windowMs: number;
  max: number;
  message?: string;
}

export function rateLimiter(options: RateLimiterOptions) {
  const store: RateLimitStore = {};

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    if (!store[ip]) {
      store[ip] = {
        count: 1,
        resetTime: now + options.windowMs,
      };
      return next();
    }

    const client = store[ip];

    // If window has passed, reset the client count
    if (now > client.resetTime) {
      client.count = 1;
      client.resetTime = now + options.windowMs;
      return next();
    }

    client.count++;

    if (client.count > options.max) {
      res.setHeader('Retry-After', Math.ceil((client.resetTime - now) / 1000));
      return next(new CustomError(429, options.message || 'Too many requests, please try again later.'));
    }

    next();
  };
}
