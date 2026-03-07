/**
 * Build a mailto: URL with to, optional bcc, subject, and body.
 * @param {{ to: string, bcc?: string, subject?: string, body?: string }} opts
 * @returns {string}
 */
export function buildMailtoUrl(opts) {
  const { to, bcc, subject, body } = opts;
  if (!to || !to.trim()) return '';
  const base = `mailto:${encodeURIComponent(to.trim())}`;
  const params = new URLSearchParams();
  if (bcc && bcc.trim()) params.set('bcc', bcc.trim());
  if (subject != null && String(subject).trim()) params.set('subject', String(subject).trim());
  if (body != null && String(body).trim()) params.set('body', String(body).trim());
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}
