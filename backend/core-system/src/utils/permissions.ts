import { config } from '../config/config';

export const PERMISSIONS = Object.freeze({
  MEDIA_SUPPORT: 'media_support',
  EMAIL_CAMPAIGN: 'email_campaign',
  FEEDBACK: 'feedback',
  STATS: 'stats',
});

export const COHOST_PERMISSIONS: readonly string[] = Object.values(PERMISSIONS);

export function isAdmin(userId: string | null | undefined): boolean {
  if (userId == null) return false;
  return config.adminIds.includes(String(userId));
}

export function isAdminByEmailOrId(userId: string | null | undefined, email?: string | null): boolean {
  if (isAdmin(userId)) return true;
  if (email && config.adminEmails.length > 0) {
    const normalized = String(email).trim().toLowerCase();
    return config.adminEmails.includes(normalized);
  }
  return false;
}

export function getUserPermissions(userId: string | null | undefined, coHostPermissions: string[] = []): string[] {
  if (isAdmin(userId)) return [...COHOST_PERMISSIONS];
  return Array.isArray(coHostPermissions) ? coHostPermissions.filter((p) => typeof p === 'string') : [];
}

export function canAccess(
  userId: string | null | undefined,
  permission: string,
  coHostPermissions: string[] = []
): boolean {
  if (!permission || typeof permission !== 'string') return false;
  if (isAdmin(userId)) return true;
  const perms = getUserPermissions(userId, coHostPermissions);
  return perms.includes(permission);
}
