# Iran Social Media Radar

Monorepo for the Iran Social Media Radar: frontend and backend services.

## Project structure

| Folder | Description |
|--------|-------------|
| **[`frontend/`](frontend/README.md)** | Next.js 16 app — figure radar (global progressives and Iran liberation advocates), modal, and email template |
| **[`backend/`](backend/README.md)** | Backend services (each run separately): |
| → **[`backend/telegram-radar/`](backend/telegram-radar/README.md)** | Python bot that monitors X (Twitter) trends and forwards posts to Telegram |

---

## Quick start

### Frontend (Next.js)

From the **frontend** folder:

```bash
cd frontend
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # production build
pnpm start      # serve the build (run after build)
```

See **[frontend/README.md](frontend/README.md)** for details.

### Backend

Each backend project is independent. See **[backend/README.md](backend/README.md)** for an overview and links to:

- **telegram-radar:** [backend/telegram-radar/README.md](backend/telegram-radar/README.md) — install, env setup, and run instructions

---

## TODO suggestions

1. **Image hardening** — Cache every portrait under `public/` and swap hotlinked URLs for locally hosted assets to avoid CDN downtime.
2. **Data source automation** — Move figure metadata into JSON/YAML (or a CMS) so updates do not require editing `app/page.tsx`.
3. **Modal content expansion** — Add bios, recent tweets, and contact buttons sourced from reliable APIs.
4. **Filtering & search** — Let users filter by urgency, chamber, party, or tag via client-side controls.
5. **Accessibility review** — Audit keyboard flows, focus states, and contrast to meet WCAG 2.1 AA.
6. **Responsive polish** — Add pinch-to-zoom-friendly layouts and performance budgets for low-end devices.
7. **Analytics & telemetry** — Capture anonymized interactions to prioritize figures with low engagement.
8. **Testing** — Introduce Playwright or Cypress smoke tests plus unit coverage for utilities like `getRadius`.

If you tackle one of these, update this README with progress so newcomers can grab the next task.

---

## Contributing

Issues and pull requests are welcome. For visual changes include screenshots; for new dependencies add a short explanation.
