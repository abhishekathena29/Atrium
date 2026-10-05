import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import {
  COUNTRY_LABEL,
  CURRICULUM_LABEL,
  type BoardElective,
  type CourseChoice,
  type Curriculum,
  type IndiaIntake,
  type Segment,
  type SgUsIntake,
  type TargetCountry,
} from '../../auth/types';
import { MAJORS } from '../../data/questionnaire';
import { AP_COURSES, isMapped } from '../../data/overlapGraph';
import { DIFFICULTY_LABEL, HARD_AT } from '../../data/apInfo';
import { COUNTRY_GUIDE } from '../../data/countries';
import { ADDON_OPTIONS, CATALOG, LEVELS } from '../../engine/courseLoad';
import { careerFor, intakeOf, mayExamDate, refreshProfile, weeksToNextMay } from '../../engine/studentState';
import { SETUP_XP } from '../../engine/gamification';
import { XpToast } from '../../components/gamify/Gamify';
import { getProgress, saveProgress, type CareerLayer } from '../../store/db';
import { ChipSelect, Checkbox, ErrorNote, Field, TextInput, btnPrimary } from '../../components/ui/Field';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const ELECTIVES: BoardElective[] = ['Computer Science', 'Informatics Practices', 'Economics', 'Psychology', 'Physical Education', 'Other / none'];
const majorNames = MAJORS.map((m) => m.name);
const STEPS = ['Where you study', 'Your school subjects', 'APs on top', 'Where you’re aiming', 'Your week'] as const;
const COUNTRIES: TargetCountry[] = ['US', 'UK', 'Canada', 'Other'];

const LEVEL_HELP: Record<string, string> = {
  HL: 'Higher Level: deeper, more hours',
  SL: 'Standard Level: lighter',
  'A-Level': 'Full A-Level',
  AS: 'AS: first half of an A-Level',
  AP: 'AP class: college-level, ends in an AP exam',
  Honors: 'Honors: harder than standard, no AP exam',
  Standard: 'Regular class',
};

function splitList(s: string) {
  return s.split(',').map((x) => x.trim()).filter(Boolean);
}

function Card({ children }: { children: ReactNode }) {
  return <div className="bg-canvas rounded-3xl border border-line p-5 sm:p-7">{children}</div>;
}

function Question({ title, help, children }: { title: string; help?: string; children: ReactNode }) {
  return (
    <div>
      <p className="font-jakarta font-bold text-ink text-[16px]">{title}</p>
      {help && <p className="text-[13px] text-slate-500 mt-0.5 mb-3">{help}</p>}
      <div className={help ? '' : 'mt-3'}>{children}</div>
    </div>
  );
}

