export type EntryPoint = 'public' | 'private';

export interface OpenApiSpec {
  paths?: Record<string, unknown>;
  tags?: Array<{ name: string }>;
}

export function filterSpecByEntry(spec: OpenApiSpec | null, entry: EntryPoint): OpenApiSpec {
  if (!spec || !spec.paths) return spec ?? {};

  const filtered = JSON.parse(JSON.stringify(spec)) as OpenApiSpec;

  if (entry === 'public') {
    filtered.paths = Object.fromEntries(
      Object.entries(spec.paths!).filter(
        ([path]) => path.startsWith('/auth') || path === '/health'
      )
    );
    filtered.tags = (spec.tags || []).filter((t) => t.name === 'Auth' || t.name === 'Health');
  } else if (entry === 'private') {
    filtered.paths = Object.fromEntries(
      Object.entries(spec.paths!).filter(
        ([path]) => path.startsWith('/admin') || path === '/health'
      )
    );
    filtered.tags = (spec.tags || []).filter(
      (t) => t.name === 'Admin – Co-hosts' || t.name === 'Health'
    );
  }

  return filtered;
}
