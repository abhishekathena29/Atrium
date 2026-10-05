import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { OCEAN_ITEMS, QUIZ_AGREE, QUIZ_LIKE, RIASEC_ITEMS, type RiasecType } from '../../data/questionnaire';
import { hollandCode, loadFactorFor, scoreOcean, scoreRiasec, stretchCapsFor } from '../../engine/profile';
import { getStudentState, refreshProfile } from '../../engine/studentState';
import { SETUP_XP, setupSections } from '../../engine/gamification';
import { XpToast } from '../../components/gamify/Gamify';
import { getProgress, saveProgress, type QuestionnaireProgress } from '../../store/db';
import { btnPrimary, btnSecondary } from '../../components/ui/Field';

interface QuizItem {
  id: string;
  text: string;
  hint?: string;
  section: 'personality' | 'interests';
}

const ITEMS: QuizItem[] = [
  ...OCEAN_ITEMS.map((i) => ({ id: i.id, text: i.text, hint: i.hint, section: 'personality' as const })),
  ...RIASEC_ITEMS.map((i) => ({ id: i.id, text: i.text, section: 'interests' as const })),
];
const SPLIT = OCEAN_ITEMS.length;

/** Plain-language names for the Holland types, for the reveal screen. */
const VIBE: Record<RiasecType, { name: string; icon: string; line: string }> = {
  R: { name: 'Builder', icon: 'construction', line: 'You like hands-on work: making, fixing, testing.' },
  I: { name: 'Investigator', icon: 'biotech', line: 'You like figuring out how and why things work.' },
  A: { name: 'Creator', icon: 'palette', line: 'You like expressing ideas: writing, design, performance.' },
  S: { name: 'Helper', icon: 'volunteer_activism', line: 'You like teaching, supporting and working with people.' },
  E: { name: 'Leader', icon: 'campaign', line: 'You like persuading, organising people and starting things.' },
  C: { name: 'Organiser', icon: 'checklist', line: 'You like order, accuracy and a clear process.' },
};

function freshProgress(userId: string): QuestionnaireProgress {
  const now = new Date().toISOString();
  return { userId, answers: {}, career: {}, step: 0, startedAt: now, updatedAt: now };
}

