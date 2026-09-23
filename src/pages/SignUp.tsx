import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import type { Segment, UserRole } from '../auth/types';
import { AuthLayout } from '../components/auth/AuthLayout';
import { ErrorNote, Field, TextInput } from '../components/ui/Field';

const ROLES: { value: UserRole; title: string; blurb: string; icon: string }[] = [
  { value: 'student', title: "I'm a student", blurb: 'Get a free plan, then validate it with a mentor.', icon: 'school' },
  { value: 'parent', title: "I'm a parent", blurb: "View your child's plan and approve consults.", icon: 'family_restroom' },
  { value: 'mentor', title: "I'm a mentor", blurb: 'Apply to guide students through courses you recently took.', icon: 'volunteer_activism' },
];

const SEGMENTS: { value: Segment; title: string; blurb: string }[] = [
  { value: 'india', title: 'India', blurb: 'AP self-study for US applications' },
  { value: 'sgus', title: 'Singapore · US track', blurb: 'IB / A-Level / AP course load, incl. athletes' },
];

function roleParam(v: string | null): UserRole {
  return v === 'mentor' || v === 'parent' ? v : 'student';
}

export function SignUp() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [role, setRole] = useState<UserRole>(roleParam(params.get('role')));
  const [segment, setSegment] = useState<Segment>(params.get('segment') === 'sgus' ? 'sgus' : 'india');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signUp({
        name,
        email,
        password,
        role,
        segment,
        headline: role === 'parent' ? 'Parent / guardian' : '',
        subjects: [],
        parentInviteCode: role === 'parent' ? inviteCode : undefined,
      });
      navigate(role === 'student' ? '/onboarding' : role === 'mentor' ? '/mentor/application' : '/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      aside={{
        quote: 'Start with a free plan. Talk to a mentor only once you know what you want to ask.',
        attribution: 'How Atrium works',
        image:
          'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&w=1200&q=80',
      }}
    >
      <span className="eyebrow text-bronze-600">Join Atrium</span>
      <h1 className="font-serif text-ink text-display-md mt-3">Create your account</h1>
      <p className="text-[14px] text-slate-500 mt-2">First, tell us how you'll use Atrium.</p>

      <div className="mt-6 grid sm:grid-cols-3 gap-3">
        {ROLES.map((r) => {
          const active = r.value === role;
          return (
            <button
              key={r.value}
              type="button"
              onClick={() => setRole(r.value)}
              className={
                'text-left rounded-md border p-3.5 transition-colors ' +
                (active
                  ? 'border-bronze-400 bg-accent-soft/60 ring-1 ring-bronze-300'
                  : 'border-line-2 bg-canvas hover:border-bronze-300')
              }
            >
              <span className={'material-symbols-outlined text-[22px] ' + (active ? 'text-bronze-600' : 'text-slate-400')}>
                {r.icon}
              </span>
              <p className="font-serif text-ink text-[16px] mt-1.5">{r.title}</p>
              <p className="text-[11.5px] text-slate-500 mt-1 leading-snug">{r.blurb}</p>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && <ErrorNote>{error}</ErrorNote>}

        {role !== 'parent' && (
          <div>
            <span className="block text-[12px] font-medium text-slate-700 mb-1.5">Track</span>
            <div className="grid grid-cols-2 gap-2">
              {SEGMENTS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setSegment(s.value)}
                  className={
                    'text-left rounded-sm border px-3 py-2 ' +
                    (segment === s.value ? 'border-ink bg-canvas ring-1 ring-ink' : 'border-line-2 bg-canvas')
                  }
                >
                  <p className="text-[13px] font-medium text-ink">{s.title}</p>
                  <p className="text-[11px] text-slate-500">{s.blurb}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        <Field label="Full name">
          <TextInput required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>

        <Field label="Email">
          <TextInput type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>

        <Field label="Password" hint="At least 6 characters.">
          <TextInput
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        {role === 'parent' && (
          <Field label="Student invite code" hint="Shown on your child's Atrium dashboard.">
            <TextInput
              required
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="e.g. K7Q2XM"
            />
          </Field>
        )}

        {role === 'mentor' && (
          <p className="text-[12px] text-slate-500 leading-relaxed">
            Next you'll complete a four-stage vetting: application, subject screen, teaching demo, and safeguarding
            checks. You're only matched with students after all four.
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full inline-flex items-center justify-center gap-2 bg-ink text-paper text-[14px] font-medium px-6 py-3 rounded-sm hover:bg-ink-soft transition-colors disabled:opacity-60"
        >
          {submitting ? 'Creating account…' : role === 'mentor' ? 'Create account & apply' : `Create ${role} account`}
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </form>

      <p className="text-[13px] text-slate-500 mt-6">
        Already have an account?{' '}
        <Link to="/signin" className="text-ink font-medium border-b border-ink/40 hover:border-ink pb-0.5">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
