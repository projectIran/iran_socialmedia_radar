# Core Backend (User + Co-Host API)

Core backend: Node.js REST API for **user / access / co-host** (هستهٔ اصلی بکند). Users register with **email + password**; you can add Google OAuth later.

## Concepts

- **Admins**: One or more accounts set by `ADMIN_EMAILS` and/or `ADMIN_USER_IDS` (comma-separated in .env). Legacy single `ADMIN_EMAIL` and `ADMIN_USER_ID` still work. Admins have all permissions and can manage co-hosts.
- **Co-host**: User in `co_hosts` with a **subset of permissions**. New co-hosts get **no permissions**; admin grants them via API.
- **User**: Regular account; no admin/co-host rights unless added as co-host.

## Setup

```bash
cd backend/core-system
cp .env.example .env
# Edit .env: DATABASE_URL, JWT_SECRET, ADMIN_EMAILS and/or ADMIN_USER_IDS (see Environment table)
npm install
npm run build
npm run dev
```

Schema (users + co_hosts) is created on first run. The project is written in **TypeScript**; source is in `src/**/*.ts`, compiled to `dist/` with `npm run build`.

## Swagger (API docs)

The OpenAPI spec is **generated at startup** from the route files (no hand-written YAML). Swagger UI is served at:

- **GET /api-docs** — Interactive API documentation. Use the **Servers** dropdown to choose API version (v1; v2 when added). Add Bearer token in “Authorize” for protected endpoints.

Scripts:

- `npm run build` — Build with **tsup** (TypeScript → `dist/`). Use once before `npm start` or `npm run server`. Imports in source are extensionless (e.g. `from './pool'` not `./pool.js`).
- `npm run typecheck` — Type-check only (`tsc --noEmit`).
- `npm run dev` — Run with tsx (no build step); generates spec and starts server. Swagger UI at http://localhost:3000/api-docs.
- `npm start` — Run compiled app: generate spec then start server (requires `npm run build` first).
- `npm run swagger` — Generate `swagger-output.json` only. Use `tsx src/swagger.ts --generate-only` or, after build, `node dist/swagger.js --generate-only`.
- `npm run server` — Start server without regenerating the spec (uses existing `swagger-output.json`; requires `npm run build` first).
- `npm run server:public` — Run **public** entry only (auth, health, Swagger). For api.iranradar.org.
- `npm run server:private` — Run **private** entry only (admin, co-hosts, health). Same repo; use same `JWT_SECRET` so tokens work on both.

## Two entry points (public / private)

You can run one process with all routes (`ENTRY_POINT=full`, default) or two processes (e.g. two Railway containers):

| Entry   | Routes                          | Use case                    |
|---------|----------------------------------|-----------------------------|
| **public**  | `/v1/auth/*`, `/health`, `/api-docs` | Website, mobile; api.iranradar.org |
| **private** | `/v1/admin/co-hosts`, `/health`, `/api-docs` | Admin/co-host panel; separate URL or internal |

In both public and private entries, **GET /api-docs** (Swagger UI) shows only the endpoints for that entry (e.g. public = auth + health; private = admin co-hosts + health).

- Same codebase, same DB and schema; no duplication. Set `ENTRY_POINT=public` or `ENTRY_POINT=private` in each container.
- JWT issued on the public entry is valid on the private entry as long as both use the same `JWT_SECRET`.

## Environment

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret for signing JWTs (e.g. 32+ chars) |
| `ADMIN_EMAILS` | Or ADMIN_USER_IDS | Comma-separated admin emails and/or user UUIDs. Legacy: `ADMIN_EMAIL` and `ADMIN_USER_ID` (single) still work. |
| `PORT` | No | Default 3000 |
| `ENTRY_POINT` | No | `full` (default) \| `public` \| `private`. Use `public`/`private` for two-container deploy (see below). |
| `BASE_URL` | No | Public API base URL (e.g. `https://api.yourdomain.com`). Used in Swagger and links. Default: `http://localhost:PORT` |
| `JWT_EXPIRES_IN` | No | Default `7d` |

