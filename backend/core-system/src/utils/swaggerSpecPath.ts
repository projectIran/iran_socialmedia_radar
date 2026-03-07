import { existsSync } from 'fs';
import { join } from 'path';

/**
 * Resolve path to swagger-output.json so it works from dist/ and from different cwds (e.g. Railway).
 * Tries: (1) next to dist/ (parent of callerDirname), (2) process.cwd().
 */
export function resolveSwaggerSpecPath(callerDirname: string): string | null {
  const candidates = [
    join(callerDirname, '..', 'swagger-output.json'),
    join(process.cwd(), 'swagger-output.json'),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return null;
}
