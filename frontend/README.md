# Frontend — Social Media Radar (Next.js)

Main radar app: two groups (global progressives and Iran liberation advocates), interactive portraits, and a modal with social links and email template.

## Run

```bash
pnpm install
pnpm dev     # http://localhost:3000
pnpm build
pnpm start
```

<<<<<<< HEAD
You can also run this app from the repo root with `pnpm dev`.
=======
## Environment variables

| Variable | Required | Default | Description |
|---------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | No | `http://localhost:3001` | Public API base URL. Used for `/api/v1/*` rewrites (auth, email campaigns, petitions). |
| `NEXT_PUBLIC_ADMIN_API_URL` | No | `http://localhost:3002` | Admin API base URL. Used for `/api/v1/admin/*` rewrites (co-hosts, admin email campaigns, admin petitions). |
| `NEXT_PUBLIC_EMAIL_THRESHOLD` | No | `100` | Number of emails after which a person is deprioritized in the list. |
| `JAVID_API_URL` | No | `https://api.javidfighter.com` | Javid Fighter API base URL for external campaigns & petitions. |
| `JAVID_API_KEY` | Yes (for Javid) | — | API key for Javid Fighter. Kept server-side via proxy routes. |

Copy `.env.example` to `.env.local` and fill in the values:


>>>>>>> 31f8e5e2f388371d3413bb88dabc1cc541e14390

## Structure

- `app/` — App Router pages, `page.tsx` and `layout.tsx`
- `components/` — Shared UI and shadcn components
- `hooks/`, `lib/`, `styles/`, `public/`
<<<<<<< HEAD
=======

## Tech stack

- Next.js 16 (App Router, Turbopack)
- TypeScript + React 19
- Tailwind CSS 4
- Radix-inspired UI components
>>>>>>> 31f8e5e2f388371d3413bb88dabc1cc541e14390
