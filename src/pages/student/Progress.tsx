import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { getStudentState, planSubjects } from '../../engine/studentState';
import {
  XP_RULES,
  computeGamification,
  dayKey,
  fmtMinutes,
  planUnitKeys,
  unitKey,
} from '../../engine/gamification';
import {
  deleteStudyLog,
  getUnitProgress,
  listStudyLogs,
  makeId,
  saveStudyLog,
  toggleUnit,
} from '../../store/db';
import { AwardBadge, GoalRing, Heatmap, LevelCard, StreakCard } from '../../components/gamify/Gamify';
import { ErrorNote, Field, Select, TextInput, btnPrimary } from '../../components/ui/Field';
import { PageHeader, Panel } from '../dashboard/widgets';

const QUICK = [15, 30, 45, 60, 90];

export function Progress() {
  const { user } = useAuth();
  const [, force] = useState(0);
  const refresh = () => force((n) => n + 1);

  const state = getStudentState(user!);
  const g = computeGamification(user!, state);
  const subjects = planSubjects(state);
  const logs = listStudyLogs(user!.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const ticked = new Set(getUnitProgress(user!.id));
  const units = planUnitKeys(state);

  const [subject, setSubject] = useState(subjects[0] ?? 'General study');
  const [minutes, setMinutes] = useState(30);
  const [date, setDate] = useState(dayKey(new Date()));
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  function log(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (minutes <= 0 || minutes > 600) return setError('Enter between 1 and 600 minutes.');
    if (date > dayKey(new Date())) return setError("You can't log a future day.");
    const before = g.awards.filter((a) => a.earned).map((a) => a.id);
    saveStudyLog({ id: makeId('s'), userId: user!.id, date, minutes, subject, createdAt: new Date().toISOString() });
    const after = computeGamification(user!, getStudentState(user!));
    const fresh = after.awards.filter((a) => a.earned && !before.includes(a.id));
    setFlash(
      `+${Math.floor(minutes / 3)} XP` +
        (fresh.length ? ` · New award: ${fresh.map((a) => a.title).join(', ')}!` : '') +
        (after.streak > g.streak ? ` · Streak ${after.streak} 🔥` : ''),
    );
    refresh();
  }

  function tick(key: string) {
    toggleUnit(user!.id, key);
    refresh();
  }

  // SG/US: minutes logged this week per plan subject vs planned weekly hours.
  const monday = (() => {
    const d = new Date();
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return dayKey(d);
  })();
  const weekBySubject = new Map<string, number>();
  logs.filter((l) => l.date >= monday).forEach((l) => weekBySubject.set(l.subject, (weekBySubject.get(l.subject) ?? 0) + l.minutes));

  return (
    <>
      <PageHeader
        eyebrow="Progress & awards"
        title="Keep your plan moving"
        subtitle="Log study time, tick off plan units, and build your streak. Every point comes from something you actually did."
      />

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <StreakCard g={g} />
        <LevelCard g={g} />
        <GoalRing g={g} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Panel title="Log a study session">
            <form onSubmit={log} className="space-y-4">
              {error && <ErrorNote>{error}</ErrorNote>}
              {flash && (
                <p className="text-[13px] font-medium text-violet-800 bg-violet-50 border border-violet-200 rounded-sm px-3 py-2">
                  {flash}
                </p>
              )}
              <div className="grid sm:grid-cols-3 gap-4">
                <Field label="Subject">
                  <Select value={subject} onChange={(e) => setSubject(e.target.value)}>
                    {[...subjects, 'General study'].map((s) => <option key={s}>{s}</option>)}
                  </Select>
                </Field>
                <Field label="Minutes">
                  <TextInput type="number" min={1} max={600} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} />
                </Field>
                <Field label="Day">
                  <TextInput type="date" value={date} max={dayKey(new Date())} onChange={(e) => setDate(e.target.value)} />
                </Field>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {QUICK.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setMinutes(q)}
                    className={'text-[12.5px] px-3 py-1 rounded-full border ' + (minutes === q ? 'bg-ink text-paper border-ink' : 'border-line-2 text-slate-600')}
                  >
                    {q} min
                  </button>
                ))}
                <button type="submit" className={btnPrimary + ' ml-auto'}>
                  <span className="material-symbols-outlined text-[18px]">add_task</span>
                  Log session
                </button>
              </div>
            </form>
          </Panel>

          {units.length > 0 && (
            <Panel title="Plan checklist">
              <p className="text-[12.5px] text-slate-500 mb-4">
                The gap units your plan says to close for each recommended AP, plus exam-format practice. +15 XP each.
              </p>
              <div className="space-y-5">
                {units.map((c) => {
                  const done = c.units.filter((u) => ticked.has(unitKey(c.courseId, u))).length;
                  const pct = Math.round((done / c.units.length) * 100);
                  return (
                    <div key={c.courseId}>
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-[14px] font-semibold text-ink">{c.course}</p>
                        <p className="text-[12px] text-slate-500">{done} / {c.units.length}</p>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden mb-2">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <ul className="grid sm:grid-cols-2 gap-1.5">
                        {c.units.map((u) => {
                          const k = unitKey(c.courseId, u);
                          const on = ticked.has(k);
                          return (
                            <li key={k}>
                              <button
                                type="button"
                                onClick={() => tick(k)}
                                className={
                                  'w-full flex items-center gap-2 text-left text-[12.5px] rounded-lg border px-2.5 py-1.5 transition-colors ' +
                                  (on ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-canvas border-line-2 text-slate-700 hover:border-emerald-300')
                                }
                              >
                                <span className="material-symbols-outlined text-[18px]" style={on ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                                  {on ? 'check_circle' : 'radio_button_unchecked'}
                                </span>
                                {u}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </Panel>
          )}

          {state.loadPlan && (
            <Panel title="This week by subject">
              <ul className="space-y-3">
                {state.loadPlan.items.map((i) => {
                  const got = weekBySubject.get(i.name) ?? 0;
                  const pct = Math.min(100, Math.round((got / (i.hours * 60)) * 100));
                  return (
                    <li key={i.name}>
                      <div className="flex justify-between text-[13px]">
                        <span className="text-ink font-medium">{i.name} {i.to}</span>
                        <span className="text-slate-500">{fmtMinutes(got)} / {i.hours}h</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 mt-1 overflow-hidden">
                        <div className="h-full bg-sky-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Panel>
          )}

          <Panel title="Last 12 weeks">
            <Heatmap weeks={g.heatmap} />
            <p className="text-[12px] text-slate-500 mt-3">{fmtMinutes(g.totalMinutes)} logged in total.</p>
          </Panel>

          {!state.profile && (
            <p className="text-[13px] text-slate-600">
              Your weekly goal and checklist come from your plan.{' '}
              <Link to={state.intakeDone ? '/questionnaire' : '/onboarding'} className="underline">Finish setting it up</Link> to unlock them.
            </p>
          )}
        </div>

        <div className="space-y-6">
          <Panel title={`Awards · ${g.awards.filter((a) => a.earned).length} / ${g.awards.length}`}>
            <div className="grid grid-cols-3 gap-x-2 gap-y-5">
              {g.awards.map((a) => <AwardBadge key={a.id} a={a} />)}
            </div>
          </Panel>

          <Panel title="Recent sessions">
            {logs.length === 0 ? (
              <p className="text-[13px] text-slate-500">No sessions yet.</p>
            ) : (
              <ul className="divide-y divide-line">
                {logs.slice(0, 8).map((l) => (
                  <li key={l.id} className="flex items-center justify-between py-2 text-[13px]">
                    <div>
                      <p className="text-ink">{l.subject}</p>
                      <p className="text-[11.5px] text-slate-500">{new Date(l.date + 'T00:00:00').toLocaleDateString()} · {fmtMinutes(l.minutes)}</p>
                    </div>
                    <button
                      onClick={() => { deleteStudyLog(l.id); refresh(); }}
                      className="text-slate-400 hover:text-red-600"
                      aria-label="Delete session"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="How XP works">
            <ul className="space-y-1.5 text-[12.5px]">
              {XP_RULES.map((r) => (
                <li key={r.action} className="flex justify-between gap-3">
                  <span className="text-slate-600">{r.action}</span>
                  <span className="text-ink font-medium whitespace-nowrap">+{r.xp}{'per' in r ? ` ${r.per}` : ''}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}