/** Big tappable option. Used instead of dropdowns so every choice is visible at once. */
function Choice({ on, onClick, icon, title, body, tone = 'leaf' }: {
  on: boolean;
  onClick: () => void;
  icon?: string;
  title: string;
  body?: string;
  tone?: 'leaf' | 'sky' | 'violet' | 'amber';
}) {
  const ring = { leaf: 'border-leaf-500 ring-leaf-100', sky: 'border-sky-500 ring-sky-100', violet: 'border-violet-500 ring-violet-100', amber: 'border-amber-500 ring-amber-100' }[tone];
  const chip = { leaf: 'bg-leaf-100 text-leaf-700', sky: 'bg-sky-100 text-sky-700', violet: 'bg-violet-100 text-violet-700', amber: 'bg-amber-100 text-amber-700' }[tone];
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={'text-left rounded-2xl border-2 p-4 bg-canvas lift active:scale-[0.98] ' + (on ? `${ring} ring-4` : 'border-line hover:border-slate-300')}
    >
      <span className="flex items-start gap-3">
        {icon && (
          <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${chip}`}>
            <span className="material-symbols-outlined text-[22px]">{icon}</span>
          </span>
        )}
        <span className="flex-1 min-w-0">
          <span className="block font-jakarta font-bold text-ink text-[15px]">{title}</span>
          {body && <span className="block text-[12.5px] text-slate-500 mt-0.5 leading-snug">{body}</span>}
        </span>
        {on && <span className="material-symbols-outlined text-leaf-600 text-[20px] animate-pop" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>}
      </span>
    </button>
  );
}

function Pills<T extends string>({ options, value, onChange, label = (o: T) => o }: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
  label?: (o: T) => string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={value === o}
          onClick={() => onChange(o)}
          className={'rounded-full px-4 py-2 text-[14px] font-semibold border-2 transition-all active:scale-95 ' + (value === o ? 'bg-leaf-600 border-leaf-600 text-white' : 'border-line-2 text-slate-700 hover:border-leaf-300')}
        >
          {label(o)}
        </button>
      ))}
    </div>
  );
}

function Hours({ label, help, value, onChange, max = 30 }: { label: string; help: string; value: number; onChange: (n: number) => void; max?: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-jakarta font-bold text-ink text-[15px]">{label}</p>
        <p className="font-jakarta font-extrabold text-leaf-700 text-[20px] tabular-nums">{value}<span className="text-[12px] font-semibold text-slate-500"> hrs/week</span></p>
      </div>
      <p className="text-[12.5px] text-slate-500 mb-2">{help}</p>
      <input type="range" min={0} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-leaf-500" />
    </div>
  );
}

/**
 * "Your studies": base curriculum first, then APs as a separate add-on, then goals (majors,
 * target countries) and how busy the week already is. Runs after the personality quiz.
 */
export function Onboarding() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const current = intakeOf(user!);
  const editing = !!current;
  // An unfinished wizard resumes from its saved draft; an edit starts from the saved intake.
  const [draft] = useState(() => (editing ? undefined : getProgress(user!.id)?.draft));
  const [step, setStep] = useState(() => (draft ? Math.min(draft.reached, STEPS.length - 1) : 0));
  const [reached, setReached] = useState(draft?.reached ?? 0);
  const [segment, setSegment] = useState<Segment>(draft?.segment ?? user!.segment);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ key: number; xp: number; label: string } | null>(null);

  const [india, setIndia] = useState<IndiaIntake>(
    draft?.india ?? user!.india ?? { board: 'CBSE', stream: 'Science (PCM)', grade: '11', elective: 'Computer Science', targetMajors: [], targetColleges: [] },
  );
  const [sgus, setSgus] = useState<SgUsIntake>(
    draft?.sgus ?? user!.sgus ?? {
      curriculum: 'IB', grade: '11', courses: [], targetMajors: [], targetColleges: [],
      isAthlete: false, sport: '', trainingHoursPerWeek: 0, peakSeasonMonths: [],
    },
  );
  const [countries, setCountries] = useState<TargetCountry[]>(draft?.countries ?? current?.targetCountries ?? []);
  const [colleges, setColleges] = useState(draft?.colleges ?? (current?.targetColleges ?? []).join(', '));
  const [career, setCareer] = useState<CareerLayer>(() => careerFor(user!, getProgress(user!.id)));
  const [wantsAps, setWantsAps] = useState<'yes' | 'no' | 'unsure'>(draft?.wantsAps ?? ((user!.sgus?.apAddOns?.length ?? 0) > 0 ? 'yes' : 'unsure'));
  const examLater = !!career.examDate && new Date(career.examDate) > mayExamDate(0);

  const majors = segment === 'india' ? india.targetMajors : sgus.targetMajors;
  const setMajors = (v: string[]) => (segment === 'india' ? setIndia({ ...india, targetMajors: v }) : setSgus({ ...sgus, targetMajors: v }));
  const addOns = sgus.apAddOns ?? [];

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
    if (step === 1 && segment === 'sgus' && sgus.courses.length < 3) return 'Pick the subjects you’re taking or considering (at least 3).';
    if (step === 3) {
      if (!majors.length) return 'Pick at least one major you’re considering, or choose Undecided.';
      if (!countries.length) return 'Pick at least one country (or “not sure”).';
    }
    if (step === 4 && segment === 'sgus' && sgus.isAthlete && sgus.trainingHoursPerWeek <= 0) return 'Enter your weekly training hours.';
    return null;
  }

  /**
   * Save what's been entered so far as a draft (resume + XP read it). The workload layer is only
   * written on the final step, so "Your week" can't count as done early.
   */
  function persist(final: boolean, nextReached: number) {
    const targetColleges = splitList(colleges);
    const prev = getProgress(user!.id);
    const now = new Date().toISOString();
    const examDate = career.examDate ?? mayExamDate(0).toISOString();
    const nextCareer: CareerLayer = { ...career, examDate, targetMajors: majors, targetColleges };
    saveProgress({
      ...(prev ?? { userId: user!.id, answers: {}, step: 0, startedAt: now, updatedAt: now }),
      career: final ? nextCareer : { ...(prev?.career ?? {}), targetMajors: majors, targetColleges, examDate },
      draft: final ? undefined : { segment, india, sgus, countries, colleges, wantsAps, reached: nextReached },
    });
    if (!final) return null;
    // Switching track clears the other track's intake so nothing reads stale answers.
    const updated = segment === 'india'
      ? updateUser({ segment, sgus: undefined, india: { ...india, targetColleges, targetCountries: countries }, headline: `Class ${india.grade} · ${india.board} ${india.stream}` })
      : updateUser({
          segment,
          india: undefined,
          sgus: {
            ...sgus,
            targetColleges,
            targetCountries: countries,
            apAddOns: sgus.curriculum !== 'US' && wantsAps !== 'no' ? addOns : [],
            trainingHoursPerWeek: sgus.isAthlete ? sgus.trainingHoursPerWeek : 0,
          },
          headline: `Grade ${sgus.grade} · ${CURRICULUM_LABEL[sgus.curriculum]}${sgus.isAthlete ? ' · athlete' : ''}`,
        });
    return updated;
  }

  function next() {
    const problem = validate();
    setError(problem);
    if (problem) return;
    const nextReached = Math.max(reached, step + 1);
    // XP is only toasted the first time a section is saved, and the draft makes it real.
    const firstTime = !editing && step + 1 > reached;
    const reward = firstTime && (step === 1 ? { xp: SETUP_XP.studies, label: 'Studies saved' } : step === 3 ? { xp: SETUP_XP.goals, label: 'Goals set' } : null);
    if (step < STEPS.length - 1) {
      persist(false, nextReached);
      setReached(nextReached);
      if (reward) setToast({ key: Date.now(), ...reward });
      setStep(step + 1);
      window.scrollTo({ top: 0 });
      return;
    }
    const updated = persist(true, nextReached)!;
    const quizDone = !!getProgress(updated.id)?.completedAt;
    if (!quizDone) return navigate('/questionnaire');
    refreshProfile(updated);
    navigate(editing ? '/plan' : '/plan?welcome=1');
  }

  return (
    <div>
      {toast && <XpToast key={toast.key} xp={toast.xp} label={toast.label} />}
      <div className="flex items-center gap-1.5 mb-3">
        {STEPS.map((s, i) => (
          <span key={s} className={'h-1.5 flex-1 rounded-full transition-colors duration-500 ' + (i <= step ? 'bg-leaf-500' : 'bg-line')} />
        ))}
      </div>
      <p className="eyebrow text-leaf-600">
        {editing ? 'Edit your studies' : 'Your studies'} · {step + 1} of {STEPS.length}
      </p>
      <h1 key={step} className="font-jakarta font-extrabold text-ink text-[28px] sm:text-[32px] leading-tight mt-1.5 mb-6 animate-fade-up">{STEPS[step]}</h1>

      {error && <div className="mb-4 animate-pop"><ErrorNote>{error}</ErrorNote></div>}

      <div key={`${step}-${segment}`} className="animate-slide-right">
        {step === 0 && (
          <div className="grid sm:grid-cols-2 gap-4">
            <Choice on={segment === 'india'} onClick={() => setSegment('india')} icon="menu_book" title="India"
              body="I study for Indian board exams (CBSE, ICSE or a state board)." />
            <Choice on={segment === 'sgus'} onClick={() => setSegment('sgus')} icon="public" tone="sky" title="Singapore · US track"
              body="I'm in an IB, A-Level or US high-school programme." />
          </div>
        )}

        {step === 1 && segment === 'india' && (
          <Card>
            <div className="space-y-6">
              <Question title="Which board are you studying under?" help="This is your main school qualification. APs, if you take any, come on top of it.">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['CBSE', 'ICSE', 'State board', 'Other'] as const).map((b) => (
                    <Choice key={b} on={india.board === b} onClick={() => setIndia({ ...india, board: b })} title={b} />
                  ))}
                </div>
              </Question>
              <Question title="Which class are you in?">
                <Pills options={['9', '10', '11', '12'] as IndiaIntake['grade'][]} value={india.grade} onChange={(g) => setIndia({ ...india, grade: g })} label={(g) => `Class ${g}`} />
              </Question>
              <Question title="Your stream" help="If you're in Class 9 or 10, pick the stream you expect to take.">
                <Pills
                  options={['Science (PCM)', 'Science (PCB)', 'Science (PCMB)', 'Commerce', 'Humanities'] as IndiaIntake['stream'][]}
                  value={india.stream}
                  onChange={(s) => setIndia({ ...india, stream: s })}
                />
              </Question>
              <Question title="Your fifth / elective subject">
                <Pills options={ELECTIVES} value={india.elective} onChange={(e) => setIndia({ ...india, elective: e })} />
              </Question>
            </div>
            {!isMapped(india) && (
              <p className="mt-6 text-[13px] text-amber-800 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
                So far we've mapped CBSE Science only. You can still continue. Your profile is saved and used as soon as your
                board and stream are mapped.
              </p>
            )}
          </Card>
        )}

        {step === 1 && segment === 'sgus' && (
          <Card>
            <div className="space-y-6">
              <Question title="Which school system are you in?" help="Your main programme. If you're thinking about AP exams on top of IB or A-Levels, that comes next.">
                <div className="grid sm:grid-cols-3 gap-2">
                  {(['IB', 'A-Level', 'US'] as Curriculum[]).map((c) => (
                    <Choice
                      key={c}
                      on={sgus.curriculum === c}
                      onClick={() => c !== sgus.curriculum && setSgus({ ...sgus, curriculum: c, courses: [], apAddOns: [] })}
                      title={CURRICULUM_LABEL[c]}
                      body={c === 'IB' ? '6 subjects, 3–4 at Higher Level' : c === 'A-Level' ? 'Usually 3–4 subjects' : 'Classes at standard, Honors or AP level'}
                      tone="sky"
                    />
                  ))}
                </div>
              </Question>
              <Question title="Grade">
                <Pills options={['9', '10', '11', '12'] as SgUsIntake['grade'][]} value={sgus.grade} onChange={(g) => setSgus({ ...sgus, grade: g })} label={(g) => `Grade ${g}`} />
              </Question>
              <Question title="Subjects you're taking or considering" help={sgus.curriculum === 'IB' ? 'Usually 6, with 3 or 4 at HL.' : sgus.curriculum === 'A-Level' ? 'Usually 3 or 4.' : 'Pick your main academic classes.'}>
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
              </Question>
              {sgus.courses.length > 0 && (
                <div className="divide-y divide-line border border-line rounded-2xl stagger">
                  {sgus.courses.map((c) => (
                    <div key={c.name} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
                      <span className="text-[14px] text-ink font-medium">{c.name}</span>
                      <div className="flex gap-1">
                        {LEVELS[sgus.curriculum].map((l) => (
                          <button
                            key={l}
                            type="button"
                            title={LEVEL_HELP[l]}
                            aria-pressed={c.level === l}
                            onClick={() => setLevel(c.name, l)}
                            className={'text-[12px] font-semibold px-2.5 py-1 rounded-full border transition-colors ' + (c.level === l ? 'bg-leaf-600 text-white border-leaf-600' : 'border-line-2 text-slate-600')}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-[12px] text-slate-500">
                {LEVELS[sgus.curriculum].map((l) => `${l}: ${LEVEL_HELP[l].split(': ').pop()}`).join(' · ')}
              </p>
            </div>
          </Card>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="rounded-3xl bg-violet-50 border border-violet-200 p-5 flex gap-4">
              <span className="material-symbols-outlined text-violet-700 text-[28px]">help</span>
              <div>
                <p className="font-jakarta font-bold text-ink text-[15.5px]">What's an AP?</p>
                <p className="text-[13.5px] text-slate-700 mt-1 leading-relaxed">
                  AP (Advanced Placement) exams are college-level exams run by the US College Board, held every May. You
                  don't need to change schools to take them. Many students study for them on their own, alongside their
                  normal school subjects. They're an add-on, not a replacement for your {segment === 'india' ? 'board exams' : 'school programme'}.
                </p>
              </div>
            </div>

            {segment === 'india' ? (
              <Card>
                <Question title="When would you sit your APs?" help="AP exams run every May. Your plan spreads the work over the weeks until then.">
                  <Pills
                    options={['soon', 'later']}
                    value={examLater ? 'later' : 'soon'}
                    onChange={(v) => {
                      const date = mayExamDate(v === 'soon' ? 0 : 1);
                      setCareer({ ...career, examDate: date.toISOString(), weeksToExam: weeksToNextMay() + (v === 'soon' ? 0 : 52) });
                    }}
                    label={(v) => (v === 'soon' ? `This coming May (~${weeksToNextMay()} weeks)` : `The May after (~${weeksToNextMay() + 52} weeks)`)}
                  />
                </Question>
                <p className="text-[13px] text-slate-600 mt-5 flex gap-2">
                  <span className="material-symbols-outlined text-leaf-600 text-[18px]">auto_awesome</span>
                  You don't need to pick APs yourself. Your plan ranks all {AP_COURSES.length} for you by how much your {india.board} syllabus
                  already covers, how hard each one is, and how well it fits your goals and your week.
                </p>
              </Card>
            ) : sgus.curriculum === 'US' ? (
              <Card>
                <p className="text-[14px] text-slate-700 leading-relaxed">
                  At a US high school, AP is a class level. You already marked which of your classes are AP in the last step.
                  Your plan checks how many AP classes fit your week and how demanding each one is.
                </p>
              </Card>
            ) : (
              <Card>
                <Question title={`Thinking about AP exams on top of ${CURRICULUM_LABEL[sgus.curriculum]}?`}>
                  <Pills
                    options={['yes', 'unsure', 'no'] as const}
                    value={wantsAps}
                    onChange={setWantsAps}
                    label={(v) => (v === 'yes' ? 'Yes' : v === 'unsure' ? 'Maybe' : 'No, just my school subjects')}
                  />
                </Question>
                {wantsAps !== 'no' && (
                  <div className="mt-6">
                    <p className="font-jakarta font-bold text-ink text-[15px]">Which ones interest you?</p>
                    <p className="text-[12.5px] text-slate-500 mb-3">Your plan checks whether they fit your week and drops any that don't.</p>
                    <div className="grid sm:grid-cols-2 gap-2 stagger">
                      {ADDON_OPTIONS.map((a) => {
                        const on = addOns.includes(a.id);
                        return (
                          <button
                            key={a.id}
                            type="button"
                            aria-pressed={on}
                            onClick={() => setSgus({ ...sgus, apAddOns: on ? addOns.filter((x) => x !== a.id) : [...addOns, a.id] })}
                            className={'text-left rounded-2xl border-2 px-4 py-3 lift ' + (on ? 'border-leaf-500 bg-leaf-50' : 'border-line hover:border-slate-300')}
                          >
                            <span className="flex items-center justify-between gap-2">
                              <span className="font-semibold text-ink text-[14px]">{a.name}</span>
                              <span className={'text-[11px] font-semibold rounded-full px-2 py-0.5 border ' + (a.difficulty >= HARD_AT ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200')}>
                                {DIFFICULTY_LABEL[a.difficulty]}
                              </span>
                            </span>
                            <span className="block text-[12px] text-slate-500 mt-1 leading-snug">{a.plain}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <Card>
              <Question title="Majors you're considering" help="Up to 3. Undecided is fine.">
                <ChipSelect options={majorNames} max={3} value={majors} onChange={setMajors} />
              </Question>
            </Card>
            <Card>
              <Question title="Where do you want to apply?" help="US and UK universities look at APs differently, so your plan adapts to this.">
                <div className="grid grid-cols-2 gap-2">
                  {COUNTRIES.map((c) => (
                    <Choice
                      key={c}
                      on={countries.includes(c)}
                      onClick={() => setCountries(countries.includes(c) ? countries.filter((x) => x !== c) : [...countries, c])}
                      title={COUNTRY_LABEL[c]}
                      tone="amber"
                    />
                  ))}
                </div>
              </Question>
              {countries.filter((c) => c !== 'Other').map((c) => (
                <p key={c} className="mt-3 text-[12.5px] text-slate-600 flex gap-2 animate-fade-in">
                  <span className="font-semibold text-ink shrink-0">{c}:</span>
                  {COUNTRY_GUIDE[c].howApsAreRead}
                </p>
              ))}
            </Card>
            <Card>
              <Field label="Dream universities (optional)" hint="Comma-separated">
                <TextInput value={colleges} placeholder="e.g. Georgia Tech, UCL, University of Toronto" onChange={(e) => setColleges(e.target.value)} />
              </Field>
            </Card>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <Card>
              <div className="space-y-7">
                <Hours
                  label="Coaching & tuition"
                  help={segment === 'india' ? 'JEE/NEET/SAT coaching, tuition classes, a part-time job.' : 'Tutoring, test prep (SAT/ACT), a part-time job.'}
                  value={career.currentLoadHours}
                  onChange={(n) => setCareer({ ...career, currentLoadHours: n })}
                />
                <Hours
                  label="Activities"
                  help="Clubs, competitions, volunteering, music, non-competitive sport."
                  value={career.activityHours ?? 0}
                  onChange={(n) => setCareer({ ...career, activityHours: n })}
                />
                {segment === 'india' && (
                  <Hours
                    label="Extra time you could give to APs"
                    help="Be realistic. Your plan fits inside this, then adjusts it for your busy week."
                    value={career.extraHoursPerWeek}
                    onChange={(n) => setCareer({ ...career, extraHoursPerWeek: Math.max(1, n) })}
                    max={20}
                  />
                )}
              </div>
            </Card>
            {segment === 'sgus' && (
              <Card>
                <Checkbox checked={sgus.isAthlete} onChange={(v) => setSgus({ ...sgus, isAthlete: v })}>
                  <span className="font-semibold text-ink">I train competitively.</span> Use my training hours to set my load ceiling.
                </Checkbox>
                {sgus.isAthlete && (
                  <div className="mt-5 space-y-5 animate-fade-up">
                    <Field label="Sport">
                      <TextInput value={sgus.sport} placeholder="e.g. Swimming (national squad)" onChange={(e) => setSgus({ ...sgus, sport: e.target.value })} />
                    </Field>
                    <Hours label="Training" help="Include travel to training and competitions." value={sgus.trainingHoursPerWeek} onChange={(n) => setSgus({ ...sgus, trainingHoursPerWeek: n })} max={40} />
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
            )}
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={() => { setError(null); setStep(step - 1); }}
          className={'text-[14px] font-semibold text-slate-500 hover:text-ink ' + (step === 0 ? 'invisible' : '')}
        >
          ← Back
        </button>
        <button type="button" onClick={next} className={btnPrimary + ' px-8'}>
          {step < STEPS.length - 1 ? 'Continue' : editing ? 'Save changes' : 'Build my plan'}
          <span className="material-symbols-outlined text-[18px]">{step < STEPS.length - 1 ? 'arrow_forward' : 'auto_awesome'}</span>
        </button>
      </div>
    </div>
  );
}
