# Atrium: Blueprint Implementation TODO

Source of truth: **"Atrium Platform Blueprint" by Arjun Wadhera (Athena Education, Aug 2026)**.
Scope of pass 1: blueprint **sections 1–6** (segments, current platform, future plan, user flows,
new elements, rollout). Sections 7 (projections) and 8 (platform map) are reference only.

> For future Claude Code sessions: read this file first. Tick items (`[x]`) as they land, and add
> notes under "Decisions log" instead of re-deciding things. The "Code map" says where each module lives.

Status legend: `[ ]` todo · `[~]` partial / prototype-only · `[x]` done · `[-]` deferred (later phase)

---

## 0. Ground rules from the blueprint

- **No fabricated claims.** There were zero real users and zero mentors at launch. Any number shown
  must be real, or labelled *illustrative*, or *proposed*, and defined on `/methodology` (M10b).
- **Two segments, one platform:** India (launch; AP self-study selection) and Singapore · US
  track (course-load selection). Student-athletes are the flagship cohort *inside* SG/US, not a third market.
- **Guidance only, not a score guarantee.** Every plan screen carries that disclaimer.
- Dependency order: **M8 graph → M3**, **M2 → M3/M4**, **M6 → M9**, **M10a → M5 live with minors & M7**.

## Code map (after pass 1)

| Module | Where |
|---|---|
| Routes + role guards | `src/App.tsx`, `src/components/ProtectedRoute.tsx` (`roles` prop enforces the access matrix) |
| M1 auth / accounts | `src/auth/AuthContext.tsx` (localStorage; `updateUser`, `listUsers`, `findUserById`), `src/auth/types.ts` (roles, segments, intake types) |
| M2 questionnaire items | `src/data/questionnaire.ts` (IPIP-style Big Five ×20, RIASEC ×18, majors→RIASEC) |
| M2 scoring / profile | `src/engine/profile.ts` (OCEAN, RIASEC, Holland code, load factor, pacing note) |
| M2 UI | `src/pages/student/Questionnaire.tsx` (3 layers, saves every answer, resume) |
| M8 overlap graph | `src/data/overlapGraph.ts` (CBSE Science → 14 APs, unit-level, **illustrative v0**) |
| M3 overlap engine | `src/engine/overlap.ts` (net-new hours, bands, greedy ranker, exclusive/prereq rules) |
| M4 course-load engine | `src/engine/courseLoad.ts` (ceiling from training + commitments, keep/downgrade/stretch, season note) |
| Plan screens | `src/components/plan/{IndiaPlanView,LoadPlanView,PlanParts}.tsx` (student / parent / mentor audiences) |
| Student flow | `src/pages/student/{Onboarding,Questionnaire,Plan,Consults,Outcomes}.tsx`, `src/engine/studentState.ts` |
| M5 matching + consults | `src/engine/match.ts` (vetted mentors only), `src/pages/student/Consults.tsx` |
| M6 outcome loop | `src/pages/student/Outcomes.tsx`, mentor log in `MentorDashboard.tsx` |
| Mentor vetting | `src/pages/mentor/MentorApplication.tsx` (4 stages, prototype "mark passed" stands in for ops) |
| Dashboards | `src/pages/dashboard/{Student,Parent,Mentor}Dashboard.tsx` |
| Data layer | `src/store/db.ts` (localStorage collections: questionnaire, profiles, consults, outcomes, mentor apps, concerns) |
| M10b methodology | `src/pages/public/Methodology.tsx` |
| M10a safeguarding | `src/pages/public/Safeguarding.tsx` (policy + report-a-concern form) |
| Segment landings | `src/pages/public/{IndiaLanding,SgUsLanding}.tsx`. Sample plans come from `src/data/samples.ts` and are computed live by the engines |
| Pricing (proposal) | `src/data/pricing.ts` |
| Home page | `src/pages/Home.tsx` + `src/components/home/*` (hero, tracks, live "try it" demo, steps, motivation, subjects, parents/mentors, trust + FAQ, CTA) |
| Gamification | `src/engine/gamification.ts` (derived XP / levels / streaks / awards / heatmap), `src/components/gamify/Gamify.tsx`, `src/pages/student/Progress.tsx` (`/progress`); study logs + unit check-offs in `src/store/db.ts` |
| Theme | `index.html`: `leaf` green palette + `font-jakarta` (Plus Jakarta Sans) for marketing headings; app screens still use Fraunces + Inter |

---

## Section 2.2: Remove / change existing content

