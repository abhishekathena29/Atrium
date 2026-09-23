import { Link } from 'react-router-dom';

const PLAN_FOR = [
  { icon: 'menu_book', label: 'CBSE boards' },
  { icon: 'workspace_premium', label: 'AP exams' },
  { icon: 'language', label: 'IB Diploma' },
  { icon: 'auto_stories', label: 'A-Levels' },
  { icon: 'sprint', label: 'Student-athletes' },
  { icon: 'family_restroom', label: 'Parents' },
];

const TRACKS = [
  {
    to: '/india',
    tag: 'India',
    title: 'Which APs are nearly free for you?',
    body: "You're already studying for your boards. Many APs cover the same ground. We rank them by the extra study they actually cost you.",
    points: ['Unit-by-unit overlap with your syllabus', 'Ranked by net-new hours, not difficulty', "Skips APs that don't help your major"],
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=900&q=80',
    color: { soft: 'bg-leaf-50', border: 'border-leaf-200', chip: 'bg-leaf-100 text-leaf-800', icon: 'text-leaf-600', btn: 'bg-leaf-600 hover:bg-leaf-700' },
    cta: 'See the India planner',
  },
  {
    to: '/sg-us',
    tag: 'Singapore · US track',
    title: 'A course load your week can survive.',
    body: 'IB, A-Level or AP subjects and levels, checked against the hours you really have. Student-athletes get a ceiling built from their training.',
    points: ['Weekly load meter vs your ceiling', 'Keep / downgrade / stretch, with reasons', 'Season-aware pacing for athletes'],
    image: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=900&q=80',
    color: { soft: 'bg-sky-50', border: 'border-sky-200', chip: 'bg-sky-100 text-sky-800', icon: 'text-sky-600', btn: 'bg-sky-600 hover:bg-sky-700' },
    cta: 'See the SG / US planner',
  },
];

export function Tracks() {
  return (
    <section id="mentees" className="bg-paper">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        <div className="flex flex-wrap justify-center gap-2.5 mb-16">
          {PLAN_FOR.map((p) => (
            <span key={p.label} className="inline-flex items-center gap-2 bg-white border border-line rounded-full px-4 py-2 text-[13.5px] font-medium text-slate-700 shadow-sm">
              <span className="material-symbols-outlined text-[18px] text-bronze-500">{p.icon}</span>
              {p.label}
            </span>
          ))}
        </div>

        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-[13px] font-bold uppercase tracking-widest text-leaf-600">Two tracks, one planner</p>
          <h2 className="font-jakarta font-extrabold text-ink text-[34px] sm:text-[40px] leading-tight mt-3">
            Built for the choice in front of you
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {TRACKS.map((t) => (
            <article key={t.to} className={`rounded-3xl border ${t.color.border} ${t.color.soft} overflow-hidden flex flex-col`}>
              <img src={t.image} alt="" className="h-48 w-full object-cover" />
              <div className="p-7 flex-1 flex flex-col">
                <span className={`self-start text-[12px] font-bold rounded-full px-3 py-1 ${t.color.chip}`}>{t.tag}</span>
                <h3 className="font-jakarta font-bold text-ink text-[24px] leading-snug mt-4">{t.title}</h3>
                <p className="text-[14.5px] text-slate-600 leading-relaxed mt-2">{t.body}</p>
                <ul className="mt-5 space-y-2.5 flex-1">
                  {t.points.map((p) => (
                    <li key={p} className="flex items-start gap-2.5 text-[14px] text-slate-700">
                      <span className={`material-symbols-outlined text-[20px] ${t.color.icon}`} style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      {p}
                    </li>
                  ))}
                </ul>
                <Link to={t.to} className={`mt-7 self-start inline-flex items-center gap-2 text-white text-[14px] font-semibold rounded-full px-5 py-3 transition-colors ${t.color.btn}`}>
                  {t.cta}
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
