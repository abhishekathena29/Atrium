import { Link } from 'react-router-dom';

export function Hero() {
  return (
    <section className="relative bg-paper border-b border-line overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-line" />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-20 pb-24 lg:pt-28 lg:pb-32">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-end">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-3 mb-8">
              <span className="eyebrow text-bronze-600">Academic Mentorship</span>
              <span className="h-px w-12 bg-bronze-300" />
              <span className="eyebrow text-slate-500">Est. 2024</span>
            </div>

            <h1 className="font-serif text-ink text-display-xl lg:text-display-2xl">
              Choose the right courses.
              <br />
              <span className="italic text-bronze-600">Stay ahead of them.</span>
            </h1>

            <p className="mt-8 text-body-lg text-slate-600 max-w-xl leading-relaxed">
              Atrium pairs high-school and undergraduate students with vetted peer
              mentors who have already navigated AP, IB, A-Level, and competitive
              university coursework — so you can build a transcript that opens doors.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/signup?role=student"
                className="inline-flex items-center gap-2 bg-ink text-paper text-[14px] font-medium px-6 py-3.5 rounded-sm hover:bg-ink-soft transition-colors"
              >
                Find a mentor
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
              <Link
                to="/signup?role=mentor"
                className="inline-flex items-center gap-2 text-[14px] font-medium text-ink border-b border-ink/40 hover:border-ink pb-1 transition-colors"
              >
                Apply to mentor
              </Link>
            </div>

            <div className="mt-14 grid grid-cols-3 gap-8 max-w-lg">
              <Stat value="2,400+" label="Students mentored" />
              <Stat value="92%" label="Improved GPA" />
              <Stat value="48hr" label="Avg. match time" />
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-24 h-24 border border-bronze-300 rounded-sm" />
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80"
                alt="Student studying at a desk with open textbooks and notes"
                className="relative w-full aspect-[4/5] object-cover rounded-sm shadow-elev"
              />

              <div className="absolute -bottom-6 -right-6 bg-canvas border border-line p-5 rounded-sm shadow-card w-64">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-bronze-100 flex items-center justify-center">
                    <span
                      className="material-symbols-outlined text-bronze-600 text-[18px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      menu_book
                    </span>
                  </div>
                  <div>
                    <p className="font-serif text-ink text-[18px] leading-none">AP Calculus BC</p>
                    <p className="text-[11px] text-slate-500 mt-1">In session · 47 min</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-line flex items-center justify-between">
                  <p className="text-[11px] text-slate-500">Mentor</p>
                  <p className="text-[12px] font-medium text-ink">Priya S. · MIT '26</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-serif text-ink text-[28px] leading-none">{value}</p>
      <p className="text-[12px] text-slate-500 mt-2 leading-tight">{label}</p>
    </div>
  );
}
