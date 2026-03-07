import crypto from 'crypto';
import { config } from '../config/config.js';

/**
 * Hash user ID using SHA-256 with salt for security
 * @param {number} userId - Telegram user ID
 * @returns {string} - SHA-256 hash of user ID
 */
export function hashUserId(userId) {
  // Use salt from environment or default (should be set in .env for production)
  const salt = process.env.HASH_SALT || 'default-salt-change-in-production';
  
  return crypto
    .createHash('sha256')
    .update(userId.toString() + salt)
    .digest('hex');
}
