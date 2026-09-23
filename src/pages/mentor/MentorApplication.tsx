import { useState, type FormEvent } from 'react';
import { useAuth } from '../../auth/AuthContext';
import {
  getMentorApplication,
  isVetted,
  saveMentorApplication,
  type MentorApplication as App,
  type VettingStage,
} from '../../store/db';
import { Checkbox, ErrorNote, Field, TextArea, TextInput, btnPrimary, btnSmall } from '../../components/ui/Field';
import { PageHeader, Panel } from '../dashboard/widgets';

const STAGES: { key: VettingStage; title: string; detail: string }[] = [
  { key: 'application', title: 'Application', detail: 'Your university, results, and the subjects you can mentor.' },
  { key: 'subjectScreen', title: 'Subject screen', detail: 'A short subject-knowledge interview with the Atrium team.' },
  { key: 'teachingDemo', title: 'Teaching demo', detail: 'A 20-minute mock consult with a reviewer playing the student.' },
  { key: 'safeguarding', title: 'Safeguarding checks', detail: 'Code of conduct, safeguarding training, and a background check.' },
];

const STATUS_LABEL = { pending: 'Not started', submitted: 'Under review', passed: 'Passed' } as const;

export function MentorApplication() {
  const { user, updateUser } = useAuth();
  const [app, setApp] = useState<App>(() => getMentorApplication(user!.id));
  const [headline, setHeadline] = useState(user!.headline);
  const [subjects, setSubjects] = useState(user!.subjects.join(', '));
  const [athlete, setAthlete] = useState(!!user!.athleteMentor);
  const [conduct, setConduct] = useState(!!app.codeOfConductAt);
  const [training, setTraining] = useState(!!app.safeguardingTrainingAt);
  const [error, setError] = useState<string | null>(null);

  function persist(next: App) {
    setApp(next);
    saveMentorApplication(next);
  }

  function submitApplication(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const list = subjects.split(',').map((s) => s.trim()).filter(Boolean);
    if (!headline.trim() || !app.results.trim() || !list.length) return setError('University, results and subjects are required.');
    updateUser({ headline: headline.trim(), subjects: list, athleteMentor: athlete });
    persist({ ...app, stages: { ...app.stages, application: 'submitted' } });
  }

  function submitSafeguarding() {
    setError(null);
    if (!conduct || !training) return setError('Agree to the code of conduct and complete the training first.');
    const now = new Date().toISOString();
    persist({ ...app, codeOfConductAt: now, safeguardingTrainingAt: now, stages: { ...app.stages, safeguarding: 'submitted' } });
  }

  function markPassed(stage: VettingStage) {
    persist({ ...app, stages: { ...app.stages, [stage]: 'passed' } });
  }

  return (
    <>
      <PageHeader
        eyebrow="Mentor application"
        title={isVetted(app) ? 'You are a vetted Atrium mentor' : 'Becoming a founding mentor'}
        subtitle="Every mentor passes all four stages before being matched with a student. No exceptions for minors."
      />

      {error && <div className="mb-4 max-w-3xl"><ErrorNote>{error}</ErrorNote></div>}

      <div className="space-y-4 max-w-3xl">
        {STAGES.map((s, i) => {
          const status = app.stages[s.key];
          return (
            <Panel
              key={s.key}
              title={`${String(i + 1).padStart(2, '0')} · ${s.title}`}
              action={
                <span
                  className={
                    'text-[11px] font-medium border rounded-full px-2 py-0.5 ' +
                    (status === 'passed'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : status === 'submitted'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-slate-100 text-slate-600 border-line-2')
                  }
                >
                  {STATUS_LABEL[status]}
                </span>
              }
            >
              <p className="text-[13px] text-slate-600 mb-4">{s.detail}</p>

              {s.key === 'application' && status === 'pending' && (
                <form onSubmit={submitApplication} className="space-y-4">
                  <Field label="University & class year">
                    <TextInput value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="e.g. IIT Bombay '26 · CS, or NUS '25 · Economics" />
                  </Field>
                  <Field label="Relevant results" hint="e.g. AP Calc BC 5, AP Chem 5; CBSE PCM 96%; IB HL Econ 7">
                    <TextInput value={app.results} onChange={(e) => setApp({ ...app, results: e.target.value })} />
                  </Field>
                  <Field label="Subjects you can mentor" hint="Comma-separated. These drive matching.">
                    <TextInput value={subjects} onChange={(e) => setSubjects(e.target.value)} placeholder="AP Calculus AB, AP Chemistry, CBSE PCM" />
                  </Field>
                  <Field label="Why do you want to mentor?">
                    <TextArea value={app.motivation} onChange={(e) => setApp({ ...app, motivation: e.target.value })} />
                  </Field>
                  <Checkbox checked={athlete} onChange={setAthlete}>
                    I competed seriously while studying, so I can mentor student-athletes.
                  </Checkbox>
                  <button type="submit" className={btnPrimary}>Submit application</button>
                </form>
              )}

              {s.key === 'safeguarding' && status === 'pending' && (
                <div className="space-y-3">
                  <Checkbox checked={conduct} onChange={setConduct}>
                    I agree to the mentor code of conduct: all contact stays on Atrium, no personal contact details,
                    no off-platform meetings, and I report any concern within 24 hours.
                  </Checkbox>
                  <Checkbox checked={training} onChange={setTraining}>
                    I have completed the safeguarding training module (recognising and reporting concerns, boundaries
                    with minors).
                  </Checkbox>
                  <p className="text-[12px] text-slate-500">The background check is started by the Atrium team after this step.</p>
                  <button type="button" onClick={submitSafeguarding} className={btnPrimary}>Submit safeguarding step</button>
                </div>
              )}

              {(s.key === 'subjectScreen' || s.key === 'teachingDemo') && status === 'pending' && (
                <p className="text-[12.5px] text-slate-500">
                  {app.stages.application === 'pending' ? 'Unlocks after you submit your application.' : 'The Atrium team will email you to schedule this.'}
                </p>
              )}

              {status !== 'passed' && (s.key !== 'subjectScreen' && s.key !== 'teachingDemo' ? status === 'submitted' : app.stages.application !== 'pending') && (
                <div className="mt-4 pt-3 border-t border-dashed border-line-2 flex items-center justify-between gap-3">
                  <span className="text-[11.5px] text-slate-400">Prototype only: stands in for the ops reviewer.</span>
                  <button type="button" onClick={() => markPassed(s.key)} className={btnSmall}>Mark as passed</button>
                </div>
              )}
            </Panel>
          );
        })}
      </div>
    </>
  );
}
