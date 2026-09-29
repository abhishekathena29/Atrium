import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import type {
  BoardElective,
  CourseChoice,
  Curriculum,
  IndiaIntake,
  Segment,
  SgUsIntake,
} from '../../auth/types';
import { MAJORS } from '../../data/questionnaire';
import { isMapped } from '../../data/overlapGraph';
import { CATALOG, LEVELS } from '../../engine/courseLoad';
import { ChipSelect, Checkbox, ErrorNote, Field, Select, TextInput, btnPrimary } from '../../components/ui/Field';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const ELECTIVES: BoardElective[] = ['Computer Science', 'Informatics Practices', 'Economics', 'Psychology', 'Physical Education', 'Other / none'];
const majorNames = MAJORS.map((m) => m.name);
const SUB_STEPS = ['Your track', 'What you study', 'Where you’re aiming'];

function splitList(s: string) {
  return s.split(',').map((x) => x.trim()).filter(Boolean);
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-white rounded-3xl border border-line p-6 sm:p-8">{children}</div>;
}

/** "About you" wizard: track → what you study → targets. Then on to the questionnaire. */
export function Onboarding() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const editing = !!(user!.india || user!.sgus);
  const [step, setStep] = useState(0);
  const [segment, setSegment] = useState<Segment>(user!.segment);
  const [error, setError] = useState<string | null>(null);

  const [india, setIndia] = useState<IndiaIntake>(
    user!.india ?? { board: 'CBSE', stream: 'Science (PCM)', grade: '11', elective: 'Computer Science', targetMajors: [], targetColleges: [] },
  );
  const [sgus, setSgus] = useState<SgUsIntake>(
    user!.sgus ?? {
      curriculum: 'IB', grade: '11', courses: [], targetMajors: [], targetColleges: [],
      isAthlete: false, sport: '', trainingHoursPerWeek: 0, peakSeasonMonths: [],
    },
  );
  const [colleges, setColleges] = useState((user!.india?.targetColleges ?? user!.sgus?.targetColleges ?? []).join(', '));

  function toggleCourse(name: string) {
    const has = sgus.courses.find((c) => c.name === name);
    setSgus({
      ...sgus,
      courses: has ? sgus.courses.filter((c) => c.name !== name) : [...sgus.courses, { name, level: LEVELS[sgus.curriculum][0] }],
    });
  }

  function setLevel(name: string, level: CourseChoice['level']) {
    setSgus({ ...sgus, courses: sgus.courses.map((c) => (c.name === name ? { ...c, level } : c)) });
  }

  function validate(): string | null {
    if (step === 1 && segment === 'sgus') {
      if (sgus.courses.length < 3) return 'Pick the subjects you are taking or considering (at least 3).';
      if (sgus.isAthlete && sgus.trainingHoursPerWeek <= 0) return 'Enter your weekly training hours.';
    }
    if (step === 2) {
      const majors = segment === 'india' ? india.targetMajors : sgus.targetMajors;
      if (!majors.length) return 'Pick at least one target major, or choose Undecided.';
    }
    return null;
  }

  function next() {
    const problem = validate();
    setError(problem);
    if (problem) return;
    if (step < 2) {
      setStep(step + 1);
      window.scrollTo({ top: 0 });
      return;
    }
    const targetColleges = splitList(colleges);
    if (segment === 'india') {
      updateUser({ segment, india: { ...india, targetColleges }, headline: `Class ${india.grade} · ${india.board} ${india.stream}` });
    } else {
      updateUser({
        segment,
        sgus: { ...sgus, targetColleges, trainingHoursPerWeek: sgus.isAthlete ? sgus.trainingHoursPerWeek : 0 },
        headline: `Grade ${sgus.grade} · ${sgus.curriculum}${sgus.isAthlete ? ' · athlete' : ''}`,
      });
    }
    navigate(editing ? '/plan' : '/questionnaire');
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        {SUB_STEPS.map((s, i) => (
          <span key={s} className={'h-1.5 flex-1 rounded-full ' + (i <= step ? 'bg-leaf-500' : 'bg-line')} />
        ))}
      </div>
      <p className="text-[12.5px] font-bold uppercase tracking-widest text-leaf-600">
        {editing ? 'Edit profile' : 'About you'} · {step + 1} of 3
      </p>
      <h1 className="font-jakarta font-extrabold text-ink text-[28px] sm:text-[32px] leading-tight mt-1.5 mb-6">{SUB_STEPS[step]}</h1>

      {error && <div className="mb-4"><ErrorNote>{error}</ErrorNote></div>}

      {step === 0 && (
        <div className="grid sm:grid-cols-2 gap-4">
          {(['india', 'sgus'] as Segment[]).map((s) => {
            const on = segment === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSegment(s)}
                className={
                  'text-left rounded-3xl border-2 p-6 bg-white transition-colors ' +
                  (on ? (s === 'india' ? 'border-leaf-500 ring-4 ring-leaf-100' : 'border-sky-500 ring-4 ring-sky-100') : 'border-line hover:border-slate-300')
                }
              >
                <span className={'w-12 h-12 rounded-2xl flex items-center justify-center ' + (s === 'india' ? 'bg-leaf-100 text-leaf-700' : 'bg-sky-100 text-sky-700')}>
                  <span className="material-symbols-outlined text-[26px]">{s === 'india' ? 'menu_book' : 'public'}</span>
                </span>
                <p className="font-jakarta font-bold text-ink text-[19px] mt-4">{s === 'india' ? 'India' : 'Singapore · US track'}</p>
                <p className="text-[13.5px] text-slate-600 mt-1 leading-snug">
                  {s === 'india'
                    ? 'Choose which APs to self-study, ranked by how much your board syllabus already covers.'
                    : 'Choose an IB, A-Level or AP course load that fits the time you actually have, including training.'}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {step === 1 && segment === 'india' && (
        <Card>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Board">
              <Select value={india.board} onChange={(e) => setIndia({ ...india, board: e.target.value as IndiaIntake['board'] })}>
                {['CBSE', 'ICSE', 'State board', 'Other'].map((b) => <option key={b}>{b}</option>)}
              </Select>
            </Field>
            <Field label="Stream">
              <Select value={india.stream} onChange={(e) => setIndia({ ...india, stream: e.target.value as IndiaIntake['stream'] })}>
                {['Science (PCM)', 'Science (PCB)', 'Science (PCMB)', 'Commerce', 'Humanities'].map((s) => <option key={s}>{s}</option>)}
              </Select>
            </Field>
            <Field label="Class">
              <Select value={india.grade} onChange={(e) => setIndia({ ...india, grade: e.target.value as IndiaIntake['grade'] })}>
                {['9', '10', '11', '12'].map((g) => <option key={g}>{g}</option>)}
              </Select>
            </Field>
            <Field label="Fifth / elective subject">
              <Select value={india.elective} onChange={(e) => setIndia({ ...india, elective: e.target.value as BoardElective })}>
                {ELECTIVES.map((s) => <option key={s}>{s}</option>)}
              </Select>
            </Field>
          </div>
          {!isMapped(india) && (
            <p className="mt-5 text-[13px] text-amber-800 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
              We've only mapped CBSE Science so far. You can still continue. Your profile is saved and used as soon as
              your board and stream are mapped.
            </p>
          )}
        </Card>
      )}

      {step === 1 && segment === 'sgus' && (
        <div className="space-y-4">
          <Card>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <Field label="Curriculum">
                <Select value={sgus.curriculum} onChange={(e) => setSgus({ ...sgus, curriculum: e.target.value as Curriculum, courses: [] })}>
                  {['IB', 'A-Level', 'AP'].map((c) => <option key={c}>{c}</option>)}
                </Select>
              </Field>
              <Field label="Grade">
                <Select value={sgus.grade} onChange={(e) => setSgus({ ...sgus, grade: e.target.value as SgUsIntake['grade'] })}>
                  {['9', '10', '11', '12'].map((g) => <option key={g}>{g}</option>)}
                </Select>
              </Field>
            </div>
            <p className="text-[13px] font-semibold text-slate-700 mb-2">
              Subjects you're taking or considering
              <span className="font-normal text-slate-500">{sgus.curriculum === 'IB' ? ' (usually 6, with 3 or 4 at HL)' : sgus.curriculum === 'A-Level' ? ' (usually 3 or 4)' : ''}</span>
            </p>
            <ChipSelect
              options={CATALOG[sgus.curriculum].map((c) => c.name)}
              value={sgus.courses.map((c) => c.name)}
              onChange={(names) => {
                const added = names.find((n) => !sgus.courses.some((c) => c.name === n));
                const removed = sgus.courses.find((c) => !names.includes(c.name));
                if (added) toggleCourse(added);
                if (removed) toggleCourse(removed.name);
              }}
            />
            {sgus.courses.length > 0 && (
              <div className="mt-5 divide-y divide-line border border-line rounded-2xl">
                {sgus.courses.map((c) => (
                  <div key={c.name} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-[14px] text-ink">{c.name}</span>
                    <div className="flex gap-1">
                      {LEVELS[sgus.curriculum].map((l) => (
                        <button
                          key={l}
                          type="button"
                          onClick={() => setLevel(c.name, l)}
                          className={'text-[12px] font-semibold px-2.5 py-1 rounded-full border ' + (c.level === l ? 'bg-leaf-600 text-white border-leaf-600' : 'border-line-2 text-slate-600')}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <Checkbox checked={sgus.isAthlete} onChange={(v) => setSgus({ ...sgus, isAthlete: v })}>
              <span className="font-semibold text-ink">I train competitively.</span> Use my training hours to set my load ceiling.
            </Checkbox>
            {sgus.isAthlete && (
              <div className="mt-5 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Sport">
                    <TextInput value={sgus.sport} placeholder="e.g. Swimming (national squad)" onChange={(e) => setSgus({ ...sgus, sport: e.target.value })} />
                  </Field>
                  <Field label="Training hours per week" hint="Include travel to training and competitions.">
                    <TextInput type="number" min={0} max={40} value={sgus.trainingHoursPerWeek || ''} onChange={(e) => setSgus({ ...sgus, trainingHoursPerWeek: Number(e.target.value) })} />
                  </Field>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-slate-700 mb-2">Peak competition months</p>
                  <ChipSelect
                    options={MONTHS}
                    value={sgus.peakSeasonMonths.map((m) => MONTHS[m - 1])}
                    onChange={(v) => setSgus({ ...sgus, peakSeasonMonths: v.map((m) => MONTHS.indexOf(m) + 1) })}
                  />
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {step === 2 && (
        <Card>
          <p className="text-[13px] font-semibold text-slate-700 mb-2">Majors you're considering <span className="font-normal text-slate-500">(up to 3)</span></p>
          <ChipSelect
            options={majorNames}
            max={3}
            value={segment === 'india' ? india.targetMajors : sgus.targetMajors}
            onChange={(v) => (segment === 'india' ? setIndia({ ...india, targetMajors: v }) : setSgus({ ...sgus, targetMajors: v }))}
          />
          <div className="mt-6">
            <Field label="Dream colleges (optional)" hint="Comma-separated">
              <TextInput value={colleges} placeholder="e.g. Georgia Tech, UIUC, Purdue" onChange={(e) => setColleges(e.target.value)} />
            </Field>
          </div>
        </Card>
      )}

      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={() => { setError(null); setStep(step - 1); }}
          className={'text-[14px] font-semibold text-slate-500 hover:text-ink ' + (step === 0 ? 'invisible' : '')}
        >
          ← Back
        </button>
        <button type="button" onClick={next} className={btnPrimary + ' px-8'}>
          {step < 2 ? 'Continue' : editing ? 'Save changes' : 'Save & start questionnaire'}
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
