import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;

/**
 * Derive a 32-byte key from the given string (e.g. env key).
 */
function deriveKey(keyString) {
  if (!keyString || typeof keyString !== 'string') {
    throw new Error('Encryption key is required');
  }
  return crypto.createHash('sha256').update(keyString, 'utf8').digest();
}

/**
 * Encrypt any string for storage. Returns hex string: iv + authTag + ciphertext.
 * For null/empty returns ''.
 */
export function encryptValue(plainText, keyString) {
  if (plainText == null || plainText === '') return '';
  const key = deriveKey(keyString);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const enc = Buffer.concat([cipher.update(String(plainText), 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, enc]).toString('hex');
}

/**
 * Decrypt a stored hex string. Returns plain text or '' on failure/empty.
 */
export function decryptValue(ciphertextHex, keyString) {
  if (!ciphertextHex || typeof ciphertextHex !== 'string') return '';
  try {
    const key = deriveKey(keyString);
    const buf = Buffer.from(ciphertextHex, 'hex');
    if (buf.length < IV_LENGTH + AUTH_TAG_LENGTH) return '';
    const iv = buf.subarray(0, IV_LENGTH);
    const authTag = buf.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const enc = buf.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    return decipher.update(enc) + decipher.final('utf8');
  } catch (e) {
    console.warn('Decrypt value error:', e?.message);
    return '';
  }
}

/**
 * Encrypt full name for storage. Returns hex string: iv + authTag + ciphertext.
 */
export function encryptFullName(plainText, keyString) {
  return encryptValue(plainText, keyString);
}

/**
 * Decrypt full name from stored hex string.
 */
export function decryptFullName(ciphertextHex, keyString) {
  return decryptValue(ciphertextHex, keyString);
}

/**
 * Deterministic hash for lookup (e.g. find row by telegram_user_id without storing plain).
 * Returns hex string. Same (keyString, value) always gives same result.
 */
export function hashForLookup(keyString, value) {
  if (!keyString || typeof keyString !== 'string') return '';
  const key = deriveKey(keyString);
  return crypto.createHmac('sha256', key).update(String(value), 'utf8').digest('hex');
}
