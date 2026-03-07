import type { Request } from 'express';

/** User row from DB (users table). */
export interface UserRow {
  id: string;
  email: string;
  password_hash: string | null;
  name: string | null;
  created_at?: string;
  updated_at?: string;
}

/** Minimal user after JWT decode (before loadUser). */
export interface UserJwt {
  id: string;
  email: string;
}

/** Express Request with user (set by auth middleware). */
export interface RequestWithUser extends Request {
  user?: UserRow | UserJwt | null;
}

/** Co-host row shape from DB (with joined user_email, user_name). */
export interface CoHostRow {
  id: string;
  user_id: string;
  added_by: string | null;
  display_name: string | null;
  permissions: string | null;
  created_at: string;
  user_email?: string;
  user_name?: string | null;
}

/** Service error thrown with a code (mapped to HTTP in routes). */
export interface ServiceError extends Error {
  code?: string;
}
