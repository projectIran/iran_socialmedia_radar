import type { Response, NextFunction } from 'express';
import { canAccess, isAdmin, isAdminByEmailOrId } from '../utils/permissions';
import { sendError, ERROR_CODES } from '../errors';
import type { CoHostRepository } from '../repositories/CoHostRepository';
import type { RequestWithUser } from '../types';

export function createRequirePermission(coHostRepo: CoHostRepository) {
  return function requirePermission(permission: string) {
    return async function (req: RequestWithUser, res: Response, next: NextFunction): Promise<void | Response> {
      if (!req.user || !req.user.id) {
        return sendError(res, ERROR_CODES.AUTH_REQUIRED);
      }
      if (isAdmin(req.user.id)) {
        next();
        return;
      }
      const perms = await coHostRepo.getPermissions(req.user.id);
      if (canAccess(req.user.id, permission, perms)) {
        next();
        return;
      }
      return sendError(res, ERROR_CODES.INSUFFICIENT_PERMISSIONS, { details: { required: permission } });
    };
  };
}

export function requireAdmin(req: RequestWithUser, res: Response, next: NextFunction): void | Response {
  if (!req.user || !req.user.id) {
    return sendError(res, ERROR_CODES.AUTH_REQUIRED);
  }
  const email = 'email' in req.user ? req.user.email : undefined;
  if (isAdmin(req.user.id) || isAdminByEmailOrId(req.user.id, email)) {
    next();
    return;
  }
  return sendError(res, ERROR_CODES.ADMIN_ONLY);
}
