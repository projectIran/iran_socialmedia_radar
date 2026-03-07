import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';

const SESSION_HEADER = 'x-session-id';

export function getOrCreateSessionId(req: Request, res: Response): string {
  const fromHeader = req.headers[SESSION_HEADER];
  const existing = typeof fromHeader === 'string' ? fromHeader.trim() : null;
  if (existing) return existing;
  const newId = randomUUID();
  res.setHeader(SESSION_HEADER, newId);
  return newId;
}

export function getSessionId(req: Request): string | null {
  const fromHeader = req.headers[SESSION_HEADER];
  const s = typeof fromHeader === 'string' ? fromHeader.trim() : null;
  return s || null;
}