## API error format

All error responses use the same shape so the frontend can handle them by code:

```json
{ "error": { "code": "EMAIL_EXISTS", "message": "Email already registered", "details": null } }
```

- **code**: Unique string (e.g. `VALIDATION_FAILED`, `INVALID_CREDENTIALS`). Use this for i18n or conditional UI.
- **message**: Human-readable text (can be overridden per request).
- **details**: Optional (e.g. validation errors array). Omitted when not used.

Codes and messages are defined in `src/errors.js` (ERROR_CATALOG). Use `ERROR_CODES.CODE` (e.g. `ERROR_CODES.AUTH_REQUIRED`) instead of raw strings to avoid typos; add new codes to ERROR_CATALOG and use `sendError(res, ERROR_CODES.CODE)` in routes.

## API Endpoints

همهٔ endpointهای زیر تحت **`/v1`** هستند (برای آینده‌نگری نسخه‌گذاری). راهنمای نسخه‌گذاری: [docs/api-versioning.md](docs/api-versioning.md).

### Auth (no token)

- **POST /v1/auth/register**
  Body: `{ "email", "password", "name?" }`  
  Password rules: min 8 characters, at least one uppercase, one lowercase, one number, one special character.  
  Returns: `{ user: { id, email, name }, token }`

- **POST /v1/auth/login**
  Body: `{ "email", "password" }`  
  Returns: `{ user: { id, email, name }, token }`

### Auth – current user (Bearer token required)

- **GET /v1/auth/me**
  Returns: `{ user: { id, email, name }, role: "admin"|"cohost"|"user", permissions: string[] }`  
  Use this so the frontend can show/hide UI by role and permissions.

### Admin (Bearer token, **admin only**)

- **GET /v1/admin/permissions**  
  List available permission keys (for UI when assigning permissions to co-hosts). Returns `{ permissions: string[] }`.

- **GET /v1/admin/co-hosts**  
  List all co-hosts (with user email, display_name, permissions).

- **POST /v1/admin/co-hosts**
  Body: `{ "user_id"? or "email"? (one required), "display_name"? }`  
  Add or update co-host. New co-host gets **no permissions**; use PUT permissions next.

- **DELETE /v1/admin/co-hosts/:userId**
  Remove co-host.

- **GET /v1/admin/co-hosts/:userId/permissions**
  Get co-host permissions.

- **PUT /v1/admin/co-hosts/:userId/permissions**
  Body: `{ "permissions": ["reports", "media_support", ...] }`  
  All values must be from the same permission set (see `src/utils/permissions.js`).

## Permission Keys

Defined in `src/utils/permissions.js`:

- `media_support`, `email_campaign`, `feedback`, `stats`

Use `PERMISSIONS.*` in code; validate in API with `COHOST_PERMISSIONS`.

## Protecting Your Own Routes

- Use `requireAuth` then `loadUser` so `req.user` is the full user row.
- Use `createRequirePermission(coHostRepo)('permission_key')` so only admin or co-hosts with that permission can access (see [Design pattern](docs/design-pattern.md)).
- Use `requireAdmin` for co-host management (already applied on `/api/admin/co-hosts`).

## Adding Google OAuth Later

- Add columns to `users`: e.g. `google_id`, `avatar_url`.
- Add route e.g. `POST /api/auth/google` that accepts an ID token, finds or creates user by `google_id`/email, returns JWT.
- Keep `password_hash` nullable so email-only and Google-only users both work.

## Project Structure & Design Pattern

For a detailed description of the architecture (layers, services, repositories, dependency injection, and how to extend the app), see:

- **[docs/design-pattern.md](docs/design-pattern.md)** — Design pattern & technical structure

Summary: **Routes** → **Services** (business logic) → **Repositories** (data access) → DB. Dependencies are wired once in `app.js`.
