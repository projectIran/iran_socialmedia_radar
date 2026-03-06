# Iran Social Media Radar

Monorepo for the Iran Social Media Radar: frontend and backend services.

## Project structure

| Folder | Description |
|--------|-------------|
| **[`frontend/`](frontend/README.md)** | Next.js 16 app — figure radar (global progressives and Iran liberation advocates), modal, and email template |
| **[`backend/`](backend/README.md)** | Backend services (each run separately): |
| → **[`backend/social-media-radar/`](backend/social-media-radar/README.md)** | Legacy: FastAPI + Vanilla JS, JSON data, LLM-based email generation API |
| → **[`backend/telegram-radar/`](backend/telegram-radar/README.md)** | Python bot that monitors X (Twitter) trends and forwards posts to Telegram |

---

## Quick start

### Frontend (Next.js)

From the **repo root**:

```bash
pnpm install
pnpm dev        # runs frontend at http://localhost:3000
pnpm build      # production build
pnpm start      # serve the build (run after build)
```

See **[frontend/README.md](frontend/README.md)** for details.

### Backend

Each backend project is independent. See **[backend/README.md](backend/README.md)** for an overview and links to:

- **social-media-radar:** [backend/social-media-radar/README.md](backend/social-media-radar/README.md) — `pip install -r requirements.txt && python server.py`
- **telegram-radar:** [backend/telegram-radar/README.md](backend/telegram-radar/README.md) — install, env setup, and run instructions

---

## Contributing

Issues and pull requests are welcome. For visual changes include screenshots; for new dependencies add a short explanation.
