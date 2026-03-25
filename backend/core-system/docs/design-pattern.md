# Design Pattern & Architecture

This document describes the structure and patterns used in the **core** backend (core-system).

---

## Overview

The project uses a **layered architecture** with an explicit **Service layer** and **Repository pattern** for data access. The codebase is **TypeScript** (`src/**/*.ts`). Dependencies are wired once in `app.ts` and passed into routes and middleware (simple **Dependency Injection**).

```
HTTP Request
    → Route (validation, call service, map errors to HTTP)
    → Service (business logic, orchestration)
    → Repository (data access only)
    → Database
```

---

## Directory Structure

```
backend/core-system/
├── src/
│   ├── app.ts                 # Full app (all routes); default for local dev
│   ├── app-public.ts          # Public entry: auth, health, Swagger (ENTRY_POINT=public)
│   ├── app-private.ts         # Private entry: admin co-hosts, health (ENTRY_POINT=private)
│   ├── server.ts              # Bootstrap: schema init, admin resolution; loads app by ENTRY_POINT
│   ├── swagger.ts             # Generate OpenAPI spec from route files, then start server
│   ├── types.ts               # Shared types (UserRow, RequestWithUser, etc.)
│   ├── errors.ts              # ERROR_CATALOG, ERROR_CODES, sendError() — central API errors
│   ├── config/
│   │   └── config.ts         # Env-based configuration
│   ├── db/
│   │   ├── pool.ts            # PostgreSQL connection pool
│   │   └── schema.ts         # Table creation (users, co_hosts)
│   ├── middleware/
│   │   ├── auth.ts            # optionalAuth, requireAuth, createLoadUser(userRepo)
│   │   └── requirePermission.ts  # createRequirePermission(coHostRepo), requireAdmin
│   ├── repositories/          # Data access only (no business rules)
│   │   ├── UserRepository.ts
│   │   └── CoHostRepository.ts
│   ├── services/              # Business logic (no HTTP, no req/res)
│   │   ├── AuthService.ts     # register, login
│   │   ├── MeService.ts      # getProfile (role + permissions)
│   │   └── CoHostService.ts  # list, add, remove, get/update permissions
│   ├── routes/                # HTTP: validation, call service, return response
│   │   ├── auth.ts            # authRoutes(authService, meService, loadUser) — register, login, me
│   │   └── admin/
│   │       ├── coHosts.ts     # coHostsRoutes(coHostService, loadUser)
│   │       └── permissions.ts # permissionsRoutes(loadUser) — list permission keys
│   └── utils/
│       ├── permissions.ts    # Permission keys, isAdmin, canAccess, etc.
│       ├── passwordValidation.ts
│       └── swaggerSpecByEntry.ts
├── docs/
│   ├── design-pattern.md      # This file
│   └── api-versioning.md
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

---

## Layers

| Layer | Role | Depends on |
|-------|------|------------|
| **Routes** | Parse/validate input, call service, map result/errors to HTTP status and JSON | Services, middleware |
| **Services** | Business rules, orchestration, use-case logic | Repositories, config, utils |
| **Repositories** | CRUD and queries; no business logic | DB pool only |
| **Middleware** | Auth (JWT), load user, permission checks | Repositories (via factories), config |

- **Routes** do not call repositories directly; they call **services**.
- **Services** do not use `req`/`res`; they receive plain data and return plain data or throw with a `code`.
- **Repositories** return raw rows or simple shapes; services map them to what the app needs.

---

## Dependency Injection

All shared instances are created in **`app.ts`** (and similarly in `app-public.ts` / `app-private.ts`):

```ts
const userRepo = new UserRepository();
const coHostRepo = new CoHostRepository();
const authService = new AuthService(userRepo);
const meService = new MeService(coHostRepo);
const coHostService = new CoHostService(userRepo, coHostRepo);
const loadUser = createLoadUser(userRepo);

