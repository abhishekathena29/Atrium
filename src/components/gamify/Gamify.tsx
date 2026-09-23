import { Link } from 'react-router-dom';
import { fmtMinutes, type Award, type DayCell, type Gamification } from '../../engine/gamification';

const TONE: Record<Award['tone'], { bg: string; fg: string; ring: string }> = {
  amber: { bg: 'bg-amber-100', fg: 'text-amber-700', ring: 'ring-amber-200' },
  emerald: { bg: 'bg-emerald-100', fg: 'text-emerald-700', ring: 'ring-emerald-200' },
  sky: { bg: 'bg-sky-100', fg: 'text-sky-700', ring: 'ring-sky-200' },
  violet: { bg: 'bg-violet-100', fg: 'text-violet-700', ring: 'ring-violet-200' },
  rose: { bg: 'bg-rose-100', fg: 'text-rose-700', ring: 'ring-rose-200' },
  orange: { bg: 'bg-orange-100', fg: 'text-orange-600', ring: 'ring-orange-200' },
};

export function StreakCard({ g }: { g: Gamification }) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 p-5">
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${g.streak ? 'bg-orange-500' : 'bg-slate-200'}`}>
          <span className="material-symbols-outlined text-white text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            local_fire_department
          </span>
        </div>
        <div>
          <p className="text-[28px] font-bold text-ink leading-none">{g.streak}<span className="text-[14px] font-medium text-slate-500"> day{g.streak === 1 ? '' : 's'}</span></p>
          <p className="text-[12px] text-slate-600 mt-1">Study streak · best {g.longestStreak}</p>
        </div>
      </div>
      <p className="text-[12px] mt-3 text-orange-800">
        {g.studiedToday ? 'Logged today. Streak safe.' : g.streak ? 'Log a session today to keep it going.' : 'Log a session to start a streak.'}
      </p>
    </div>
  );
}

export function LevelCard({ g }: { g: Gamification }) {
  const span = g.nextLevelAt ? g.nextLevelAt - g.levelFloor : 1;
  const pct = g.nextLevelAt ? Math.round(((g.xp - g.levelFloor) / span) * 100) : 100;
  return (
    <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-sky-50 border border-violet-100 p-5">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold text-[18px]">
          {g.level}
        </div>
        <div>
          <p className="text-[18px] font-bold text-ink leading-tight">{g.levelName}</p>
          <p className="text-[12px] text-slate-600">{g.xp} XP</p>
        </div>
      </div>
      <div className="mt-3 h-2 rounded-full bg-white overflow-hidden">
        <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[12px] mt-2 text-violet-800">
        {g.nextLevelAt ? `${g.nextLevelAt - g.xp} XP to level ${g.level + 1}` : 'Top level reached'}
      </p>
    </div>
  );
}

export function GoalRing({ g }: { g: Gamification }) {
  const pct = Math.min(1, g.weekMinutes / g.weeklyGoalMinutes);
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-5 flex items-center gap-4">
      <svg width="64" height="64" viewBox="0 0 64 64" className="shrink-0 -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="white" strokeWidth="7" />
        <circle cx="32" cy="32" r={r} fill="none" stroke="#059669" strokeWidth="7" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)} />
      </svg>
      <div>
        <p className="text-[18px] font-bold text-ink leading-tight">{Math.round(pct * 100)}%</p>
        <p className="text-[12px] text-slate-600">
          {fmtMinutes(g.weekMinutes)} of {fmtMinutes(g.weeklyGoalMinutes)} this week
        </p>
        <p className="text-[12px] text-emerald-800 mt-1">{pct >= 1 ? 'Weekly goal met!' : 'Weekly goal from your plan'}</p>
      </div>
    </div>
  );
}

export function AwardBadge({ a, size = 'md' }: { a: Award; size?: 'sm' | 'md' }) {
  const t = TONE[a.tone];
  const circle = size === 'sm' ? 'w-10 h-10' : 'w-14 h-14';
  return (
    <div className={`flex flex-col items-center text-center ${a.earned ? '' : 'opacity-60'}`} title={a.description}>
      <div className={`${circle} rounded-full flex items-center justify-center ring-4 ${a.earned ? `${t.bg} ${t.ring}` : 'bg-slate-100 ring-slate-50'}`}>
        <span
          className={`material-symbols-outlined ${size === 'sm' ? 'text-[20px]' : 'text-[26px]'} ${a.earned ? t.fg : 'text-slate-400'}`}
          style={a.earned ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
          {a.earned ? a.icon : 'lock'}
        </span>
      </div>
      {size === 'md' && (
        <>
          <p className="text-[12.5px] font-semibold text-ink mt-2 leading-tight">{a.title}</p>
          <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{a.earned ? a.description : a.progress ?? a.description}</p>
        </>
      )}
    </div>
  );
}

function cellColor(c: DayCell) {
  if (c.future) return 'bg-transparent';
  if (!c.minutes) return 'bg-slate-100';
  if (c.minutes < 30) return 'bg-emerald-200';
  if (c.minutes < 60) return 'bg-emerald-400';
  if (c.minutes < 120) return 'bg-emerald-500';
  return 'bg-emerald-700';
}

export function Heatmap({ weeks }: { weeks: DayCell[][] }) {
  return (
    <div>
      <div className="flex gap-1 overflow-x-auto pb-1">
        {weeks.map((w, i) => (
          <div key={i} className="flex flex-col gap-1">
            {w.map((d) => (
              <div key={d.date} title={`${d.date}: ${d.minutes ? fmtMinutes(d.minutes) : 'no study logged'}`} className={`w-3.5 h-3.5 rounded-[3px] ${cellColor(d)}`} />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500">
        Less
        {['bg-slate-100', 'bg-emerald-200', 'bg-emerald-400', 'bg-emerald-500', 'bg-emerald-700'].map((c) => (
          <span key={c} className={`w-3 h-3 rounded-[3px] ${c}`} />
        ))}
        More
      </div>
    </div>
  );
}

/** Compact strip for dashboards. */
export function GamifyStrip({ g, to = '/progress', label }: { g: Gamification; to?: string; label?: string }) {
  const earned = g.awards.filter((a) => a.earned);
  return (
    <div className="rounded-2xl border border-line bg-canvas p-4 flex flex-wrap items-center gap-x-6 gap-y-3">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-orange-500 text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
        <span className="text-[14px] font-semibold text-ink">{g.streak}-day streak</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-violet-600 text-white text-[11px] font-bold flex items-center justify-center">{g.level}</span>
        <span className="text-[14px] font-semibold text-ink">{g.levelName}</span>
        <span className="text-[12px] text-slate-500">{g.xp} XP</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-emerald-600 text-[22px]">flag</span>
        <span className="text-[13px] text-slate-600">{fmtMinutes(g.weekMinutes)} / {fmtMinutes(g.weeklyGoalMinutes)} this week</span>
      </div>
      <div className="flex items-center gap-1.5">
        {earned.slice(-5).map((a) => <AwardBadge key={a.id} a={a} size="sm" />)}
        <span className="text-[12px] text-slate-500 ml-1">{earned.length} / {g.awards.length} awards</span>
      </div>
      <Link to={to} className="ml-auto text-[13px] font-medium text-bronze-600 hover:text-bronze-700">
        {label ?? 'Progress & awards →'}
      </Link>
    </div>
  );
}
