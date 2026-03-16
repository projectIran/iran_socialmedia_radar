# Contributing

This document summarizes how to contribute to the Iran Social Media Radar project: working on a feature or bug, branching, and checks before opening a PR.

---

## Before you start

- **Project structure:** [README.md](README.md) — Monorepo with `frontend/` and `backend/` (core-system, telegram-radar, etc.).
- **Core API architecture:** [backend/core-system/docs/design-pattern.md](backend/core-system/docs/design-pattern.md) — Layers, services, errors, and development patterns.
- **API versioning:** [backend/core-system/docs/api-versioning.md](backend/core-system/docs/api-versioning.md) — `/v1` routes, adding v2, and deprecation.

---

## Working on a feature or bug

1. **Issue (if applicable)**  
   If you are working on an issue, reference its number or title in your branch name and in the PR description.

2. **Branch**  
   Create a new branch from **`develop`**:
   - For a feature: e.g. `feature/short-name` or `feat/cohost-export`
   - For a bug: e.g. `fix/login-redirect` or `bugfix/validation-message`

3. **Changes**  
   Keep commits focused on that feature or bug. For the Core backend, follow the patterns in [design-pattern.md](backend/core-system/docs/design-pattern.md) (layers, errors with `ERROR_CODES`, etc.).

4. **Before opening a PR**  
   - **Build:** In the relevant directory (e.g. `backend/core-system`), run `npm run build` (or equivalent) and ensure it succeeds.
   - **Lint / Test:** If the package has `lint` or `test` scripts, run them and fix any errors or failures.
   - **Docs:** If API behaviour or env has changed, update the README or docs (e.g. design-pattern, api-versioning).

5. **Pull request**  
   Write a clear description: what changed, why, and how it was tested if relevant. If it relates to an issue, include the issue link or number.

---

## Pre-PR checklist

- [ ] Branch is created from **`develop`**.
- [ ] Build completes without errors (`npm run build` in core-system if you changed the backend).
- [ ] Lint and test (if present) run without errors or failures.
- [ ] Docs and conventions (design-pattern, errors with `ERROR_CODES`) are followed and updated where needed.

Thanks for contributing.
