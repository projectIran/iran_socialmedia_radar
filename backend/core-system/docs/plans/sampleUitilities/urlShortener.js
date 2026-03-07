import fetch from 'node-fetch';
import { Shortio } from '@short.io/client-node';
import { config } from '../config/config.js';

/**
 * Shorten a long URL using configured provider (Short.io, Bitly, or TinyURL).
 * If no token is configured or the request fails, returns the original URL.
 * @param {string} longUrl - Full URL (e.g. mailto:... or https://...)
 * @returns {Promise<string>} Shortened URL or original URL on failure
 */
export async function shortenUrl(longUrl) {
  if (!longUrl || typeof longUrl !== 'string') return longUrl || '';

  const provider = (config.urlShortenerProvider || 'shortio').toLowerCase();

  if (provider === 'shortio' && config.shortIoApiKey && config.shortIoDomain) {
    try {
      const shortio = new Shortio(config.shortIoApiKey);
      const link = await shortio.link.create(config.shortIoDomain, longUrl);
      const shortURL = link?.shortURL ?? link?.shortUrl;
      if (shortURL) return shortURL;
      if (link?.error) console.warn('Short.io API error:', link.error);
    } catch (e) {
      console.warn('Short.io shorten error:', e?.message);
    }
    return longUrl;
  }

  if (provider === 'bitly' && config.bitlyAccessToken) {
    try {
      const res = await fetch('https://api-ssl.bitly.com/v4/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.bitlyAccessToken}`,
        },
        body: JSON.stringify({ long_url: longUrl }),
      });
      if (!res.ok) {
        const errText = await res.text();
        console.warn('Bitly shorten failed:', res.status, errText);
        return longUrl;
      }
      const data = await res.json();
      if (data.link) return data.link;
    } catch (e) {
      console.warn('Bitly shorten error:', e?.message);
      return longUrl;
    }
  }

  // TinyURL: public API (no key required) - GET api-create.php
  if (provider === 'tinyurl') {
    try {
      const encoded = encodeURIComponent(longUrl);
      const res = await fetch(`https://tinyurl.com/api-create.php?url=${encoded}`, {
        method: 'GET',
      });
      if (!res.ok) return longUrl;
      const text = await res.text();
      const shortUrl = (text || '').trim();
      if (shortUrl && (shortUrl.startsWith('http://') || shortUrl.startsWith('https://'))) {
        return shortUrl;
      }
    } catch (e) {
      console.warn('TinyURL shorten error:', e?.message);
    }
    return longUrl;
  }

  return longUrl;
}
