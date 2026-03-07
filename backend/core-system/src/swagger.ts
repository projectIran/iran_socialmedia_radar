import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import dotenv from 'dotenv';
import swaggerAutogen from 'swagger-autogen';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRoot = join(__dirname, '..', '..');
dotenv.config({ path: join(projectRoot, '.env') });

const autogen = swaggerAutogen({ openapi: '3.0.0' });

const outputFile = join(__dirname, '..', 'swagger-output.json');
const isTs = __filename.endsWith('.ts');
const routes = [join(__dirname, `app.${isTs ? 'ts' : 'js'}`)];

const V1_PREFIX = '/v1';
const baseUrl = (process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`).replace(/\/$/, '');
const servers = [
  { url: `${baseUrl}${V1_PREFIX}`, description: 'v1' },
];

const doc = {
  info: {
    title: 'Core API',
    description: 'User, co-host, and permission management.',
    version: '1.0.0',
  },
  servers,
  tags: [
    { name: 'Auth', description: 'Register, login, and current user' },
    { name: 'Admin – Co-hosts', description: 'Manage co-hosts (admin only)' },
    { name: 'Health', description: 'Liveness' },
    { name: 'Email Campaigns', description: 'List, view, generate email, participate (public)' },
    { name: 'Admin – Email campaigns', description: 'CRUD email campaigns (admin)' },
    { name: 'Petitions', description: 'List, view, participate (public)' },
    { name: 'Admin – Petitions', description: 'CRUD petitions (admin)' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string' },
          name: { type: 'string', nullable: true },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/User' },
          token: { type: 'string' },
        },
      },
      MeProfile: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/User' },
          role: { type: 'string', enum: ['admin', 'cohost', 'user'] },
          permissions: { type: 'array', items: { type: 'string' } },
        },
      },
      CoHostItem: {
        type: 'object',
        properties: {
          user_id: { type: 'string', format: 'uuid' },
          user_email: { type: 'string' },
          user_name: { type: 'string', nullable: true },
          display_name: { type: 'string', nullable: true },
          added_by: { type: 'string', format: 'uuid', nullable: true },
          permissions: { type: 'array', items: { type: 'string' } },
          created_at: { type: 'string' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
              details: {},
            },
          },
        },
      },
    },
  },
  security: [],
};

function applyVersioningToSpec(spec: { paths?: Record<string, unknown>; servers?: unknown[] }): void {
  if (!spec.paths) return;
  const newPaths: Record<string, unknown> = {};
  for (const [path, methods] of Object.entries(spec.paths)) {
    if (path === '/') continue;
    const normalized = path.startsWith(V1_PREFIX) ? path.slice(V1_PREFIX.length) || '/' : path;
    newPaths[normalized] = methods;
  }
  spec.paths = newPaths;
  spec.servers = servers;
}

const generateOnly = process.argv.includes('--generate-only') || process.env.SWAGGER_ONLY === '1';

autogen(outputFile, routes, doc).then(() => {
  const spec = JSON.parse(readFileSync(outputFile, 'utf8'));
  applyVersioningToSpec(spec);
  writeFileSync(outputFile, JSON.stringify(spec, null, 2));
  if (generateOnly) {
    console.log('Swagger spec written to', outputFile);
    process.exit(0);
  } else {
    import('./server');
  }
}).catch((err: Error) => {
  console.error('Swagger generation failed:', err);
  process.exit(1);
});
