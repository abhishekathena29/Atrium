import { useState, type FormEvent } from 'react';
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
import { PageHeader, Panel } from '../dashboard/widgets';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const ELECTIVES: BoardElective[] = ['Computer Science', 'Informatics Practices', 'Economics', 'Psychology', 'Physical Education', 'Other / none'];
const majorNames = MAJORS.map((m) => m.name);

function splitList(s: string) {
  return s.split(',').map((x) => x.trim()).filter(Boolean);
}

export function Onboarding() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [segment, setSegment] = useState<Segment>(user!.segment);
  const [error, setError] = useState<string | null>(null);

  // India fields
  const [india, setIndia] = useState<IndiaIntake>(
    user!.india ?? { board: 'CBSE', stream: 'Science (PCM)', grade: '11', elective: 'Computer Science', targetMajors: [], targetColleges: [] },
  );
  // SG/US fields
  const [sgus, setSgus] = useState<SgUsIntake>(
    user!.sgus ?? {
      curriculum: 'IB',
      grade: '11',
      courses: [],
      targetMajors: [],
      targetColleges: [],
      isAthlete: false,
      sport: '',
      trainingHoursPerWeek: 0,
      peakSeasonMonths: [],
    },
  );
  const [colleges, setColleges] = useState(
    (segment === 'india' ? india.targetColleges : sgus.targetColleges).join(', '),
  );

  function toggleCourse(name: string) {
    const has = sgus.courses.find((c) => c.name === name);
    setSgus({
      ...sgus,
      courses: has
        ? sgus.courses.filter((c) => c.name !== name)
        : [...sgus.courses, { name, level: LEVELS[sgus.curriculum][0] }],
    });
  }

  function setLevel(name: string, level: CourseChoice['level']) {
    setSgus({ ...sgus, courses: sgus.courses.map((c) => (c.name === name ? { ...c, level } : c)) });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const targetColleges = splitList(colleges);
    if (segment === 'india') {
      if (!india.targetMajors.length) return setError('Pick at least one target major (or Undecided).');
      updateUser({ segment, india: { ...india, targetColleges }, headline: `Class ${india.grade} · ${india.board} ${india.stream}` });
    } else {
      if (!sgus.targetMajors.length) return setError('Pick at least one target major (or Undecided).');
      if (sgus.courses.length < 3) return setError('Add the subjects you are taking or considering (at least 3).');
      if (sgus.isAthlete && sgus.trainingHoursPerWeek <= 0) return setError('Enter your weekly training hours.');
      updateUser({
        segment,
        sgus: { ...sgus, targetColleges, trainingHoursPerWeek: sgus.isAthlete ? sgus.trainingHoursPerWeek : 0 },
        headline: `Grade ${sgus.grade} · ${sgus.curriculum}${sgus.isAthlete ? ' · athlete' : ''}`,
      });
    }
    navigate('/questionnaire');
  }

  return (
    <>
      <PageHeader
        eyebrow="Step 1 of 3 · Onboarding"
        title="Tell us where you are now"
        subtitle="This, plus the questionnaire, is all the plan needs. You can change it later."
      />

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        {error && <ErrorNote>{error}</ErrorNote>}

        <Panel title="Your track">
          <div className="grid sm:grid-cols-2 gap-3">
            {(['india', 'sgus'] as Segment[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSegment(s)}
                className={
                  'text-left rounded-md border p-4 transition-colors ' +
                  (segment === s ? 'border-bronze-400 bg-accent-soft/60 ring-1 ring-bronze-300' : 'border-line-2 bg-canvas hover:border-bronze-300')
                }
              >
                <p className="font-serif text-ink text-[17px]">{s === 'india' ? 'India' : 'Singapore · US track'}</p>
                <p className="text-[12px] text-slate-500 mt-1 leading-snug">
                  {s === 'india'
                    ? 'Which APs to self-study, ranked by overlap with your board syllabus.'
                    : 'IB, A-Level or AP course load, capped by the time you actually have (incl. training).'}
                </p>
              </button>
            ))}
          </div>
        </Panel>

        {segment === 'india' ? (
          <Panel title="Board & stream">
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
              <p className="mt-4 text-[12.5px] text-amber-800 bg-amber-50 border border-amber-200 rounded-sm px-3 py-2">
                We've only mapped CBSE Science so far. You can still continue. Your profile will be saved and
                used as soon as your board and stream are mapped.
              </p>
            )}
          </Panel>
        ) : (
          <>
            <Panel title="Curriculum & subjects">
              <div className="grid sm:grid-cols-2 gap-4 mb-5">
                <Field label="Curriculum">
                  <Select
                    value={sgus.curriculum}
                    onChange={(e) => setSgus({ ...sgus, curriculum: e.target.value as Curriculum, courses: [] })}
                  >
                    {['IB', 'A-Level', 'AP'].map((c) => <option key={c}>{c}</option>)}
                  </Select>
                </Field>
                <Field label="Grade">
                  <Select value={sgus.grade} onChange={(e) => setSgus({ ...sgus, grade: e.target.value as SgUsIntake['grade'] })}>
                    {['9', '10', '11', '12'].map((g) => <option key={g}>{g}</option>)}
                  </Select>
                </Field>
              </div>
              <p className="text-[12px] font-medium text-slate-700 mb-2">
                Subjects you're taking or considering{sgus.curriculum === 'IB' ? ' (usually 6, with 3 or 4 at HL)' : sgus.curriculum === 'A-Level' ? ' (usually 3 or 4)' : ''}
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
                <div className="mt-4 divide-y divide-line border border-line rounded-sm">
                  {sgus.courses.map((c) => (
                    <div key={c.name} className="flex items-center justify-between px-3 py-2">
                      <span className="text-[13.5px] text-ink">{c.name}</span>
                      <div className="flex gap-1">
                        {LEVELS[sgus.curriculum].map((l) => (
                          <button
                            key={l}
                            type="button"
                            onClick={() => setLevel(c.name, l)}
                            className={'text-[12px] px-2 py-0.5 rounded-sm border ' + (c.level === l ? 'bg-ink text-paper border-ink' : 'border-line-2 text-slate-600')}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            <Panel title="Training (student-athletes)">
              <Checkbox checked={sgus.isAthlete} onChange={(v) => setSgus({ ...sgus, isAthlete: v })}>
                I train competitively. Use my training hours to set my load ceiling.
              </Checkbox>
              {sgus.isAthlete && (
                <div className="mt-4 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Sport">
                      <TextInput value={sgus.sport} placeholder="e.g. Swimming (national squad)" onChange={(e) => setSgus({ ...sgus, sport: e.target.value })} />
                    </Field>
                    <Field label="Training hours per week" hint="Include travel to training and competitions.">
                      <TextInput
                        type="number"
                        min={0}
                        max={40}
                        value={sgus.trainingHoursPerWeek || ''}
                        onChange={(e) => setSgus({ ...sgus, trainingHoursPerWeek: Number(e.target.value) })}
                      />
                    </Field>
                  </div>
                  <div>
                    <p className="text-[12px] font-medium text-slate-700 mb-2">Peak competition months</p>
                    <ChipSelect
                      options={MONTHS}
                      value={sgus.peakSeasonMonths.map((m) => MONTHS[m - 1])}
                      onChange={(v) => setSgus({ ...sgus, peakSeasonMonths: v.map((m) => MONTHS.indexOf(m) + 1) })}
                    />
                  </div>
                </div>
              )}
            </Panel>
          </>
        )}

        <Panel title="Targets">
          <div className="space-y-4">
            <div>
              <p className="text-[12px] font-medium text-slate-700 mb-2">Target majors (up to 3)</p>
              <ChipSelect
                options={majorNames}
                max={3}
                value={segment === 'india' ? india.targetMajors : sgus.targetMajors}
                onChange={(v) => (segment === 'india' ? setIndia({ ...india, targetMajors: v }) : setSgus({ ...sgus, targetMajors: v }))}
              />
            </div>
            <Field label="Target colleges" hint="Comma-separated. Optional.">
              <TextInput value={colleges} placeholder="e.g. Georgia Tech, UIUC, Purdue" onChange={(e) => setColleges(e.target.value)} />
            </Field>
          </div>
        </Panel>

        <button type="submit" className={btnPrimary}>
          Save and continue to the questionnaire
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </form>
    </>
  );
}
