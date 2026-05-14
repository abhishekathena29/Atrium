export function FinalCTA() {
  return (
    <section id="cta" className="bg-paper">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-24 lg:py-32">
        <div className="border border-line bg-canvas rounded-sm overflow-hidden">
          <div className="grid lg:grid-cols-2">
            <div className="p-10 lg:p-16 border-b lg:border-b-0 lg:border-r border-line">
              <p className="eyebrow text-bronze-600 mb-4">For Students</p>
              <h3 className="font-serif text-ink text-display-md leading-tight">
                Start with a free 20-minute consult.
              </h3>
              <p className="mt-5 text-body text-slate-600 leading-relaxed">
                Tell us the courses you're weighing — we'll match you with a
                mentor who took them, so you can pressure-test your schedule
                before registration opens.
              </p>
              <a
                href="#"
                className="mt-8 inline-flex items-center gap-2 bg-ink text-paper text-[14px] font-medium px-6 py-3.5 rounded-sm hover:bg-ink-soft transition-colors"
              >
                Book a consult
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </a>
            </div>

            <div className="p-10 lg:p-16 bg-paper-2/50">
              <p className="eyebrow text-bronze-600 mb-4">For Mentors</p>
              <h3 className="font-serif text-ink text-display-md leading-tight">
                Share what you know. Get paid for it.
              </h3>
              <p className="mt-5 text-body text-slate-600 leading-relaxed">
                If you're at a top university and have recent results in the
                courses we cover, we'd like to talk. Applications take about ten
                minutes.
              </p>
              <a
                href="#"
                className="mt-8 inline-flex items-center gap-2 border border-ink text-ink text-[14px] font-medium px-6 py-3.5 rounded-sm hover:bg-ink hover:text-paper transition-colors"
              >
                Apply to mentor
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