### Removed (fabricated or unverified)
- [x] Hero stats "2,400+ students mentored", "92% improved GPA", "48hr avg. match time"
- [x] Hero "Est. 2024" eyebrow and the fake "In session · Priya S. · MIT '26" card
- [x] "Trusted by students at Stuyvesant · Exeter · UWC · BASIS · Sevenoaks"
- [x] "12+ mentors available" on subject cards → "Founding mentors: recruiting"
- [x] "<9% of applicants", "Browse all 240+ mentors", fake mentor roster (`FeaturedMentors.tsx` deleted)
- [x] "© Atrium Academic Inc." → "© Atrium · Athena Education"
- [x] Sign-in / sign-up fake testimonials
- [x] Dashboard dummy sessions / mentors / ratings / "+0.4 GPA"; real data + empty states instead
- [x] Removed claims listed publicly on `/methodology`

### Stays
- [x] Brand + site shell (paper / ink / bronze, Fraunces + Inter)
- [x] Marketplace mechanic (profile → match → book)
- [x] For Students / For Mentors framing
- [x] Mentor comp concept ($28–$45/hr, 4–10 hrs/week, stipend), labelled "proposed"

### Changes
- [x] Positioning: AP-selection-first (India) + course-load (SG/US) in Hero, Mission, landings, meta title
- [x] Matching is questionnaire + plan driven (`engine/match.ts`)
- [x] Free plan first, then free 20-min consult (CTA order across the site)
- [x] Added questionnaire, overlap engine, outcome loop, safeguarding, methodology. AI layer deferred.

## Section 1: Segments & user types
- [x] `segment: 'india' | 'sgus'` on the user; chosen at sign-up and editable in onboarding
- [x] Roles `student | parent | mentor`
- [x] Athlete flag + training hours + peak-season months on SG/US students
- [x] India intake: board, stream, class, elective, target majors, colleges
- [x] SG/US intake: curriculum, grade, courses with levels, targets, athlete fields
- [x] Segment landings `/india` and `/sg-us` (`#athletes` anchor)
- [-] School / counsellor role (Phase 3, M7)
- [-] Admin / Ops console (internal). The "mark passed" buttons on mentor vetting stand in for it.

## Section 3: Modules

| ID | Module | Status | Notes |
|---|---|---|---|
| M1 | Site / auth | [x] | Multi-role, segment, parent invite code linking |
| M2 | Questionnaire | [x] | v1 items **pending expert vetting** |
| M3 | Overlap engine (India) | [x] | Rule-based; formulas on /methodology |
| M4 | Course-load engine (SG/US) | [x] | Ceiling = min(35, 42 − 0.67×committed) × load factor |
| M5 | Marketplace | [~] | Requests, accept/decline, deliver; no real scheduling, video or payments |
| M6 | Outcome loop | [~] | Student report (predicted vs actual) + mentor log; no analytics yet |
| M7 | School console | [-] | Phase 3 |
| M8 | Overlap graph | [~] | Seeded, **illustrative**; needs the manual syllabus-mapping pass |
| M9 | AI layer | [-] | Phase 3; nothing AI-generated shown to students |
| M10a | Safeguarding | [~] | Policy page, report form, guardian consent gate, vetting gate; needs real ops + backend |
| M10b | Methodology | [x] | Every number defined with source + status |

### Access matrix (enforced via `ProtectedRoute roles`)
- [x] Student: questionnaire, plan, book, report
- [x] Parent: view plan (plain-language mode), approve/pay paid consults, outcome summary
- [x] Mentor: reference student plan from a request, deliver, log result
- [ ] Mentor: annotate overlap graph (needs graph editing UI + backend)
- [-] School: cohort assign / plans / bulk book / outcomes (Phase 3)

### Hard dependencies
- [x] Plan hidden until intake + questionnaire complete (M2 gates M3/M4)
- [x] Unmapped board/stream shows "not mapped yet", never a guessed plan (M8 gates M3)
- [x] Consult requires guardian consent (or 18+) + contact-policy agreement (M10a gates M5)
- [x] Only fully vetted mentors are matched or see requests

## Section 4: User flows

### Student · India
- [x] Entry: `/india` landing with a live sample plan
- [x] Onboarding: sign-up → `/onboarding` intake
- [x] Discovery: questionnaire with progress save + "resume" banner on the dashboard
- [x] Action: ranked AP overlap plan with a rationale per AP and a unit-by-unit breakdown
- [x] Engagement: "validate this with a mentor" nudge on the plan
- [x] Conversion: free 20-min consult → paid consult (parent approval)
- [~] Retention: outcome report page + dashboard prompt after a completed consult. There's no email/notification delivery.

### Student-athlete · SG / US
- [x] Entry `/sg-us`, onboarding with training hours + peak months
- [x] Questionnaire; RIASEC drives interest fit
- [x] Load meter + keep / downgrade / stretch calls
- [x] Season-aware pacing note
- [x] Athlete-mentor flag boosts matching
- [~] Retention: "semester roadmap coming later" placeholder (subscription is Phase 3)

