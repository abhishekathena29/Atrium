import { Link } from 'react-router-dom';

const columns = [
  {
    title: 'Plans',
    items: [
      { label: 'AP plan · India', to: '/india' },
      { label: 'Course load · SG / US', to: '/sg-us' },
      { label: 'Student-athletes', to: '/sg-us#athletes' },
      { label: 'Free consult', to: '/signup?role=student' },
    ],
  },
  {
    title: 'People',
    items: [
      { label: 'For students', to: '/#mentees' },
      { label: 'For parents', to: '/signup?role=parent' },
      { label: 'For mentors', to: '/#mentors' },
      { label: 'Apply to mentor', to: '/signup?role=mentor' },
    ],
  },
  {
    title: 'Trust',
    items: [
      { label: 'Methodology', to: '/methodology' },
      { label: 'Safeguarding', to: '/safeguarding' },
      { label: 'Report a concern', to: '/safeguarding#report' },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Sign in', to: '/signin' },
      { label: 'Create account', to: '/signup' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-ink text-paper">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-20 pb-10">
        <div className="grid lg:grid-cols-12 gap-12 pb-16 border-b border-slate-700">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-8 h-8 rounded-xl bg-leaf-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
              </span>
              <span className="font-jakarta font-extrabold text-paper text-[22px] tracking-tight">Atrium</span>
            </div>
            <p className="text-[14px] text-slate-300 leading-relaxed max-w-sm">
              AP and course-load selection for students in India and on the Singapore / US track. A free plan
              first, then a vetted mentor to check it.
            </p>
          </div>

          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {columns.map((c) => (
              <div key={c.title}>
                <p className="eyebrow text-slate-400 mb-4">{c.title}</p>
                <ul className="space-y-2.5">
                  {c.items.map((i) => (
                    <li key={i.label}>
                      <Link to={i.to} className="text-[13.5px] text-slate-300 hover:text-paper transition-colors">
                        {i.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-[12px] text-slate-400">
            © {new Date().getFullYear()} Atrium · Athena Education. Guidance only, not a score guarantee.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link to="/methodology" className="text-[12px] text-slate-400 hover:text-paper transition-colors">
              Methodology
            </Link>
            <Link to="/safeguarding" className="text-[12px] text-slate-400 hover:text-paper transition-colors">
              Safeguarding
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
