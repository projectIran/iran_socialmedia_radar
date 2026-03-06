# Frontend — Social Media Radar (Next.js)

Main radar app: two groups (global progressives and Iran liberation advocates), interactive portraits, and a modal with social links and email template.

## Run

```bash
pnpm install
pnpm dev     # http://localhost:3000
pnpm build
pnpm start
```

## Structure

- `app/` — App Router pages, `page.tsx` and `layout.tsx`
- `components/` — Shared UI and shadcn components
- `hooks/`, `lib/`, `styles/`, `public/`

## Tech stack

- Next.js 16 (App Router, Turbopack)
- TypeScript + React 19
- Tailwind CSS 4
- Radix-inspired UI components
