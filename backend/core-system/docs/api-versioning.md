# API Versioning

All main API endpoints live under **`/v1`** so that in the future you can add new versions (v2, v3, …) without breaking existing clients.

---

## Current state

- **v1:** `/v1/auth/*`, `/v1/admin/co-hosts/*`
- Unversioned (always stable): `/health`, `/api-docs`

In **Swagger UI** (GET /api-docs) use the **Servers** dropdown to choose the API version (v1 only for now; once v2 is added, the same menu will list both).

---

## How to release a new version

### 1. Version in the path — this approach

- Each version has its own prefix: `/api/v1/...`, `/api/v2/...`
- Do **not** change v1 intentionally; only bugfixes or small, backward-compatible changes.
- New features or breaking changes go in **v2** (and later v3, …).

### 2. Adding v2

1. Create a new router/folder for v2, e.g.:
   - `routes/v2/`, or
   - Copy the current routes into `routes/v2/` and change only what differs in v2.
2. Mount in `app.js`:
   - `app.use('/v2/auth', authRoutesV2(...));`
   - And similarly for admin and anything else that changes in v2.
3. Services and repositories can be shared between v1 and v2; only the route/controller layer differs.

### 3. Deprecating v1

When v2 is ready and you want to move traffic to v2 over time:

- Add headers to **v1** responses:
  - `Deprecation: true`
  - `Sunset: <date>` (e.g. one year from now)
- Document in Swagger and elsewhere that v1 is deprecated and clients should migrate to v2.
- After the Sunset date you can turn off v1 or keep it read-only.

### 4. What must not change

- **Auth behaviour** for a given version (e.g. JWT format for v1 stays the same).
- **Path and request/response body** of existing v1 endpoints; if you change them, that is a new version (v2).

---

## Summary

| Task | Recommendation |
|------|----------------|
| Current base path | All API under `/v1/...` |
| Adding a new version | `/v2/...` with new or changed routes |
| Backward compatibility | Keep v1 stable; breaking changes only in v2 |
| Deprecation | `Deprecation` and `Sunset` headers on v1 |
| Documentation | Each version in Swagger or a separate spec (e.g. paths and differences only) |

This approach matches common practice (Stripe, GitHub, etc.) and keeps behaviour predictable for clients and the frontend.
