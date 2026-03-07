import type { Response } from 'express';

export interface ErrorCatalogEntry {
  status: number;
  message: string;
}

export const ERROR_CATALOG: Record<string, ErrorCatalogEntry> = {
  AUTH_REQUIRED: { status: 401, message: 'Authentication required' },
  TOKEN_INVALID: { status: 401, message: 'Invalid or expired token' },
  USER_NOT_FOUND: { status: 401, message: 'User not found' },
  EMAIL_EXISTS: { status: 409, message: 'Email already registered' },
  INVALID_CREDENTIALS: { status: 401, message: 'Invalid email or password' },
  VALIDATION_FAILED: { status: 400, message: 'Validation failed' },
  PASSWORD_WEAK: { status: 400, message: 'Password does not meet strength requirements' },
  MISSING_IDENTITY: { status: 400, message: 'Provide user_id or email' },
  CANNOT_ADD_SELF: { status: 400, message: 'Cannot add yourself as co-host' },
  FORBIDDEN: { status: 403, message: 'Forbidden' },
  ADMIN_ONLY: { status: 403, message: 'Admin only' },
  INSUFFICIENT_PERMISSIONS: { status: 403, message: 'Insufficient permissions' },
  COHOST_NOT_FOUND: { status: 404, message: 'Co-host not found' },
  TARGET_USER_NOT_FOUND: { status: 404, message: 'User not found' },
  NOT_FOUND: { status: 404, message: 'Not found' },
  LOAD_USER_FAILED: { status: 500, message: 'Failed to load user' },
  COHOST_LIST_FAILED: { status: 500, message: 'Failed to list co-hosts' },
  COHOST_ADD_FAILED: { status: 500, message: 'Failed to add co-host' },
  CAMPAIGN_NOT_FOUND: { status: 404, message: 'Email campaign not found' },
  PETITION_NOT_FOUND: { status: 404, message: 'Petition not found' },
  PERSONALIZATION_FAILED: { status: 502, message: 'AI personalization failed' },
  SHORTENER_FAILED: { status: 502, message: 'URL shortening failed' },
  RATE_LIMIT_EXCEEDED: { status: 429, message: 'Too many requests' },
};

export const ERROR_CODES = Object.freeze(
  Object.fromEntries(Object.keys(ERROR_CATALOG).map((k) => [k, k])) as Record<string, string>
);

export interface ErrorOverrides {
  message?: string;
  details?: unknown;
}

export interface ErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

export function errorPayload(code: string, overrides: ErrorOverrides = {}): ErrorPayload {
  const entry = ERROR_CATALOG[code];
  const message = overrides.message ?? entry?.message ?? code;
  const payload: ErrorPayload = { code, message };
  if (overrides.details !== undefined) payload.details = overrides.details;
  return payload;
}

export function errorStatus(code: string): number {
  return ERROR_CATALOG[code]?.status ?? 500;
}

export function sendError(res: Response, code: string, overrides: ErrorOverrides = {}): Response {
  const status = errorStatus(code);
  const payload = errorPayload(code, overrides);
  return res.status(status).json({ error: payload });
}
