import { useEffect, useRef, useState } from 'react';

const STEPS = [
  {
    icon: 'psychology',
    color: 'bg-violet-100 text-violet-700',
    title: 'About you',
    body: 'Quick questions on how you like to work and what you enjoy, so the plan fits you.',
    tags: ['~6 min', 'Saves as you go'],
  },
  {
    icon: 'menu_book',
    color: 'bg-sky-100 text-sky-700',
    title: 'Your studies',
    body: 'Your base curriculum first, then APs as an add-on. Where you’re aiming, and how busy your week is.',
    tags: ['~4 min', 'US / UK', 'Weekly hours'],
  },
  {
    icon: 'route',
    color: 'bg-leaf-100 text-leaf-700',
    title: 'Your plan',
    body: 'Which APs, how many, how hard each one is, and why. Free.',
    tags: ['Instant', 'Every reason shown'],
  },
  {
    icon: 'forum',
    color: 'bg-amber-100 text-amber-700',
    title: 'Go deeper',
    body: 'Optional: ask AI follow-up questions, or book a mentor for deeper guidance.',
    tags: ['AI follow-ups', 'Mentor check'],
  },
];

/** True once the element has scrolled into view (stays true). */
function useSeen<T extends Element>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, seen] as const;
}

export function Steps() {
  // The track fills left to right as the section enters view, so the four steps read as one journey.
  const [ref, seen] = useSeen<HTMLOListElement>();

  return (
    <section id="how" className="bg-paper">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
        <div className="max-w-2xl mb-14">
          <p className="text-[13px] font-bold uppercase tracking-widest text-leaf-600">How it works</p>
          <h2 className="font-jakarta font-extrabold text-ink text-[34px] sm:text-[40px] leading-tight mt-3">
            From “what should I take?” to a plan you trust
          </h2>
        </div>

        <ol ref={ref} className="relative grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-6">
          {/* Progress track: vertical on phones, horizontal on desktop. */}
          <span className="absolute left-7 top-7 bottom-7 w-0.5 bg-line lg:hidden" aria-hidden />
          <span
            className="absolute left-7 top-7 w-0.5 bg-gradient-to-b from-violet-500 via-leaf-500 to-amber-500 lg:hidden transition-[height] duration-[1400ms] ease-out"
            style={{ height: seen ? 'calc(100% - 3.5rem)' : 0 }}
            aria-hidden
          />
          <span className="hidden lg:block absolute top-7 left-7 right-[calc(25%-1.75rem)] h-0.5 bg-line" aria-hidden />
          <span
            className="hidden lg:block absolute top-7 left-7 h-0.5 bg-gradient-to-r from-violet-500 via-leaf-500 to-amber-500 origin-left transition-transform duration-[1400ms] ease-out"
            style={{ right: 'calc(25% - 1.75rem)', transform: `scaleX(${seen ? 1 : 0})` }}
            aria-hidden
          />

          {STEPS.map((s, i) => (
            <li
              key={s.title}
              className={`relative flex lg:flex-col gap-5 lg:gap-0 transition-all duration-500 ${seen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
              style={{ transitionDelay: `${i * 280}ms` }}
            >
              <div className={`relative z-10 shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center ring-4 ring-paper ${s.color}`}>
                <span aria-hidden="true" className="material-symbols-outlined text-[28px]">{s.icon}</span>
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-leaf-600 text-white text-[11px] font-bold flex items-center justify-center">{i + 1}</span>
              </div>
              <div className="min-w-0 lg:mt-5 lg:pr-4">
                <h3 className="font-jakarta font-bold text-ink text-[18px]">{s.title}</h3>
                <p className="text-[14px] text-slate-600 leading-relaxed mt-1.5">{s.body}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {s.tags.map((t) => (
                    <span key={t} className="text-[11.5px] font-medium text-slate-700 bg-slate-50 border border-line rounded-full px-2.5 py-1">{t}</span>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
