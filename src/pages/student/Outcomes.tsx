import { useState, type FormEvent } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { getStudentState } from '../../engine/studentState';
import { listOutcomes, makeId, saveOutcome } from '../../store/db';
import { Checkbox, ErrorNote, Field, Select, TextArea, TextInput, btnPrimary } from '../../components/ui/Field';
import { PageHeader, Panel } from '../dashboard/widgets';

/** Planned net-new hrs/week per subject, so reports can compare predicted vs actual. */
function predictions(state: ReturnType<typeof getStudentState>): Record<string, number> {
  const out: Record<string, number> = {};
  state.indiaPlan?.items.forEach((i) => (out[i.course.name] = i.netNewPerWeek));
  state.loadPlan?.items.forEach((i) => (out[`${i.name} ${i.to}`] = i.hours));
  return out;
}

export function Outcomes() {
  const { user } = useAuth();
  const state = getStudentState(user!);
  const predicted = predictions(state);
  const planned = state.indiaPlan
    ? state.indiaPlan.recommended.map((i) => i.course.name)
    : state.loadPlan?.items.map((i) => `${i.name} ${i.to}`) ?? [];
  const options = [...new Set([...planned, ...Object.keys(predicted)])];

  const [, force] = useState(0);
  const reports = listOutcomes((o) => o.studentId === user!.id);
  const [subject, setSubject] = useState(options[0] ?? '');
  const [session, setSession] = useState(`May ${new Date().getFullYear() + (new Date().getMonth() > 4 ? 1 : 0)}`);
  const [actual, setActual] = useState('');
  const [score, setScore] = useState('');
  const [notes, setNotes] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!subject.trim() || !actual) return setError('Subject and actual hours are required.');
    saveOutcome({
      id: makeId('o'),
      studentId: user!.id,
      reporter: 'student',
      subject: subject.trim(),
      examSession: session.trim(),
      predictedHoursPerWeek: predicted[subject] ?? null,
      actualHoursPerWeek: Number(actual),
      score: score.trim(),
      notes: notes.trim(),
      consentToResearch: consent,
      createdAt: new Date().toISOString(),
    });
    setActual('');
    setScore('');
    setNotes('');
    setSaved(true);
    force((n) => n + 1);
  }

  return (
    <>
      <PageHeader
        eyebrow="Outcome loop"
        title="How did it actually go?"
        subtitle="Tell us the real load and result. Each report makes the next student's plan more accurate."
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <form onSubmit={submit} className="lg:col-span-2 space-y-4">
          <Panel title="Post-exam / post-decision report">
            <div className="space-y-4">
              {error && <ErrorNote>{error}</ErrorNote>}
              {saved && <p className="text-[13px] text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-sm px-3 py-2">Thanks, your report is saved.</p>}
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Subject / AP">
                  {options.length ? (
                    <Select value={subject} onChange={(e) => setSubject(e.target.value)}>
                      {options.map((o) => <option key={o}>{o}</option>)}
                    </Select>
                  ) : (
                    <TextInput value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. AP Calculus AB" />
                  )}
                </Field>
                <Field label="Exam session / term">
                  <TextInput value={session} onChange={(e) => setSession(e.target.value)} />
                </Field>
                <Field
                  label="Actual extra hours per week"
                  hint={predicted[subject] !== undefined ? `The plan predicted ~${predicted[subject]} hrs/week.` : undefined}
                >
                  <TextInput type="number" min={0} step={0.5} value={actual} onChange={(e) => setActual(e.target.value)} />
                </Field>
                <Field label="Score / result" hint="e.g. 5, 4, HL 6, or 'not sat yet'">
                  <TextInput value={score} onChange={(e) => setScore(e.target.value)} />
                </Field>
              </div>
              <Field label="What was harder or easier than the plan said?">
                <TextArea value={notes} onChange={(e) => setNotes(e.target.value)} />
              </Field>
              <Checkbox checked={consent} onChange={setConsent}>
                Atrium may use this result, anonymised, to improve the overlap graph and for published research.
                Optional. You can report without it.
              </Checkbox>
              <button type="submit" className={btnPrimary}>Submit report</button>
            </div>
          </Panel>
        </form>

        <Panel title="Your reports">
          {reports.length === 0 ? (
            <p className="text-[13px] text-slate-500">Nothing reported yet.</p>
          ) : (
            <ul className="space-y-3">
              {reports.map((r) => (
                <li key={r.id} className="border-b border-line pb-3 last:border-0 last:pb-0">
                  <p className="text-[13.5px] font-medium text-ink">{r.subject}</p>
                  <p className="text-[12px] text-slate-500">{r.examSession}{r.score ? ` · result ${r.score}` : ''}</p>
                  <p className="text-[12px] text-slate-600 mt-1">
                    Predicted {r.predictedHoursPerWeek ?? '—'} → actual {r.actualHoursPerWeek} hrs/wk
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
