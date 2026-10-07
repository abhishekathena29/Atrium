import { Link } from 'react-router-dom';
import { DIFFICULTY_LABEL, apInfo, type Difficulty } from '../../data/apInfo';

const ENTRY = [
  {
    to: '/signup?role=student&segment=india',
    icon: 'menu_book',
    title: 'India',
    sub: 'Your boards, plus APs on top',
    tone: { ring: 'border-leaf-200 hover:border-leaf-500', icon: 'bg-leaf-100 text-leaf-700', arrow: 'text-leaf-600' },
  },
  {
    to: '/signup?role=student&segment=sgus',
    icon: 'public',
    title: 'Singapore · US',
    sub: 'IB, A-Levels or a US high school, plus any APs on top',
    tone: { ring: 'border-sky-200 hover:border-sky-500', icon: 'bg-sky-100 text-sky-700', arrow: 'text-sky-600' },
  },
];

/**
 * Illustrative picks for the hero preview. Labelled "Sample" on screen; not real student data.
 * Difficulty chips use the app's own editorial ratings (data/apInfo.ts), so the preview never
 * contradicts a real plan: one demanding AP balanced by a moderate and a manageable one.
 */
const DIFFICULTY_STYLE: Record<Difficulty, string> = {
  1: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  2: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  3: 'bg-amber-50 text-amber-800 border-amber-200',
  4: 'bg-rose-50 text-rose-800 border-rose-200',
  5: 'bg-rose-50 text-rose-800 border-rose-200',
};

const SAMPLE_PICKS = [
  { id: 'calc-ab', why: 'Builds on board maths' },
  { id: 'physics-1', why: 'Fits engineering' },
  { id: 'csa', why: 'New, high relevance' },
].flatMap(({ id, why }) => {
  const info = apInfo(id);
  return info ? [{ name: info.name, why, chip: DIFFICULTY_LABEL[info.difficulty], style: DIFFICULTY_STYLE[info.difficulty] }] : [];
});

const fill = { fontVariationSettings: "'FILL' 1" } as const;

