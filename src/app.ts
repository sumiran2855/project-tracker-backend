import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { connectDatabase } from './config/db.js';
import apiRouter from './routes/api.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRouter);

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
