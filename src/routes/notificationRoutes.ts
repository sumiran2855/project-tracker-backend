import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { registerSSEClient, unregisterSSEClient } from '../helpers/sseManager.js';

const router = Router();

/**
 * GET /api/notifications/stream
 *
 * Server-Sent Events endpoint.  The client opens this once on app load and
 * keeps it open.  The backend pushes events whenever something relevant
 * happens (task assigned, issue created, etc.).
 */
router.get('/stream', requireAuth, (req: Request, res: Response) => {
  const userId: string = (req as any).user.userId;

  // ── SSE headers ──────────────────────────────────────────────────────────
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable Nginx buffering on Render
  res.flushHeaders();

  // ── Register ──────────────────────────────────────────────────────────────
  registerSSEClient(userId, res);

  // ── Clean up on client disconnect ─────────────────────────────────────────
  req.on('close', () => {
    unregisterSSEClient(userId);
  });
});

export default router;
