# Atrium

Vite + React 19 + TypeScript + react-router 7. Tailwind via CDN, with theme tokens in `index.html`.
Frontend-only prototype: auth and all data live in localStorage (`src/auth/AuthContext.tsx`).
The one server piece is the AI layer: `server/` is mounted into the Vite dev/preview server by `server/aiPlugin.ts`
and reads `ANTHROPIC_API_KEY` from `.env.local` (copy `.env.example`). Never call the Anthropic API from `src/`.

## Product roadmap
The product direction comes from the Atrium Platform Blueprint (Arjun Wadhera, Aug 2026).
**Read [docs/BLUEPRINT_TODO.md](docs/BLUEPRINT_TODO.md) before feature work.** It maps each blueprint
section to concrete tasks and records decisions already made. Update its checkboxes and decisions log as work lands.

Layout: `src/data` (static data: questionnaire items, overlap graph, samples), `src/engine` (pure plan logic),
`src/store/db.ts` (localStorage collections), `src/pages/{public,student,mentor,dashboard}`, `src/components/{plan,home,gamify}`.
All pages use the dark theme: `leaf` green accent, `font-jakarta` headings, rounded cards and pill buttons. Use `bg-canvas` for cards (never `bg-white`) and `text-white` only on filled `bg-*-500/600`. Don't reintroduce Fraunces or bronze. First-run routing lives in `engine/flow.ts#nextPathFor`. XP and awards are always derived from real activity (`engine/gamification.ts`) and never stored.

Key rule: never show fabricated stats, rosters, testimonials, or endorsements. Mark numbers as real or illustrative, and define them on the Methodology page.
Wording rules: AP is an add-on, never a curriculum on par with CBSE / IB / A-Level. Keep US and UK guidance separate (`src/data/countries.ts`). Never say a university "requires" an AP; use relevance / rigor / alignment wording. AI output is always labelled AI-generated and grounded in the engine's candidates.

## Commands
- `npm run dev`: start the dev server
- `npm run build`: type-check and build
- `npm run lint`: run ESLint
