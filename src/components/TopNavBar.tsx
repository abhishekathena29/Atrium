export function TopNavBar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-paper/85 backdrop-blur-md border-b border-line">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-sm bg-ink flex items-center justify-center">
            <span className="font-serif text-paper text-[15px] leading-none mt-[2px]">A</span>
          </span>
          <span className="font-serif text-ink text-[20px] tracking-tight">Atrium</span>
        </a>

        <nav className="hidden md:flex items-center gap-9">
          <a href="#subjects" className="text-[13.5px] font-medium text-slate-700 hover:text-ink transition-colors">
            Subjects
          </a>
          <a href="#mentees" className="text-[13.5px] font-medium text-slate-700 hover:text-ink transition-colors">
            For Students
          </a>
          <a href="#mentors" className="text-[13.5px] font-medium text-slate-700 hover:text-ink transition-colors">
            For Mentors
          </a>
          <a href="#how" className="text-[13.5px] font-medium text-slate-700 hover:text-ink transition-colors">
            How it works
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="#"
            className="hidden sm:inline-flex text-[13.5px] font-medium text-slate-700 hover:text-ink px-3 py-2 transition-colors"
          >
            Sign in
          </a>
          <a
            href="#cta"
            className="inline-flex items-center gap-1.5 bg-ink text-paper text-[13px] font-medium px-4 py-2.5 rounded-sm hover:bg-ink-soft transition-colors"
          >
            Book a session
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </a>
        </div>
      </div>
    </header>
  );
}
