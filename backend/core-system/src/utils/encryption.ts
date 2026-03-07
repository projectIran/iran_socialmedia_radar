import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function deriveKey(keyString: string): Buffer {
  if (!keyString || typeof keyString !== 'string') {
    throw new Error('Encryption key is required');
  }
  return crypto.createHash('sha256').update(keyString, 'utf8').digest();
}

/**
 * Encrypt a string for storage. Returns hex: iv + authTag + ciphertext.
 * For null/empty returns ''.
 */
export function encryptValue(plainText: string | null | undefined, keyString: string): string {
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
export function decryptValue(ciphertextHex: string | null | undefined, keyString: string): string {
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
    return decipher.update(enc).toString('utf8') + decipher.final('utf8');
  } catch (e) {
    console.warn('Decrypt value error:', (e as Error)?.message);
    return '';
  }
}

/**
 * Deterministic HMAC for lookup (e.g. find by hashed id without storing plain).
 * Same (keyString, value) always gives same hex string.
 */
export function hashForLookup(keyString: string, value: string): string {
  if (!keyString || typeof keyString !== 'string') return '';
  const key = deriveKey(keyString);
  return crypto.createHmac('sha256', key).update(String(value), 'utf8').digest('hex');
}
