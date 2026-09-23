# Atrium

Vite + React 19 + TypeScript + react-router 7. Tailwind via CDN, with theme tokens in `index.html`.
Frontend-only prototype: auth and all data live in localStorage (`src/auth/AuthContext.tsx`).

## Product roadmap
The product direction comes from the Atrium Platform Blueprint (Arjun Wadhera, Aug 2026).
**Read [docs/BLUEPRINT_TODO.md](docs/BLUEPRINT_TODO.md) before feature work.** It maps each blueprint
section to concrete tasks and records decisions already made. Update its checkboxes and decisions log as work lands.

Layout: `src/data` (static data: questionnaire items, overlap graph, samples), `src/engine` (pure plan logic),
`src/store/db.ts` (localStorage collections), `src/pages/{public,student,mentor,dashboard}`, `src/components/{plan,home,gamify}`.
Marketing pages use the `leaf` palette and `font-jakarta`. XP and awards are always derived from real activity (`engine/gamification.ts`) and never stored.

Key rule: never show fabricated stats, rosters, testimonials, or endorsements. Mark numbers as real or illustrative, and define them on the Methodology page.

## Commands
- `npm run dev`: start the dev server
- `npm run build`: type-check and build
- `npm run lint`: run ESLint