/** "About you": light, tap-to-answer personality + interest questions. No school fields here. */
export function Questionnaire() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [progress, setProgress] = useState<QuestionnaireProgress>(() => {
    const saved = getProgress(user!.id) ?? freshProgress(user!.id);
    // Resume at the first unanswered statement (older saves stored a page index in step).
    const first = ITEMS.findIndex((i) => !saved.answers[i.id]);
    return saved.completedAt || first === -1 ? saved : { ...saved, step: first };
  });
  const advance = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(advance.current), []);
  const [interlude, setInterlude] = useState(false);
  const [toast, setToast] = useState<{ key: number; xp: number; label: string } | null>(null);
  const [dir, setDir] = useState<'next' | 'back'>('next');
  const intakeDone = user!.segment === 'india' ? !!user!.india : !!user!.sgus;

  const update = useCallback((next: Partial<QuestionnaireProgress>) => {
    setProgress((prev) => {
      const merged = { ...prev, ...next };
      saveProgress(merged); // saved on every tap, so the student can leave and resume
      return merged;
    });
  }, []);

  const idx = Math.min(progress.step, ITEMS.length - 1);
  const item = ITEMS[idx];
  const done = !!progress.completedAt;

  const answer = useCallback((value: number) => {
    const answers = { ...progress.answers, [item.id]: value };
    setDir('next');
    if (idx === SPLIT - 1 && !progress.answers[item.id]) {
      update({ answers, step: idx + 1 });
      setInterlude(true);
      setToast({ key: Date.now(), xp: SETUP_XP.personality, label: 'Know yourself unlocked' });
      return;
    }
    if (idx === ITEMS.length - 1) {
      update({ answers, completedAt: new Date().toISOString() });
      setToast({ key: Date.now(), xp: SETUP_XP.interests, label: 'Curious mind unlocked' });
      return;
    }
    update({ answers });
    window.clearTimeout(advance.current);
    advance.current = window.setTimeout(() => update({ step: idx + 1 }), 180);
  }, [idx, item, progress.answers, update]);

  // Number keys 1–5 answer the current statement.
  useEffect(() => {
    if (done || interlude) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      const n = Number(e.key);
      if (n >= 1 && n <= 5) answer(n);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [answer, done, interlude]);

  function continueOn() {
    // Older accounts may have an intake but no target countries or workload: finish those first.
    const s = setupSections(user!, getStudentState(user!));
    if (intakeDone && s.goals && s.week) {
      refreshProfile(user!);
      navigate('/plan?welcome=1');
    } else {
      navigate('/onboarding');
    }
  }

  if (done) {
    const riasec = scoreRiasec(progress.answers);
    const ocean = scoreOcean(progress.answers);
    const top = hollandCode(riasec).split('').slice(0, 2) as RiasecType[];
    const caps = stretchCapsFor(ocean);
    const lf = loadFactorFor(ocean);
    const ss = setupSections(user!, getStudentState(user!));
    const planReady = ss.goals && ss.week;
    return (
      <div className="text-center">
        {toast && <XpToast key={toast.key} xp={toast.xp} label={toast.label} />}
        <p className="eyebrow text-leaf-600 animate-fade-up">About you · done</p>
        <h1 className="font-jakarta font-extrabold text-ink text-[30px] sm:text-[36px] leading-tight mt-2 animate-fade-up">
          You're a {VIBE[top[0]].name} + {VIBE[top[1]].name}
        </h1>
        <div className="grid sm:grid-cols-2 gap-4 mt-8 text-left stagger">
          {top.map((t) => (
            <div key={t} className="bg-canvas rounded-3xl border border-line p-5 lift">
              <span className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-[26px]">{VIBE[t].icon}</span>
              </span>
              <p className="font-jakarta font-bold text-ink text-[17px] mt-3">{VIBE[t].name}</p>
              <p className="text-[13.5px] text-slate-600 mt-1">{VIBE[t].line}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 bg-leaf-50 border border-leaf-200 rounded-3xl p-5 text-left animate-fade-up">
          <p className="font-jakarta font-bold text-ink text-[15.5px] flex items-center gap-2">
            <span className="material-symbols-outlined text-leaf-600 text-[20px]">tune</span>
            How this shapes your plan
          </p>
          <ul className="mt-2 space-y-1.5 text-[13.5px] text-slate-700">
            <li>• Subjects that match these interests rank higher.</li>
            <li>• Your weekly study budget is set at ×{lf} for how you handle workload{lf > 1 ? ' (you can carry a bit more)' : lf < 1 ? ' (kept a bit lighter)' : ''}.</li>
            <li>• If your plan includes APs: up to {caps.maxHard} demanding AP{caps.maxHard === 1 ? '' : 's'} at once, {caps.maxTotal} in total.</li>
          </ul>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button onClick={continueOn} className={btnPrimary + ' text-[15px] px-8 animate-glow'}>
            {intakeDone && planReady ? 'See my plan' : 'Next: your studies'}
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
          <button
            className={btnSecondary}
            onClick={() => {
              // Keep the targets/workload layer; only the answers are retaken.
              const fresh = { ...freshProgress(user!.id), career: progress.career };
              setProgress(fresh);
              saveProgress(fresh);
            }}
          >
            Retake
          </button>
        </div>
      </div>
    );
  }

  if (interlude) {
    return (
      <div className="text-center">
        {toast && <XpToast key={toast.key} xp={toast.xp} label={toast.label} />}
        <div className="mx-auto w-20 h-20 rounded-full bg-violet-600 flex items-center justify-center animate-pop">
          <span className="material-symbols-outlined text-white text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
        </div>
        <p className="eyebrow text-violet-700 mt-6">Part 1 of 2 done</p>
        <h1 className="font-jakarta font-extrabold text-ink text-[30px] leading-tight mt-2">Nice. Now, what do you enjoy?</h1>
        <p className="text-[15px] text-slate-600 mt-3 max-w-md mx-auto">
          {RIASEC_ITEMS.length} quick ones. Tell us how much you'd like each activity. It doesn't matter if you've never tried it.
        </p>
        <button onClick={() => setInterlude(false)} className={btnPrimary + ' mt-8 text-[15px] px-8'}>
          Keep going
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
    );
  }

  const scale = item.section === 'personality' ? QUIZ_AGREE : QUIZ_LIKE;
  const inSection = item.section === 'personality' ? idx : idx - SPLIT;
  const sectionLen = item.section === 'personality' ? SPLIT : ITEMS.length - SPLIT;
  const pct = Math.round((Object.keys(progress.answers).length / ITEMS.length) * 100);

  return (
    <div>
      {toast && <XpToast key={toast.key} xp={toast.xp} label={toast.label} />}
      <div className="flex items-center justify-between gap-4 mb-3">
        <p className="eyebrow text-leaf-600">
          About you · part {item.section === 'personality' ? 1 : 2} of 2 · {inSection + 1}/{sectionLen}
        </p>
        <span className="text-[12px] font-semibold text-slate-500">{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-line overflow-hidden mb-8">
        <div className="h-full bg-leaf-500 fill-anim" style={{ width: `${pct}%` }} />
      </div>

      <div key={item.id} className={'bg-canvas rounded-3xl border border-line p-6 sm:p-10 ' + (dir === 'next' ? 'animate-slide-right' : 'animate-slide-left')}>
        <p className="text-[13px] font-semibold text-slate-500">
          {item.section === 'personality' ? 'How much is this like you?' : 'How much would you enjoy this?'}
        </p>
        <h1 className="font-jakarta font-extrabold text-ink text-[24px] sm:text-[30px] leading-snug mt-2 min-h-[2.6em]">
          {item.text}
        </h1>
        {item.hint && (
          <p className="text-[13px] text-slate-500 mt-1 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">lightbulb</span>
            {item.hint}
          </p>
        )}

        <div className="grid grid-cols-5 gap-2 sm:gap-3 mt-8">
          {scale.map((opt, i) => {
            const value = i + 1;
            const on = progress.answers[item.id] === value;
            return (
              <button
                key={opt.label}
                type="button"
                aria-pressed={on}
                onClick={() => answer(value)}
                className={
                  'group flex flex-col items-center gap-1.5 rounded-2xl border-2 px-1 py-3 sm:py-4 transition-all duration-150 active:scale-95 ' +
                  (on ? 'border-leaf-500 bg-leaf-50 shadow-glow' : 'border-line-2 hover:border-leaf-300 hover:-translate-y-0.5')
                }
              >
                <span className="text-[26px] sm:text-[32px] leading-none transition-transform group-hover:scale-110" aria-hidden>{opt.emoji}</span>
                <span className={'text-[11px] sm:text-[12px] font-semibold leading-tight text-center ' + (on ? 'text-leaf-700' : 'text-slate-600')}>{opt.label}</span>
              </button>
            );
          })}
        </div>
        <p className="hidden sm:block text-[11.5px] text-slate-400 mt-4 text-center">Tip: press 1–5 on your keyboard</p>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          disabled={idx === 0}
          onClick={() => { window.clearTimeout(advance.current); setDir('back'); update({ step: idx - 1 }); }}
          className="text-[14px] font-semibold text-slate-500 hover:text-ink disabled:opacity-30"
        >
          ← Back
        </button>
        {progress.answers[item.id] && idx < ITEMS.length - 1 && (
          <button type="button" onClick={() => { window.clearTimeout(advance.current); setDir('next'); update({ step: idx + 1 }); }} className="text-[14px] font-semibold text-leaf-700">
            Next →
          </button>
        )}
      </div>

      <p className="mt-10 text-[11.5px] text-slate-500 leading-relaxed">
        No right or wrong answers. Part 1 uses a public-domain Big Five (IPIP) short form; part 2 uses RIASEC / Holland
        interest types. Not MBTI. Item set v1 is pending expert vetting.{' '}
        <Link to="/methodology" className="underline">Methodology</Link>.
      </p>
    </div>
  );
}
