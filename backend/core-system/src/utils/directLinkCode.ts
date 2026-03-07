/**
 * Generate a short URL-safe code for direct links (e.g. /campaign/ABC12xyz).
 * Alphanumeric only; 10–12 chars. Caller should retry on unique violation.
 */
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const LENGTH = 11;

export function generateDirectLinkCode(): string {
  let result = '';
  for (let i = 0; i < LENGTH; i++) {
    result += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return result;
}

/**
 * Build mailto URL with to and optional bcc only (no subject/body to avoid spam patterns and length limits).
 * Example: mailto:senator@example.com?bcc=cc1@x.com,cc2@x.com
 */
export function buildMailto(to: string, bcc?: string | null): string {
  const trimmedTo = (to || '').trim();
  if (!trimmedTo) return 'mailto:';
  let mailto = 'mailto:' + encodeURIComponent(trimmedTo);
  if (bcc && (bcc as string).trim()) {
    const bccList = (bcc as string)
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean);
    if (bccList.length) mailto += '?bcc=' + encodeURIComponent(bccList.join(','));
  }
  return mailto;
}