### Mentor
- [x] Apply via sign-up → `/mentor/application`
- [x] Vetting: application → subject screen → teaching demo → safeguarding (code of conduct, training, background check)
- [x] Requests: assigned + team-matched open requests; accept/decline; view the student's plan
- [x] Deliver + log note (feeds M6)
- [ ] Set own rate, payouts, ratings / feedback prompt

### Parent
- [x] Invited via the student's code at sign-up
- [x] Plain-language plan view
- [x] Approve / decline paid consults
- [x] Outcome summary + consent status

### School (Phase 3)
- [-] Pilot agreement → cohort questionnaire → anonymised cohort view → opt-in consults

## Section 5: New elements (success metrics still to instrument)
- [ ] Instrument metrics: questionnaire completion rate · plans → booked consult · plans per SG/US signup · graph coverage · % reporting back · incidents within SLA · methodology cited in conversions
- [ ] Expert vetting of the questionnaire item set (M2 prereq)
- [ ] Manual CBSE Science → AP mapping pass to replace illustrative values (M8 prereq)

## Section 6: Rollout

### Phase 1: make India real
- [x] Take down fabricated stats + publish methodology page
- [x] Questionnaire v1
- [~] CBSE Science → AP overlap map (illustrative) + rule-based planner
- [~] Safeguarding v1 (policy, gates, reporting UI; real ops/backend needed)
- [x] Manual first-mentor recruitment path (founding-mentor framing + vetting pipeline)
- [ ] **Milestone:** first 20–40 real plans and first paid consult (needs a real backend + payments)

### Phase 2: widen & prove
- [~] Outcome loop (M6), basic
- [x] SG/US course-load engine + athlete flagship (M4)
- [ ] Extend overlap to CBSE Commerce / Humanities; start ICSE
- [-] School pilot console (M7 v1)
- [-] Basic AI assists (M9: draft from the validated graph, match)

### Phase 3: scale
- [-] Full AI layer, state boards + A-Levels, institutional licensing, semester-roadmap subscription, research paper

---

## Pass 2 (2026-09-23)
- [x] Segment label "India · CBSE" → "India" everywhere user-facing (board options still say CBSE)
- [x] Home page redesigned as an education site (was slide-like): green palette, rounded cards, live overlap demo, FAQ
- [x] Gamification: daily study streak, XP + 8 levels, 14 awards, weekly goal from the plan, 12-week heatmap, plan-unit checklist (India), per-subject weekly bars (SG/US)
- [x] Gamification strip on the student dashboard; the child's streak/level/awards on the parent dashboard
- [x] XP rules published on /methodology
- [ ] Streak reminders / notifications (needs backend)
- [ ] Mentor-side gamification (e.g. consults delivered badges), if wanted
- [ ] Restyle app/dashboard screens to match the new home look (still the older serif style)

## Out of scope / needs a backend
- Real auth with hashed passwords (currently localStorage, plain text; prototype only)
- Payments (India INR 499–1,999; SG/US USD 25–45; 20–25% take rate). The UI shows "approve & pay" with no charge.
- Scheduling, video sessions, messaging, session monitoring
- Email / notifications for the "(I)" interventions (abandoned questionnaire reminder, new-match alert, post-exam report request)
- Admin / ops console: vetting review, concern triage, graph curation
- Cross-device data (everything lives in one browser's localStorage)

## Decisions log
- 2026-09-23: Frontend-only prototype. All new data is persisted in localStorage via `src/store/db.ts`, next to the existing auth.
- 2026-09-23: The overlap graph is a static TS module labelled illustrative (`GRAPH_VERSION`). Coverage factors: full 85%, partial 45%, none 0%.
- 2026-09-23: India ranker is greedy by net-new hours. It skips APs with signal < 0.4, allows max 4 APs, treats Calc AB/BC and Physics 1/C-Mech as exclusive pairs, and requires C-Mech before C-E&M.
- 2026-09-23: SG/US ceiling = min(35, 42 − 0.67 × (training + other commitments)) × load factor, floor 12. It never auto-cuts core/rigor subjects and respects IB ≥3 HL and A-Level ≥3.
- 2026-09-23: Landing pages show **fictional sample students** (clearly labelled) whose plans are computed live by the real engines.
- 2026-09-23: Mentor vetting stages 2–4 have a "Prototype only: mark as passed" button that stands in for the ops reviewer until the admin console exists.
- 2026-09-23: Gamification is derived, never stored. XP/awards are recomputed from real activity on every view, so they can't be faked or drift. A streak counts from today or yesterday (a streak isn't lost until a full day is missed).
- 2026-09-23: India "nearly free" plans never auto-recommend an AP in the None overlap band. It stays as "consider".
- 2026-09-23: Home previews (floating cards, the motivation panel) are labelled "Sample" / "Preview". The "try it" demo runs the real engine with a neutral profile and is labelled illustrative.
- 2026-09-23: Paid consults for under-18s wait in `awaiting_parent` until a linked parent approves. Free consults need guardian consent (or 18+) once.