export function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-leaf-50 via-paper to-paper">
      <div className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-leaf-100/70 blur-3xl pointer-events-none" aria-hidden />
      <div className="absolute top-40 -left-32 w-[360px] h-[360px] rounded-full bg-violet-100/60 blur-3xl pointer-events-none" aria-hidden />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-10 pt-14 pb-16 lg:pt-20 lg:pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Copy + entry points */}
        <div className="lg:col-span-6 min-w-0 stagger">
          <h1 className="font-jakarta font-extrabold text-ink text-[40px] sm:text-[54px] lg:text-[60px] leading-[1.04] tracking-tight">
            Take the right APs.{' '}
            <span className="relative inline-block text-leaf-600">
              Skip the rest.
              <svg className="absolute left-0 -bottom-2 w-full" height="12" viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden>
                <path d="M2 9 C 50 2, 150 2, 198 8" stroke="currentColor" strokeOpacity="0.55" strokeWidth="5" fill="none" strokeLinecap="round" />
              </svg>
            </span>
          </h1>

          <p className="mt-6 text-[17px] sm:text-[18px] text-slate-600 leading-relaxed max-w-lg">
            Find out which APs to take, how many your week can handle, and exactly why.
          </p>

          <div>
            <p className="mt-8 text-[13px] font-semibold text-slate-700">Where do you study?</p>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
              {ENTRY.map((e) => (
                <Link
                  key={e.to}
                  to={e.to}
                  className={`lift group flex items-center gap-4 bg-canvas border-2 ${e.tone.ring} rounded-3xl p-5 min-h-[92px] shadow-sm`}
                >
                  <span className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center ${e.tone.icon}`}>
                    <span aria-hidden="true" className="material-symbols-outlined text-[26px]">{e.icon}</span>
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-jakarta font-bold text-ink text-[17px]">{e.title}</span>
                    <span className="block text-[12.5px] text-slate-500 leading-snug mt-0.5">{e.sub}</span>
                  </span>
                  <span aria-hidden="true" className={`material-symbols-outlined ${e.tone.arrow} group-hover:translate-x-1 transition-transform`}>arrow_forward</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Visual: floating sample preview cards */}
        <HeroVisual />
      </div>
    </section>
  );
}

function HeroVisual() {
  // XP ring geometry (sample value).
  const r = 26;
  const circ = 2 * Math.PI * r;
  const progress = 0.64;

  return (
    <div className="lg:col-span-6 min-w-0 relative" role="group" aria-label="Sample preview of an Atrium plan, with illustrative numbers">
      <div className="relative mx-auto w-full max-w-[520px] h-[560px] sm:h-[520px]">
        {/* glow blobs */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-leaf-400/20 blur-3xl" aria-hidden />
        <div className="absolute right-4 top-6 w-40 h-40 rounded-full bg-violet-500/20 blur-3xl" aria-hidden />
        <div className="absolute left-4 bottom-4 w-40 h-40 rounded-full bg-sky-500/15 blur-3xl" aria-hidden />

        {/* orbit ring with dots */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px]" aria-hidden>
          <div className="w-full h-full rounded-full border border-dashed border-line-2 animate-spin-slow relative">
            <span className="absolute -top-1.5 left-1/2 w-3 h-3 rounded-full bg-leaf-400 shadow-[0_0_12px_rgba(74,222,128,0.8)]" />
            <span className="absolute top-1/2 -right-1 w-2 h-2 rounded-full bg-violet-400" />
            <span className="absolute -bottom-1 left-1/3 w-2.5 h-2.5 rounded-full bg-sky-400" />
          </div>
        </div>

        <span className="absolute top-0 left-0 z-20 text-[11px] font-semibold uppercase tracking-wider text-slate-500 bg-canvas border border-line rounded-full px-2.5 py-1">
          Sample · illustrative
        </span>

        {/* Sample plan card */}
        <div className="absolute left-0 top-10 z-10 w-[min(100%,330px)] animate-fade-up">
          <div className="animate-float bg-canvas rounded-3xl border border-line shadow-elev p-5">
            <div className="flex items-center justify-between">
              <p className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">Sample plan</p>
              <span className="text-[11px] font-semibold text-leaf-700 bg-leaf-50 border border-leaf-200 rounded-full px-2 py-0.5">{SAMPLE_PICKS.length} APs</span>
            </div>
            <p className="font-jakarta font-bold text-ink text-[17px] mt-1">Your AP picks</p>
            <ul className="mt-3 space-y-2.5">
              {SAMPLE_PICKS.map((p, i) => (
                <li key={p.name} className="flex items-center gap-3 rounded-2xl bg-slate-50 border border-line px-3 py-2.5">
                  <span className="w-7 h-7 shrink-0 rounded-full bg-leaf-600 text-white text-[12px] font-bold flex items-center justify-center">{i + 1}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-jakarta font-semibold text-ink text-[13.5px] truncate">{p.name}</span>
                    <span className="block text-[11.5px] text-slate-500 truncate">{p.why}</span>
                  </span>
                  <span className={`shrink-0 text-[10.5px] font-semibold border rounded-full px-2 py-0.5 ${p.style}`}>{p.chip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* XP / level ring */}
        <div className="absolute right-0 top-[360px] z-20 animate-pop" style={{ animationDelay: '0.25s' }}>
          <div className="animate-float-slow bg-canvas rounded-3xl border border-line shadow-elev p-4 flex items-center gap-3">
            <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90" aria-hidden>
              <circle cx="32" cy="32" r={r} fill="none" stroke="currentColor" strokeWidth="6" className="text-slate-100" />
              <circle
                cx="32" cy="32" r={r} fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round"
                strokeDasharray={circ} strokeDashoffset={circ * (1 - progress)}
                className="text-violet-500 fill-anim"
              />
            </svg>
            <div>
              <p className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">Sample · Level 3</p>
              <p className="font-jakarta font-extrabold text-ink text-[16px] leading-tight">Planner</p>
              <p className="text-[11.5px] text-slate-500">640 / 750 XP</p>
            </div>
          </div>
        </div>

        {/* Streak flame */}
        <div className="absolute left-0 sm:left-10 bottom-0 z-20 animate-pop" style={{ animationDelay: '0.45s' }}>
          <div className="animate-float bg-canvas rounded-3xl border border-line shadow-elev px-4 py-3 flex items-center gap-3" style={{ animationDelay: '-1.5s' }}>
            <span className="w-11 h-11 rounded-full bg-orange-500 flex items-center justify-center animate-glow">
              <span aria-hidden="true" className="material-symbols-outlined text-white text-[24px] animate-wiggle" style={fill}>local_fire_department</span>
            </span>
            <div>
              <p className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">Sample streak</p>
              <p className="font-jakarta font-extrabold text-ink text-[18px] leading-none mt-0.5">5 days</p>
              <div className="flex gap-1 mt-1.5" aria-hidden>
                {[1, 1, 1, 1, 1, 0, 0].map((on, i) => (
                  <span key={i} className={`w-2.5 h-2.5 rounded-full ${on ? 'bg-orange-500' : 'bg-slate-200'}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
