import { config } from '../config/config';

/**
 * Shorten a long URL using configured provider (shortio, bitly, tinyurl).
 * If no token/domain (for Short.io) or request fails, returns the original URL.
 */
export async function shortenUrl(longUrl: string): Promise<string> {
  if (!longUrl || typeof longUrl !== 'string') return longUrl || '';
  const trimmed = longUrl.trim();
  const provider = (config.urlShortenerProvider || '').toLowerCase();
  const apiKey = config.urlShortenerApiKey;
  const domain = config.urlShortenerDomain;

  if (provider === 'shortio' && apiKey && domain) {
    try {
      const res = await fetch('https://api.short.io/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: apiKey,
        },
        body: JSON.stringify({
          domain: domain.trim(),
          originalURL: trimmed,
        }),
      });
      if (!res.ok) {
        const errText = await res.text();
        console.warn('Short.io shorten failed:', res.status, errText);
        return trimmed;
      }
      const data = (await res.json()) as { shortURL?: string; shortUrl?: string };
      const shortURL = data.shortURL ?? data.shortUrl;
      if (shortURL) return shortURL;
    } catch (e) {
      console.warn('Short.io shorten error:', (e as Error)?.message);
    }
    return trimmed;
  }

  if (provider === 'bitly' && apiKey) {
    try {
      const res = await fetch('https://api-ssl.bitly.com/v4/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ long_url: trimmed }),
      });
      if (!res.ok) {
        const errText = await res.text();
        console.warn('Bitly shorten failed:', res.status, errText);
        return trimmed;
      }
      const data = (await res.json()) as { link?: string };
      if (data.link) return data.link;
    } catch (e) {
      console.warn('Bitly shorten error:', (e as Error)?.message);
    }
    return trimmed;
  }

  if (provider === 'tinyurl') {
    try {
      const encoded = encodeURIComponent(trimmed);
      const res = await fetch(`https://tinyurl.com/api-create.php?url=${encoded}`, { method: 'GET' });
      if (!res.ok) return trimmed;
      const text = await res.text();
      const shortUrl = (text || '').trim();
      if (shortUrl && (shortUrl.startsWith('http://') || shortUrl.startsWith('https://'))) return shortUrl;
    } catch (e) {
      console.warn('TinyURL shorten error:', (e as Error)?.message);
    }
    return trimmed;
  }

  return trimmed;
}
