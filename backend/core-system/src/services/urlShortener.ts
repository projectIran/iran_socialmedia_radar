import { config } from '../config/config';

export interface UrlShortener {
  shorten(longUrl: string): Promise<string>;
}

/**
 * If no API key or provider, returns the original URL. Otherwise can be extended with Short.io, Bitly, etc.
 * For now we return the original URL so campaigns work without external service.
 */
export async function shortenUrl(longUrl: string): Promise<string> {
  if (!longUrl || typeof longUrl !== 'string') return longUrl || '';
  if (!config.urlShortenerApiKey || !config.urlShortenerProvider) return longUrl.trim();
  try {
    // Placeholder: when integrating e.g. Short.io, call their API here and return short URL.
    // On failure, return original.
    return longUrl.trim();
  } catch {
    return longUrl.trim();
  }
}
