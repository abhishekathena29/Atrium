import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { IndiaIntake } from '../../auth/types';
import { buildIndiaPlan } from '../../engine/overlap';
import { SAMPLE_INDIA_PROFILE } from '../../data/samples';

const STREAMS: IndiaIntake['stream'][] = ['Science (PCM)', 'Science (PCB)', 'Science (PCMB)'];
const MAJORS = ['Computer Science', 'Engineering', 'Biology / Pre-med', 'Economics', 'Mathematics'];

const BAND_STYLE = {
  'High overlap': 'bg-emerald-50 text-emerald-800 border-emerald-200',
  Partial: 'bg-amber-50 text-amber-800 border-amber-200',
  None: 'bg-slate-100 text-slate-600 border-line-2',
} as const;

/** Live mini-demo of the India overlap engine with a neutral default profile. */
export function TryIt() {
  const [stream, setStream] = useState<IndiaIntake['stream']>('Science (PCM)');
  const [major, setMajor] = useState('Computer Science');

  const plan = useMemo(() => {
    const intake: IndiaIntake = { board: 'CBSE', stream, grade: '11', elective: 'Other / none', targetMajors: [major], targetColleges: [] };
    const neutral = { ...SAMPLE_INDIA_PROFILE, loadFactor: 1, career: { ...SAMPLE_INDIA_PROFILE.career, targetMajors: [major] } };
    return buildIndiaPlan(intake, neutral);
  }, [stream, major]);

  const top = plan.recommended.slice(0, 3);
  const skip = plan.items.find((i) => i.recommendation === 'skip');

  return (
    <section className="bg-canvas border-y border-line">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-5 min-w-0">
          <p className="text-[13px] font-bold uppercase tracking-widest text-leaf-600">Free AP planner · try it · India</p>
          <h2 className="font-jakarta font-extrabold text-ink text-[32px] sm:text-[38px] leading-tight mt-3">
            Which APs overlap with your stream?
          </h2>
          <p className="text-[15px] text-slate-600 leading-relaxed mt-4">
            Pick your CBSE stream and target major. Same engine as your full plan, which also weighs your
            personality, weekly hours and exam date.
          </p>

          <div className="mt-7 space-y-5">
            <div>
              <p className="text-[12.5px] font-semibold text-slate-700 mb-2">Your stream</p>
              <div className="flex flex-wrap gap-2">
                {STREAMS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={stream === s}
                    onClick={() => setStream(s)}
                    className={'rounded-full px-4 py-2 text-[13.5px] font-medium border-2 transition-colors ' + (stream === s ? 'bg-leaf-600 border-leaf-600 text-white' : 'bg-canvas border-line-2 text-slate-700 hover:border-leaf-300')}
                  >
                    {s.replace('Science ', '').replace(/[()]/g, '')}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[12.5px] font-semibold text-slate-700 mb-2">Target major</p>
              <div className="flex flex-wrap gap-2">
                {MAJORS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={major === m}
                    onClick={() => setMajor(m)}
                    className={'rounded-full px-4 py-2 text-[13.5px] font-medium border-2 transition-colors ' + (major === m ? 'bg-ink border-ink text-paper' : 'bg-canvas border-line-2 text-slate-700 hover:border-slate-400')}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 min-w-0">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-leaf-50 to-violet-50 border border-leaf-100 p-6 sm:p-8">
            <div className="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-leaf-400/15 blur-3xl pointer-events-none" aria-hidden />
            <div className="relative flex flex-wrap items-center justify-between gap-2 mb-5">
              <p className="font-jakarta font-bold text-ink text-[18px]">APs that fit on top of your boards</p>
              <span className="text-[11px] font-semibold text-slate-500 bg-canvas rounded-full px-2.5 py-1 border border-line">Illustrative preview</span>
            </div>
            {top.length === 0 && (
              <p className="relative bg-canvas rounded-2xl p-4 border border-line text-[13.5px] text-slate-600">
                No AP stands out as a light add-on for this combination. A mentor consult can help you weigh it up.
              </p>
            )}
            <ol className="relative space-y-3">
              {top.map((i, idx) => (
                <li key={`${stream}-${major}-${i.course.id}`} className="animate-slide-right bg-canvas rounded-2xl p-4 border border-line flex items-center gap-3 sm:gap-4 shadow-sm" style={{ animationDelay: `${idx * 0.08}s` }}>
                  <span className="w-9 h-9 rounded-full bg-leaf-600 text-white font-jakarta font-bold flex items-center justify-center shrink-0">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-jakarta font-bold text-ink text-[15.5px] break-words">{i.course.name}</p>
                    <p className="text-[12.5px] text-slate-500 line-clamp-2">{i.rationale}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-[11px] font-semibold border rounded-full px-2 py-0.5 ${BAND_STYLE[i.band]}`}>{i.band}</span>
                    <p className="text-[12px] text-slate-500 mt-1">~{i.netNewHours} new hrs</p>
                  </div>
                </li>
              ))}
            </ol>
            {skip && (
              <p className="relative mt-4 text-[13px] text-slate-600 flex items-start gap-2">
                <span aria-hidden="true" className="material-symbols-outlined text-[18px] text-slate-400">block</span>
                <span><span className="font-semibold text-ink">{skip.course.name}</span>: skip for now. {skip.reason}</span>
              </p>
            )}
            <Link to="/signup?role=student&segment=india" className="relative mt-6 inline-flex items-center gap-2 bg-leaf-600 text-white text-[14px] font-semibold rounded-full px-5 py-3 hover:brightness-110 hover:shadow-glow transition-colors">
              Get my full plan, free
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
