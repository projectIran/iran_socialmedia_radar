const MIN_LENGTH = 8;
const MAX_LENGTH = 128;

export interface PasswordValidationResult {
  valid: boolean;
  message?: string;
}

export function validatePasswordStrength(password: unknown): PasswordValidationResult {
  if (typeof password !== 'string') {
    return { valid: false, message: 'Password is required' };
  }
  const p = password;
  if (p.length < MIN_LENGTH) {
    return { valid: false, message: `Password must be at least ${MIN_LENGTH} characters` };
  }
  if (p.length > MAX_LENGTH) {
    return { valid: false, message: `Password must be at most ${MAX_LENGTH} characters` };
  }
  if (!/[a-z]/.test(p)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[A-Z]/.test(p)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/\d/.test(p)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  if (!/[^A-Za-z0-9]/.test(p)) {
    return { valid: false, message: 'Password must contain at least one special character' };
  }
  return { valid: true };
}

export const PASSWORD_RULES = {
  minLength: MIN_LENGTH,
  maxLength: MAX_LENGTH,
  description: 'At least one lowercase, one uppercase, one number, one special character',
} as const;
