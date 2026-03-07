import dotenv from 'dotenv';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const envPaths = [
  join(process.cwd(), '.env'),
  join(__dirname, '.env'),
  join(__dirname, '..', '.env'),
];

const envPath = envPaths.find((p) => existsSync(p));
if (envPath) {
  dotenv.config({ path: envPath });
}

function parseList(envKey: string, transform: (s: string) => string): string[] {
  const raw = (process.env[envKey] || '').trim();
  if (!raw) return [];
  return raw.split(',').map((s) => transform(s.trim())).filter(Boolean);
}

/** Admin emails (normalized: trim, lowercase). From ADMIN_EMAILS (comma-separated) and legacy ADMIN_EMAIL. */
const adminEmailsFromEnv = parseList('ADMIN_EMAILS', (s) => s.toLowerCase());
const legacyEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
if (legacyEmail) adminEmailsFromEnv.push(legacyEmail);
export const adminEmails: string[] = [...new Set(adminEmailsFromEnv)];

/** Admin user IDs (UUIDs). From ADMIN_USER_IDS (comma-separated) and legacy ADMIN_USER_ID. Resolved IDs from emails are pushed at startup. */
const adminIdsFromEnv = parseList('ADMIN_USER_IDS', (s) => s);
const legacyId = (process.env.ADMIN_USER_ID || '').trim();
if (legacyId) adminIdsFromEnv.push(legacyId);
export const adminIds: string[] = [...new Set(adminIdsFromEnv)];

const baseUrl = (process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`).replace(/\/$/, '');

export interface Config {
  port: number;
  baseUrl: string;
  databaseUrl: string | undefined;
  /** Admin emails (normalized). Used to resolve IDs at startup and for isAdminByEmailOrId at request time. */
  adminEmails: readonly string[];
  /** Admin user IDs. Env values + IDs resolved from adminEmails at startup. */
  adminIds: string[];
  jwtSecret: string;
  jwtExpiresIn: string;
  cohostEncryptionKey: string | null;
  /** Optional: URL shortener (e.g. Short.io, Bitly). If not set, long URL is returned as-is. */
  urlShortenerApiKey: string | null;
  urlShortenerProvider: string | null;
  /** Optional: AI for email personalization (e.g. OpenAI, Groq). If not set, generate-email may fail or return base. */
  aiApiKey: string | null;
  aiProvider: string | null;
}

export const config: Config = {
  port: parseInt(process.env.PORT ?? '', 10) || 3000,
  baseUrl,
  databaseUrl: process.env.DATABASE_URL,
  adminEmails,
  adminIds,
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cohostEncryptionKey: process.env.COHOST_ENCRYPTION_KEY || null,
  urlShortenerApiKey: process.env.URL_SHORTENER_API_KEY || null,
  urlShortenerProvider: process.env.URL_SHORTENER_PROVIDER || null,
  aiApiKey: process.env.AI_API_KEY || null,
  aiProvider: process.env.AI_PROVIDER || null,
};

if (!config.databaseUrl) {
  throw new Error('DATABASE_URL is required in .env');
}

export default config;
