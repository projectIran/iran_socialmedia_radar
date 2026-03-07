export type EntryPoint = 'public' | 'private';

export interface OpenApiSpec {
  paths?: Record<string, unknown>;
  tags?: Array<{ name: string }>;
  servers?: Array<{ url: string; description?: string }>;
}

/**
 * Filters OpenAPI spec by entry point.
 * - public: auth, health, email-campaigns, petitions (no admin/co-hosts in doc).
 * - private: admin (co-hosts, permissions), health, email-campaigns, petitions.
 * When running full app (no filter), the raw spec is used and all endpoints (including co-hosts) are shown.
 */
export function filterSpecByEntry(spec: OpenApiSpec | null, entry: EntryPoint): OpenApiSpec {
  if (!spec || !spec.paths) return spec ?? {};

  const filtered = JSON.parse(JSON.stringify(spec)) as OpenApiSpec;

  if (entry === 'public') {
    filtered.paths = Object.fromEntries(
      Object.entries(spec.paths!).filter(
        ([path]) =>
          path.startsWith('/auth') ||
          path === '/health' ||
          path.startsWith('/email-campaigns') ||
          path.startsWith('/petitions')
      )
    );
    filtered.tags = (spec.tags || []).filter(
      (t) =>
        t.name === 'Auth' ||
        t.name === 'Health' ||
        t.name === 'Email Campaigns' ||
        t.name === 'Petitions'
    );
  } else if (entry === 'private') {
    filtered.paths = Object.fromEntries(
      Object.entries(spec.paths!).filter(
        ([path]) => path.startsWith('/admin') || path === '/health'
      )
    );
    filtered.tags = (spec.tags || []).filter(
      (t) =>
        t.name === 'Admin – Co-hosts' ||
        t.name === 'Health' ||
        t.name === 'Admin – Email campaigns' ||
        t.name === 'Admin – Petitions'
    );
  }

  return filtered;
}
