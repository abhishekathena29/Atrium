const columns = [
  {
    title: 'Subjects',
    items: ['Mathematics', 'Sciences', 'Humanities', 'Computer Science', 'Languages', 'Economics'],
  },
  {
    title: 'Programs',
    items: ['Course selection', 'AP & IB prep', 'College planning', 'Semester roadmaps'],
  },
  {
    title: 'Company',
    items: ['About', 'Mentor standards', 'Press', 'Contact'],
  },
  {
    title: 'Resources',
    items: ['Free consult', 'Course guides', 'Help center', 'Mentor login'],
  },
];

export function Footer() {
  return (
    <footer className="bg-ink text-paper">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-20 pb-10">
        <div className="grid lg:grid-cols-12 gap-12 pb-16 border-b border-slate-700">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-7 h-7 rounded-sm bg-paper flex items-center justify-center">
                <span className="font-serif text-ink text-[15px] leading-none mt-[2px]">A</span>
              </span>
              <span className="font-serif text-paper text-[22px] tracking-tight">Atrium</span>
            </div>
            <p className="text-[14px] text-slate-300 leading-relaxed max-w-sm">
              Academic mentorship for students choosing their courses and the
              mentors who guide them. Built on lived experience, not generic
              tutoring.
            </p>

            <div className="mt-8">
              <p className="eyebrow text-slate-400 mb-3">Newsletter</p>
              <form className="flex border border-slate-700 rounded-sm overflow-hidden max-w-sm">
                <input
                  type="email"
                  placeholder="you@school.edu"
                  className="flex-1 bg-transparent text-[13.5px] text-paper placeholder:text-slate-500 px-4 py-3 focus:outline-none"
                />
                <button className="bg-paper text-ink text-[13px] font-medium px-5 hover:bg-paper-2 transition-colors">
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {columns.map((c) => (
              <div key={c.title}>
                <p className="eyebrow text-slate-400 mb-4">{c.title}</p>
                <ul className="space-y-2.5">
                  {c.items.map((i) => (
                    <li key={i}>
                      <a
                        href="#"
                        className="text-[13.5px] text-slate-300 hover:text-paper transition-colors"
                      >
                        {i}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-[12px] text-slate-400">
            © {new Date().getFullYear()} Atrium Academic Inc. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <a href="#" className="text-[12px] text-slate-400 hover:text-paper transition-colors">
              Privacy
            </a>
            <a href="#" className="text-[12px] text-slate-400 hover:text-paper transition-colors">
              Terms
            </a>
            <a href="#" className="text-[12px] text-slate-400 hover:text-paper transition-colors">
              Safeguarding
            </a>
            <a href="#" className="text-[12px] text-slate-400 hover:text-paper transition-colors">
              Accessibility
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