app.use('/v1/auth', authRoutes(authService, meService, loadUser));
app.use('/v1/admin/co-hosts', coHostsRoutes(coHostService, loadUser));
app.use('/v1/admin/permissions', permissionsRoutes(loadUser));
```

- **Repositories** are constructed once and passed into services.
- **Services** are constructed once and passed into **route factories** (`authRoutes(authService)`, etc.).
- **Middleware** that need a repository receive it via a **factory** (e.g. `createLoadUser(userRepo)`), so the same `userRepo` instance is used everywhere.

---

## Route factories

Routes are **functions** that receive their dependencies and return an Express router:

- `authRoutes(authService, meService, loadUser)` → router for `/api/v1/auth` (register, login, me)
- `coHostsRoutes(coHostService, loadUser)` → router for `/api/v1/admin/co-hosts`

This keeps routes testable (inject mocks) and avoids global or repeated `new Repository()` inside route files.

---

## Middleware factories

Some middleware need a repository. They are created via factories so `app.js` can pass the same repo instance:

- **`createLoadUser(userRepo)`**  
  Returns a middleware that loads the full user row into `req.user` (used after `requireAuth`).

- **`createRequirePermission(coHostRepo)`**  
  Returns a function `(permission) => middleware` that checks admin or co-host permission.  
  Use when you add routes that require a specific permission (e.g. `requirePermission('reports')`).  
  `requireAdmin` has no repository dependency and is used as-is.

---

## API errors (central catalog)

All API error codes and messages are defined in **`src/errors.ts`** so the frontend can rely on a stable `error.code` and the backend stays consistent.

- **`ERROR_CATALOG`** — Object mapping each code to `{ status, message }` (e.g. `AUTH_REQUIRED`, `VALIDATION_FAILED`, `COHOST_NOT_FOUND`). Add any new error here.
- **`ERROR_CODES`** — Frozen object of the same keys with string values (e.g. `ERROR_CODES.AUTH_REQUIRED === 'AUTH_REQUIRED'`). **Use `ERROR_CODES` instead of raw strings** everywhere (routes, middleware, services) to avoid typos and to get type/IDE support.
- **`sendError(res, code, overrides?)`** — Sends `res.status(status).json({ error: { code, message, details? } })`. Use this in routes and middleware; pass `ERROR_CODES.XXX` as the second argument.

**Convention:** Services throw errors with `err.code = ERROR_CODES.XXX`; routes catch and call `sendError(res, ERROR_CODES.XXX)` (or map to another code, e.g. `USER_NOT_FOUND` → `TARGET_USER_NOT_FOUND` for 404). Do not use string literals like `'AUTH_REQUIRED'` — always use `ERROR_CODES.AUTH_REQUIRED`.

---

## IDs

- **User and co-host IDs** are **UUIDs** (PostgreSQL `gen_random_uuid()`).
- **Admins** are set via env: `ADMIN_EMAILS` and/or `ADMIN_USER_IDS` (comma-separated). Legacy `ADMIN_EMAIL` and `ADMIN_USER_ID` (single) still work. At startup, each admin email is resolved to a user id and added to the admin-ids list; at request time, both id and email are checked so users who register after startup are still recognized as admin by email.
- All ID comparisons use string equality (no `parseInt`).

---

## Extending the app

1. **New endpoint in existing area**  
   Add a method to the right service, then a route that validates input, calls the service, and maps errors.

2. **New resource (new table)**  
   Add a repository (e.g. `XRepository.ts`), then a service (e.g. `XService.ts`) that uses it. In `app.ts`, create the repo and service and a route factory (e.g. `xRoutes(xService, loadUser)`), then mount it.

3. **New permission**  
   Add the key to `utils/permissions.ts` (`PERMISSIONS` and `COHOST_PERMISSIONS`). Use `createRequirePermission(coHostRepo)` for routes that need that permission.

4. **New API error**  
   Add the entry to `ERROR_CATALOG` in `src/errors.ts` and use `ERROR_CODES` (and `sendError(res, ERROR_CODES.XXX)`) in routes/middleware/services. Do not use raw string codes.

5. **New middleware that needs DB**  
   Export a factory (e.g. `createMyMiddleware(repo)`) and call it in `app.ts` with the same repo instance you use for services.

---

## Summary

| Pattern | Usage |
|--------|--------|
| **Layered architecture** | Routes → Services → Repositories → DB |
| **Repository pattern** | All DB access in `repositories/` |
| **Service layer** | Business logic in `services/`; no HTTP |
| **Dependency Injection** | Single creation in `app.ts`, pass into routes and middleware factories |
| **Central errors** | `src/errors.ts`: `ERROR_CATALOG`, `ERROR_CODES`, `sendError()` — use `ERROR_CODES` instead of raw strings |
| **Route / middleware factories** | Routes and middleware receive deps as arguments |

This keeps the API thin, logic testable, and dependencies explicit and easy to swap (e.g. for tests).

---

## API documentation (Swagger)

OpenAPI spec is **generated at startup** from the same route files (no separate YAML). [swagger-autogen](https://github.com/swagger-autogen/swagger-autogen) parses `app.ts` (or compiled `app.js` in `dist/`) and the mounted routers; **#swagger** comments in route handlers add request/response schemas and security.

- **Entry:** `npm run dev` (tsx) or `npm start` (after `npm run build`) runs the swagger script, which generates `swagger-output.json` then starts the server.
- **Swagger UI:** `GET /api-docs` (Bearer token can be set in “Authorize” for protected endpoints).
- **Generate spec only:** `npm run swagger` (or after build: `node dist/swagger.js --generate-only`).
- **Run without regenerating:** `npm run server` (uses existing `swagger-output.json`; requires `npm run build` first).

**API versioning:** All API routes live under `/v1/...`. How to add v2 and deprecate v1: [api-versioning.md](api-versioning.md).
