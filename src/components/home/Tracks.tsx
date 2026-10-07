import { Link } from 'react-router-dom';

const PLAN_FOR = [
  { icon: 'menu_book', label: 'CBSE boards' },
  { icon: 'language', label: 'IB Diploma' },
  { icon: 'auto_stories', label: 'A-Levels' },
  { icon: 'school', label: 'US high school' },
  { icon: 'add_circle', label: 'APs on top' },
  { icon: 'sprint', label: 'Student-athletes' },
  { icon: 'family_restroom', label: 'Parents' },
];

const TRACKS = [
  {
    to: '/india',
    tag: 'India',
    icon: 'menu_book',
    title: 'Which APs fit on top of your boards?',
    body: 'Many APs cover ground your boards already teach. We rank them by the extra study they really add.',
    points: ['Unit-by-unit overlap with your syllabus', 'Ranked by extra hours on top of your boards, then balanced so you carry at most one or two demanding APs', 'Skips APs with little relevance to your major'],
    color: { soft: 'bg-leaf-50', border: 'border-leaf-200', chip: 'bg-leaf-100 text-leaf-800', icon: 'text-leaf-600', btn: 'bg-leaf-600 hover:brightness-110 hover:shadow-glow' },
    cta: 'See the India planner',
  },
  {
    to: '/sg-us',
    tag: 'Singapore · US',
    icon: 'public',
    title: 'A course load your week can survive.',
    body: 'IB, A-Levels or a US high school, plus any APs on top, checked against the hours you really have.',
    points: ['Weekly load meter vs your ceiling', 'Keep / downgrade / stretch, with reasons', 'Season-aware pacing for athletes'],
    color: { soft: 'bg-sky-50', border: 'border-sky-200', chip: 'bg-sky-100 text-sky-800', icon: 'text-sky-600', btn: 'bg-sky-600 hover:brightness-110 hover:shadow-glow' },
    cta: 'See the SG / US planner',
  },
];

export function Tracks() {
  return (
    <section id="mentees" className="bg-paper">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        <div className="flex flex-wrap justify-center gap-2.5 mb-16 stagger">
          {PLAN_FOR.map((p) => (
            <span key={p.label} className="inline-flex items-center gap-2 bg-canvas border border-line rounded-full px-4 py-2 text-[13.5px] font-medium text-slate-700 shadow-sm">
              <span aria-hidden="true" className="material-symbols-outlined text-[18px] text-leaf-600">{p.icon}</span>
              {p.label}
            </span>
          ))}
        </div>

        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-jakarta font-extrabold text-ink text-[34px] sm:text-[40px] leading-tight">
            Built for the choice in front of you
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 stagger">
          {TRACKS.map((t) => (
            <article key={t.to} className={`lift relative rounded-3xl border ${t.color.border} ${t.color.soft} overflow-hidden flex flex-col`}>
              <div className={`absolute -right-12 -top-12 w-44 h-44 rounded-full ${t.color.chip} blur-2xl opacity-70 pointer-events-none`} aria-hidden />
              <div className="relative p-7 flex-1 flex flex-col">
                <div className="flex items-center justify-between gap-3">
                  <span className={`text-[12px] font-bold rounded-full px-3 py-1 ${t.color.chip}`}>{t.tag}</span>
                  <span className={`animate-float-slow w-12 h-12 rounded-2xl flex items-center justify-center ${t.color.chip}`} aria-hidden>
                    <span aria-hidden="true" className="material-symbols-outlined text-[26px]">{t.icon}</span>
                  </span>
                </div>
                <h3 className="font-jakarta font-bold text-ink text-[24px] leading-snug mt-4">{t.title}</h3>
                <p className="text-[14.5px] text-slate-600 leading-relaxed mt-2">{t.body}</p>
                <ul className="mt-5 space-y-2.5 flex-1">
                  {t.points.map((p) => (
                    <li key={p} className="flex items-start gap-2.5 text-[14px] text-slate-700">
                      <span aria-hidden="true" className={`material-symbols-outlined text-[20px] ${t.color.icon}`} style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      {p}
                    </li>
                  ))}
                </ul>
                <Link to={t.to} className={`mt-7 self-start inline-flex items-center gap-2 text-white text-[14px] font-semibold rounded-full px-5 py-3 transition-colors ${t.color.btn}`}>
                  {t.cta}
                  <span aria-hidden="true" className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
