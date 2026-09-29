import { Link, useNavigate } from 'react-router-dom';
import { findUserById, useAuth } from '../auth/AuthContext';
import type { User } from '../auth/types';
import { getStudentState } from '../engine/studentState';
import { nextPathFor } from '../engine/flow';
import { btnPrimary } from '../components/ui/Field';

function Hello({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <div className="text-center">
      <div className="mx-auto w-16 h-16 rounded-3xl bg-leaf-600 flex items-center justify-center shadow-card">
        <span className="material-symbols-outlined text-white text-[34px]" style={{ fontVariationSettings: "'FILL' 1" }}>waving_hand</span>
      </div>
      <h1 className="font-jakarta font-extrabold text-ink text-[32px] sm:text-[38px] leading-tight mt-6">
        Welcome to Atrium, {name.split(' ')[0]}
      </h1>
      <p className="text-[16px] text-slate-600 mt-3 max-w-lg mx-auto">{children}</p>
    </div>
  );
}

function StepCard({ n, icon, title, body, time, tone }: { n: number; icon: string; title: string; body: string; time: string; tone: string }) {
  return (
    <li className="bg-white rounded-3xl border border-line p-5 flex items-start gap-4">
      <span className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${tone}`}>
        <span className="material-symbols-outlined text-[24px]">{icon}</span>
      </span>
      <div className="flex-1">
        <p className="text-[12px] font-bold text-slate-400">STEP {n}</p>
        <p className="font-jakarta font-bold text-ink text-[16.5px]">{title}</p>
        <p className="text-[13.5px] text-slate-600 mt-0.5">{body}</p>
      </div>
      <span className="text-[12px] font-semibold text-slate-500 bg-slate-50 rounded-full px-2.5 py-1 whitespace-nowrap">{time}</span>
    </li>
  );
}

function StudentWelcome({ user }: { user: User }) {
  const { updateUser } = useAuth();
  const navigate = useNavigate();
  const s = getStudentState(user);
  const started = s.intakeDone || !!s.progress;

  function go() {
    if (!user.welcomedAt) updateUser({ welcomedAt: new Date().toISOString() });
    navigate(s.intakeDone ? '/questionnaire' : '/onboarding');
  }

  return (
    <>
      <Hello name={user.name}>
        Let's build your free {user.segment === 'india' ? 'AP plan' : 'course-load plan'}. It takes about 10 minutes, and
        everything saves as you go.
      </Hello>

      <ol className="mt-10 space-y-3">
        <StepCard n={1} icon="badge" tone="bg-sky-100 text-sky-700" title="About you"
          body={user.segment === 'india' ? 'Your board, stream, class and target majors.' : 'Your curriculum, subjects, targets and training hours.'} time="2 min" />
        <StepCard n={2} icon="psychology" tone="bg-violet-100 text-violet-700" title="Questionnaire"
          body="How you like to work, what interests you, and how much time you have." time="8 min" />
        <StepCard n={3} icon="route" tone="bg-leaf-100 text-leaf-700" title="Your plan"
          body="A reasoned plan, instantly. Then check it with a mentor for free." time="Instant" />
      </ol>

      <div className="mt-6 rounded-3xl bg-amber-50 border border-amber-100 p-5 flex items-center gap-4">
        <span className="material-symbols-outlined text-amber-600 text-[30px]" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
        <p className="text-[14px] text-amber-900">
          You'll unlock your first two awards, <span className="font-semibold">First step</span> and{' '}
          <span className="font-semibold">Know yourself</span>, along the way.
        </p>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button onClick={go} className={btnPrimary + ' w-full sm:w-auto text-[15px] px-8'}>
          {started ? 'Continue where I left off' : "Let's go"}
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
        <Link to="/dashboard" className="text-[13.5px] font-semibold text-slate-500 hover:text-ink">I'll do this later</Link>
      </div>
    </>
  );
}

function MentorWelcome({ user }: { user: User }) {
  const { updateUser } = useAuth();
  const navigate = useNavigate();
  function go() {
    updateUser({ welcomedAt: new Date().toISOString() });
    navigate('/mentor/application');
  }
  return (
    <>
      <Hello name={user.name}>
        Thanks for applying to be a founding mentor. Here's how it works. Every step exists to keep students safe and
        the advice good.
      </Hello>
      <ol className="mt-10 space-y-3">
        <StepCard n={1} icon="edit_note" tone="bg-sky-100 text-sky-700" title="Application" body="Your university, results and the subjects you can mentor." time="10 min" />
        <StepCard n={2} icon="quiz" tone="bg-violet-100 text-violet-700" title="Subject screen" body="A short subject-knowledge interview with our team." time="20 min" />
        <StepCard n={3} icon="co_present" tone="bg-amber-100 text-amber-700" title="Teaching demo" body="A mock 20-minute consult with a reviewer." time="20 min" />
        <StepCard n={4} icon="shield_person" tone="bg-leaf-100 text-leaf-700" title="Safeguarding" body="Code of conduct, training and a background check." time="15 min" />
      </ol>
      <div className="mt-8 flex justify-center">
        <button onClick={go} className={btnPrimary + ' text-[15px] px-8'}>
          Start my application
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
    </>
  );
}

function ParentWelcome({ user }: { user: User }) {
  const { updateUser } = useAuth();
  const navigate = useNavigate();
  const child = user.linkedStudentId ? findUserById(user.linkedStudentId) : null;
  const first = child?.name.split(' ')[0] ?? 'your child';
  const ready = child ? !!getStudentState(child).profile : false;
  function go() {
    updateUser({ welcomedAt: new Date().toISOString() });
    navigate('/dashboard');
  }
  return (
    <>
      <Hello name={user.name}>
        You're now linked to <span className="font-semibold text-ink">{child?.name ?? 'your child'}</span>. Here's what you can do on Atrium.
      </Hello>
      <ul className="mt-10 grid sm:grid-cols-3 gap-3">
        {[
          { icon: 'visibility', t: 'See the plan', b: `Read ${first}'s plan and the reasons behind it, in plain language.` },
          { icon: 'verified', t: 'Approve consults', b: 'Paid consults only go ahead after you approve and pay.' },
          { icon: 'local_fire_department', t: 'Cheer them on', b: `Follow ${first}'s study streak, awards and results.` },
        ].map((c) => (
          <li key={c.t} className="bg-white rounded-3xl border border-line p-5 text-center">
            <span className="mx-auto w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">{c.icon}</span>
            </span>
            <p className="font-jakarta font-bold text-ink text-[16px] mt-3">{c.t}</p>
            <p className="text-[13px] text-slate-600 mt-1">{c.b}</p>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-center text-[14px] text-slate-600">
        {ready ? `${first}'s plan is ready to view.` : `${first} hasn't finished their plan yet. It will appear on your dashboard when they do.`}
      </p>
      <div className="mt-6 flex justify-center">
        <button onClick={go} className={btnPrimary + ' text-[15px] px-8'}>
          {ready ? `See ${first}'s plan` : 'Go to my dashboard'}
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
    </>
  );
}

export function Welcome() {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role === 'mentor') return <MentorWelcome user={user} />;
  if (user.role === 'parent') return <ParentWelcome user={user} />;
  // A student who's already finished setup doesn't need the welcome again.
  if (nextPathFor(user) === '/dashboard' && getStudentState(user).profile) return <StudentDone />;
  return <StudentWelcome user={user} />;
}

function StudentDone() {
  return (
    <div className="text-center">
      <h1 className="font-jakarta font-extrabold text-ink text-[30px]">You're all set up</h1>
      <p className="text-[15px] text-slate-600 mt-2">Your plan is ready whenever you are.</p>
      <Link to="/plan" className={btnPrimary + ' mt-6'}>Open my plan</Link>
    </div>
  );
}
