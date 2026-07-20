import { Response } from 'express';

/**
 * SSE Manager — singleton Map of userId → active SSE Response objects.
 * Each user can have at most one active SSE connection (newest wins).
 */

interface SSEClient {
  res: Response;
  heartbeat: NodeJS.Timeout;
}

const clients = new Map<string, SSEClient>();

/**
 * Register a new SSE client for a given userId.
 * Automatically sends a heartbeat every 30s to keep the connection alive.
 */
export function registerSSEClient(userId: string, res: Response): void {
  // If an existing connection exists, close it cleanly before replacing
  const existing = clients.get(userId);
  if (existing) {
    clearInterval(existing.heartbeat);
    clients.delete(userId);
  }

  // Send initial connection acknowledgement
  res.write('event: connected\ndata: {"status":"ok"}\n\n');

  // Keep-alive heartbeat every 30 seconds
  const heartbeat = setInterval(() => {
    if (res.writableEnded) {
      clearInterval(heartbeat);
      clients.delete(userId);
      return;
    }
    res.write('event: ping\ndata: {"ts":' + Date.now() + '}\n\n');
  }, 30_000);

  clients.set(userId, { res, heartbeat });
}

/**
 * Unregister a client (called on request close).
 */
export function unregisterSSEClient(userId: string): void {
  const existing = clients.get(userId);
  if (existing) {
    clearInterval(existing.heartbeat);
    clients.delete(userId);
  }
}

/**
 * Send an SSE event to a specific user.
 * @param userId  The target user's MongoDB ID string
 * @param event   SSE event name (e.g. 'task-assigned', 'issue-created')
 * @param data    JSON-serialisable payload
 * @returns true if the client was connected and the event was sent
 */
export function sendSSEEvent(userId: string, event: string, data: object): boolean {
  const client = clients.get(userId);
  if (!client || client.res.writableEnded) {
    return false;
  }
  client.res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  return true;
}

/**
 * Returns whether a specific user currently has an active SSE connection.
 */
export function isSSEClientConnected(userId: string): boolean {
  const client = clients.get(userId);
  return !!client && !client.res.writableEnded;
}
