import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import {
  LIKERT_AGREE,
  LIKERT_LIKE,
  MAJORS,
  OCEAN_ITEMS,
  RIASEC_ITEMS,
} from '../../data/questionnaire';
import { TOTAL_ITEMS, buildProfile } from '../../engine/profile';
import {
  getProgress,
  saveProfile,
  saveProgress,
  type CareerLayer,
  type QuestionnaireProgress,
} from '../../store/db';
import { ChipSelect, ErrorNote, Field, TextInput, btnPrimary, btnSecondary } from '../../components/ui/Field';
import { PageHeader, Panel } from '../dashboard/widgets';

const PAGES = [
  { layer: 'Temperament & load', items: OCEAN_ITEMS.slice(0, 10), scale: LIKERT_AGREE, prompt: 'How accurately does each statement describe you?' },
  { layer: 'Temperament & load', items: OCEAN_ITEMS.slice(10), scale: LIKERT_AGREE, prompt: 'How accurately does each statement describe you?' },
  { layer: 'Interests → direction', items: RIASEC_ITEMS.slice(0, 9), scale: LIKERT_LIKE, prompt: 'How much would you enjoy doing each of these?' },
  { layer: 'Interests → direction', items: RIASEC_ITEMS.slice(9), scale: LIKERT_LIKE, prompt: 'How much would you enjoy doing each of these?' },
];
const CAREER_STEP = PAGES.length;

/** Weeks from today to the first Monday of May (AP exam season). */
function weeksToNextMay() {
  const now = new Date();
  let may = new Date(now.getFullYear(), 4, 5);
  if (may.getTime() - now.getTime() < 4 * 7 * 864e5) may = new Date(now.getFullYear() + 1, 4, 5);
  return Math.round((may.getTime() - now.getTime()) / (7 * 864e5));
}

