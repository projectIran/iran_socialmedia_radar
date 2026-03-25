import crypto from 'crypto';

/**
 * Hash a value with salt for security (e.g. user id or session id).
 * Use HASH_SALT in .env for production.
 */
export function hashWithSalt(value: string | number, salt?: string): string {
  const s = salt ?? process.env.HASH_SALT ?? 'default-salt-change-in-production';
  return crypto
    .createHash('sha256')
    .update(String(value) + s)
    .digest('hex');
}

/** Alias for hashing user IDs (Telegram or numeric). */
export function hashUserId(userId: string | number): string {
  return hashWithSalt(userId);
}
