import dns from 'dns';

// Force standard Node.js lookup to prefer IPv4
dns.setDefaultResultOrder('ipv4first');

// Monkeypatch IPv6 DNS resolvers to force fallback to IPv4
const mockResolve6 = (hostname: string, ...args: any[]) => {
  const callback = args[args.length - 1];
  if (typeof callback === 'function') {
    callback(null, []);
  }
};

(dns as any).resolve6 = mockResolve6;
if (dns.Resolver && dns.Resolver.prototype) {
  (dns.Resolver.prototype as any).resolve6 = mockResolve6;
}

if (dns.promises) {
  (dns.promises as any).resolve6 = async () => [];
  if (dns.promises.Resolver && dns.promises.Resolver.prototype) {
    (dns.promises.Resolver.prototype as any).resolve6 = async () => [];
  }
}

import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { env } from './config/env.js';
import { connectDatabase } from './config/db.js';
import apiRouter from './routes/api.js';
import { errorHandler } from './middleware/errorHandler.js';
import { rateLimiter } from './middleware/rateLimiter.js';

const app = express();

// Trust proxy for correct IP determination behind reverse proxies
app.set('trust proxy', 1);

// Middlewares
app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploads statically
app.use('/uploads', express.static(uploadsDir));

// General rate limiter for all API routes (150 requests per 15 mins)
const generalRateLimit = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Too many requests, please try again after 15 minutes.',
});

// Routes
app.use('/api', generalRateLimit, apiRouter);

// Healthcheck Route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Fallback Route
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
});

// Error handling middleware (must be registered last)
app.use(errorHandler);

// Connect database and start server
async function bootstrap() {
  await connectDatabase();
  
  app.listen(env.PORT, () => {
    console.log(`🚀 Server is running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  });
}

bootstrap().catch(err => {
  console.error('❌ Failed to start the server:', err);
  process.exit(1);
});

export default app;