export function Questionnaire() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const intakeMajors = user!.india?.targetMajors ?? user!.sgus?.targetMajors ?? [];
  const intakeColleges = user!.india?.targetColleges ?? user!.sgus?.targetColleges ?? [];

  const [progress, setProgress] = useState<QuestionnaireProgress>(() => {
    const now = new Date().toISOString();
    return (
      getProgress(user!.id) ?? {
        userId: user!.id,
        answers: {},
        career: {},
        step: 0,
        startedAt: now,
        updatedAt: now,
      }
    );
  });
  const [error, setError] = useState<string | null>(null);

  const career: CareerLayer = {
    targetMajors: progress.career.targetMajors ?? intakeMajors,
    targetColleges: progress.career.targetColleges ?? intakeColleges,
    currentLoadHours: progress.career.currentLoadHours ?? 0,
    extraHoursPerWeek: progress.career.extraHoursPerWeek ?? 6,
    weeksToExam: progress.career.weeksToExam ?? weeksToNextMay(),
  };

  function update(next: Partial<QuestionnaireProgress>) {
    const merged = { ...progress, ...next };
    setProgress(merged);
    saveProgress(merged); // progress save on every change → resume later
  }

  const intakeDone = user!.segment === 'india' ? !!user!.india : !!user!.sgus;
  if (!intakeDone) {
    return (
      <>
        <PageHeader eyebrow="Questionnaire" title="Finish onboarding first" subtitle="The questionnaire builds on your board / subjects and targets." />
        <Link to="/onboarding" className={btnPrimary}>Go to onboarding</Link>
      </>
    );
  }

  if (progress.completedAt) {
    return (
      <>
        <PageHeader eyebrow="Questionnaire" title="Questionnaire complete" subtitle={`Completed ${new Date(progress.completedAt).toLocaleDateString()}. Your plan uses these answers.`} />
        <div className="flex flex-wrap gap-3">
          <Link to="/plan" className={btnPrimary}>View my plan<span className="material-symbols-outlined text-[18px]">arrow_forward</span></Link>
          <button
            className={btnSecondary}
            onClick={() => update({ completedAt: undefined, step: 0 })}
          >
            Retake questionnaire
          </button>
        </div>
      </>
    );
  }

  const answered = Object.keys(progress.answers).length;
  const pct = Math.round(((answered + (progress.step === CAREER_STEP ? 1 : 0)) / (TOTAL_ITEMS + 1)) * 100);
  const page = PAGES[progress.step];

  function next() {
    setError(null);
    if (page && page.items.some((i) => !progress.answers[i.id])) {
      setError('Answer every statement on this page to continue. There are no right answers.');
      return;
    }
    update({ step: progress.step + 1 });
    window.scrollTo({ top: 0 });
  }

  function finish() {
    if (!career.targetMajors.length) return setError('Pick at least one target major (or Undecided).');
    const profile = buildProfile(progress.answers, career);
    saveProfile(user!.id, profile);
    // Layer 3 is the source of truth for targets, so write it back to the intake.
    if (user!.india) updateUser({ india: { ...user!.india, targetMajors: career.targetMajors, targetColleges: career.targetColleges } });
    if (user!.sgus) updateUser({ sgus: { ...user!.sgus, targetMajors: career.targetMajors, targetColleges: career.targetColleges } });
    update({ completedAt: new Date().toISOString(), career });
    navigate('/plan');
  }

  return (
    <>
      <PageHeader
        eyebrow={`Step 2 of 3 · Questionnaire · Layer ${progress.step < 2 ? 1 : progress.step < CAREER_STEP ? 2 : 3} of 3`}
        title={page ? page.layer : 'Targets & constraints'}
        subtitle="About 8 minutes. Your answers save as you go, so you can leave and resume."
      />

      <div className="max-w-3xl">
        <div className="h-1.5 rounded-full bg-line mb-6 overflow-hidden">
          <div className="h-full bg-bronze-500 transition-all" style={{ width: `${pct}%` }} />
        </div>

        {error && <div className="mb-4"><ErrorNote>{error}</ErrorNote></div>}

        {page ? (
          <Panel title={page.prompt}>
            <ol className="space-y-5">
              {page.items.map((item) => (
                <li key={item.id}>
                  <p className="text-[14px] text-ink mb-2">{item.text}</p>
                  <div className="grid grid-cols-5 gap-1.5">
                    {page.scale.map((label, idx) => {
                      const value = idx + 1;
                      const on = progress.answers[item.id] === value;
                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => update({ answers: { ...progress.answers, [item.id]: value } })}
                          className={
                            'text-[11px] leading-tight px-1.5 py-2 rounded-sm border transition-colors ' +
                            (on ? 'bg-ink text-paper border-ink' : 'bg-canvas text-slate-600 border-line-2 hover:border-bronze-300')
                          }
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </li>
              ))}
            </ol>
          </Panel>
        ) : (
          <Panel title="What you're aiming for, and what you already carry">
            <div className="space-y-5">
              <div>
                <p className="text-[12px] font-medium text-slate-700 mb-2">Target majors (up to 3)</p>
                <ChipSelect
                  options={MAJORS.map((m) => m.name)}
                  max={3}
                  value={career.targetMajors}
                  onChange={(v) => update({ career: { ...career, targetMajors: v } })}
                />
              </div>
              <Field label="Target colleges" hint="Comma-separated. Optional.">
                <TextInput
                  value={career.targetColleges.join(', ')}
                  onChange={(e) => update({ career: { ...career, targetColleges: e.target.value.split(',').map((s) => s.trimStart()) } })}
                />
              </Field>
              <Field label="Hours per week already committed outside school" hint="Coaching (e.g. JEE/NEET), tuition, jobs. Not sport; that is asked separately.">
                <TextInput
                  type="number"
                  min={0}
                  value={career.currentLoadHours}
                  onChange={(e) => update({ career: { ...career, currentLoadHours: Number(e.target.value) } })}
                />
              </Field>
              {user!.segment === 'india' ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Extra hours per week you could give to APs" hint="Be realistic. The plan fits inside this.">
                    <TextInput
                      type="number"
                      min={1}
                      max={25}
                      value={career.extraHoursPerWeek}
                      onChange={(e) => update({ career: { ...career, extraHoursPerWeek: Number(e.target.value) } })}
                    />
                  </Field>
                  <Field label="Weeks until your AP exam session" hint="Defaults to the next May session.">
                    <TextInput
                      type="number"
                      min={4}
                      max={80}
                      value={career.weeksToExam}
                      onChange={(e) => update({ career: { ...career, weeksToExam: Number(e.target.value) } })}
                    />
                  </Field>
                </div>
              ) : (
                <p className="text-[13px] text-slate-600">
                  Training: <span className="text-ink font-medium">{user!.sgus!.isAthlete ? `${user!.sgus!.trainingHoursPerWeek} hrs/week` : 'not an athlete'}</span>{' '}
                  (<Link to="/onboarding" className="underline">edit in onboarding</Link>)
                </p>
              )}
            </div>
          </Panel>
        )}

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            disabled={progress.step === 0}
            onClick={() => update({ step: progress.step - 1 })}
            className="text-[13.5px] font-medium text-slate-600 hover:text-ink disabled:opacity-40"
          >
            ← Back
          </button>
          {page ? (
            <button type="button" onClick={next} className={btnPrimary}>
              Continue<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          ) : (
            <button type="button" onClick={finish} className={btnPrimary}>
              See my plan<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          )}
        </div>

        <p className="mt-8 text-[11.5px] text-slate-500 leading-relaxed">
          Layer 1 uses a public-domain Big Five (IPIP) short form. Layer 2 uses RIASEC / Holland interest
          types. This is not MBTI. Item set v1 is pending expert vetting.{' '}
          <Link to="/methodology" className="underline">Methodology</Link>.
        </p>
      </div>
    </>
  );
}
