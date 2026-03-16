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

export interface BuildMailtoFullOpts {
  to: string;
  bcc?: string | null;
  subject?: string | null;
  body?: string | null;
}

/**
 * Build full mailto URL with to, optional bcc, subject, and body.
 * Use for clients that open the mailer with pre-filled subject/body.
 */
export function buildMailtoFull(opts: BuildMailtoFullOpts): string {
  const { to, bcc, subject, body } = opts;
  if (!to || !String(to).trim()) return 'mailto:';
  const base = 'mailto:' + encodeURIComponent(String(to).trim());
  const params = new URLSearchParams();
  if (bcc && String(bcc).trim()) params.set('bcc', String(bcc).trim());
  if (subject != null && String(subject).trim()) params.set('subject', String(subject).trim());
  if (body != null && String(body).trim()) params.set('body', String(body).trim());
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}
