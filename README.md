# Social Media Radar

Social Media Radar is a Next.js 16 + Tailwind CSS experience that visualizes two curated groups of public figures—global progressive voices and Iran liberation advocates. Each person appears as an interactive ringed portrait; selecting a face opens a modal with social handles and a ready-to-copy advocacy email template.

## Tech Stack
- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript + React 19
- **Styling:** Tailwind CSS 4 with custom gradients
- **Tooling:** pnpm, Radix-inspired UI patterns

## Local Development
```bash
pnpm install
pnpm dev        # starts Next.js on http://localhost:3000

pnpm run build  # generates the production build
pnpm start      # serves the build (run build first)
```

## Project Structure
- `app/page.tsx` — single-page experience, figure data, UI components
- `components/` — shared UI helpers
- `public/` — static assets (icons, placeholder avatars)
- `styles/` — Tailwind entry point and global styles

## Contributing
Issues and pull requests are welcome. Please describe the motivation, include screenshots for visual tweaks, and mention any new dependencies.

## #TODO Suggestions
1. **Image Hardening:** Cache every portrait under `public/` and swap hotlinked URLs for locally hosted assets to avoid CDN downtime.
2. **Data Source Automation:** Move figure metadata into JSON/YAML (or a CMS) so updates do not require editing `app/page.tsx`.
3. **Modal Content Expansion:** Add bios, recent tweets, and contact buttons sourced from reliable APIs.
4. **Filtering & Search:** Let users filter by urgency, chamber, party, or tag via client-side controls.
5. **Accessibility Review:** Audit keyboard flows, focus states, and contrast to meet WCAG 2.1 AA.
6. **Responsive Polish:** Add pinch-to-zoom-friendly layouts and performance budgets for low-end devices.
7. **Analytics & Telemetry:** Capture anonymized interactions to prioritize figures with low engagement.
8. **Testing:** Introduce Playwright or Cypress smoke tests plus unit coverage for utilities like `getRadius`.

If you tackle one of these, update this README with progress so newcomers can grab the next task.
