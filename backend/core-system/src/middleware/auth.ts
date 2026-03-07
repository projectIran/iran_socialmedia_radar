import type { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { sendError, ERROR_CODES } from '../errors';
import type { UserRepository } from '../repositories/UserRepository';
import type { RequestWithUser } from '../types';

export function optionalAuth(req: RequestWithUser, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  const token = header && header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    req.user = null;
    next();
    return;
  }
  try {
    const payload = jwt.verify(token, config.jwtSecret) as { sub: string; email?: string };
    req.user = { id: payload.sub, email: payload.email ?? '' };
    next();
  } catch {
    req.user = null;
    next();
  }
}

export function requireAuth(req: RequestWithUser, res: Response, next: NextFunction): void | Response {
  const header = req.headers.authorization;
  const token = header && header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return sendError(res, ERROR_CODES.AUTH_REQUIRED);
  }
  try {
    const payload = jwt.verify(token, config.jwtSecret) as { sub: string; email?: string };
    req.user = { id: payload.sub, email: payload.email || '' };
    next();
  } catch {
    return sendError(res, ERROR_CODES.TOKEN_INVALID);
  }
}

export function createLoadUser(userRepo: UserRepository) {
  return async function loadUser(req: RequestWithUser, res: Response, next: NextFunction): Promise<void | Response> {
    if (!req.user || !req.user.id) {
      return sendError(res, ERROR_CODES.AUTH_REQUIRED);
    }
    try {
      const user = await userRepo.findById(req.user.id);
      if (!user) {
        return sendError(res, ERROR_CODES.USER_NOT_FOUND);
      }
      req.user = user;
      next();
    } catch {
      return sendError(res, ERROR_CODES.LOAD_USER_FAILED);
    }
  };
}
