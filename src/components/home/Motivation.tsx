import { Link } from 'react-router-dom';
import type { Award } from '../../engine/gamification';
import { AwardBadge } from '../gamify/Gamify';

const PREVIEW_AWARDS: Award[] = [
  { id: 'a', title: 'On a roll', description: '3-day streak', icon: 'local_fire_department', tone: 'orange', earned: true },
  { id: 'b', title: 'Gap closer', description: 'Finish an AP’s units', icon: 'task_alt', tone: 'emerald', earned: true },
  { id: 'c', title: 'Goal getter', description: 'Hit a weekly goal', icon: 'flag', tone: 'emerald', earned: true },
  { id: 'd', title: 'Mentored', description: 'Complete a consult', icon: 'handshake', tone: 'violet', earned: true },
  { id: 'e', title: 'Ten-hour club', description: 'Log 10 hours', icon: 'hourglass_top', tone: 'amber', earned: false, progress: '6 / 10 hrs' },
  { id: 'f', title: 'Unstoppable', description: '30-day streak', icon: 'whatshot', tone: 'rose', earned: false, progress: '12 / 30 days' },
];

const WEEK = [40, 25, 0, 55, 30, 60, 20];

const FEATURES = [
  { icon: 'local_fire_department', color: 'text-orange-500', title: 'Daily streaks', body: 'Log even 15 minutes to keep the flame alive.' },
  { icon: 'military_tech', color: 'text-violet-600', title: 'XP & levels', body: 'Newcomer to Luminary. Every point comes from something you actually did.' },
  { icon: 'checklist', color: 'text-leaf-600', title: 'Unit checklist', body: 'Tick off the exact gap units your plan says to close.' },
  { icon: 'flag', color: 'text-sky-600', title: 'Weekly goal', body: 'Set by your plan, not an arbitrary target.' },
];

export function Motivation() {
  return (
    <section className="bg-gradient-to-b from-violet-50/60 to-paper">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-[13px] font-bold uppercase tracking-widest text-violet-600">Stay motivated</p>
          <h2 className="font-jakarta font-extrabold text-ink text-[34px] sm:text-[40px] leading-tight mt-3">
            Self-study is easier when you can see it adding up
          </h2>
          <p className="text-[15px] text-slate-600 leading-relaxed mt-4">
            Self-studying an AP alongside boards is a long haul. Atrium turns your plan into small daily wins,
            and parents can cheer you on from their dashboard.
          </p>
          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl border border-line p-4 shadow-sm">
                <span className={`material-symbols-outlined text-[26px] ${f.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{f.icon}</span>
                <p className="font-jakarta font-bold text-ink text-[15px] mt-2">{f.title}</p>
                <p className="text-[13px] text-slate-600 mt-1 leading-snug">{f.body}</p>
              </div>
            ))}
          </div>
          <Link to="/signup?role=student" className="mt-8 inline-flex items-center gap-2 bg-violet-600 text-white text-[14px] font-semibold rounded-full px-5 py-3 hover:bg-violet-700 transition-colors">
            Start your streak
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </div>

        <div className="relative">
          <div className="bg-white rounded-3xl border border-line shadow-elev p-6">
            <div className="flex items-center justify-between">
              <p className="font-jakarta font-bold text-ink text-[16px]">Your week</p>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 rounded-full px-2.5 py-1 border border-line">Preview</span>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="rounded-2xl bg-orange-50 p-3 text-center">
                <span className="material-symbols-outlined text-orange-500 text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                <p className="font-jakarta font-extrabold text-ink text-[20px] leading-none">12</p>
                <p className="text-[11px] text-slate-600 mt-1">day streak</p>
              </div>
              <div className="rounded-2xl bg-violet-50 p-3 text-center">
                <span className="inline-flex w-7 h-7 rounded-full bg-violet-600 text-white text-[12px] font-bold items-center justify-center">4</span>
                <p className="font-jakarta font-extrabold text-ink text-[16px] leading-tight mt-1">Scholar</p>
                <p className="text-[11px] text-slate-600">820 XP</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-3 text-center">
                <span className="material-symbols-outlined text-emerald-600 text-[28px]">flag</span>
                <p className="font-jakarta font-extrabold text-ink text-[20px] leading-none">96%</p>
                <p className="text-[11px] text-slate-600 mt-1">weekly goal</p>
              </div>
            </div>

            <div className="mt-5 flex items-end justify-between gap-2 h-24">
              {WEEK.map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className={`w-full rounded-lg ${m ? 'bg-leaf-400' : 'bg-slate-100'}`} style={{ height: `${Math.max(8, (m / 60) * 80)}px` }} />
                  <span className="text-[10.5px] text-slate-500">{'MTWTFSS'[i]}</span>
                </div>
              ))}
            </div>

            <p className="font-jakarta font-bold text-ink text-[14px] mt-6 mb-3">Awards</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {PREVIEW_AWARDS.map((a) => <AwardBadge key={a.id} a={a} size="md" />)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
