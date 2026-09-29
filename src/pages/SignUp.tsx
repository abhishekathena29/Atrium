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
      navigate('/welcome');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <h1 className="font-jakarta font-extrabold text-ink text-[32px]">Create your free account</h1>
      <p className="text-[14px] text-slate-500 mt-2">Takes a minute. Then we'll walk you through the rest.</p>

      <div className="mt-6 grid sm:grid-cols-3 gap-3">
        {ROLES.map((r) => {
          const active = r.value === role;
          return (
            <button
              key={r.value}
              type="button"
              onClick={() => setRole(r.value)}
              className={
                'text-left rounded-2xl border-2 p-3.5 transition-colors bg-white ' +
                (active
                  ? 'border-leaf-500 ring-4 ring-leaf-100'
                  : 'border-line hover:border-leaf-300')
              }
            >
              <span className={'material-symbols-outlined text-[22px] ' + (active ? 'text-leaf-600' : 'text-slate-400')}>
                {r.icon}
              </span>
              <p className="font-jakarta font-bold text-ink text-[15px] mt-1.5">{r.title}</p>
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
                    'text-left rounded-2xl border-2 px-3.5 py-2.5 bg-white ' +
                    (segment === s.value ? 'border-leaf-500 ring-4 ring-leaf-100' : 'border-line')
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
          className="w-full inline-flex items-center justify-center gap-2 bg-leaf-600 text-white text-[15px] font-semibold px-6 py-3.5 rounded-full hover:bg-leaf-700 transition-colors disabled:opacity-60"
        >
          {submitting ? 'Creating account…' : role === 'mentor' ? 'Create account & apply' : `Create ${role} account`}
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </form>

      <p className="text-[13px] text-slate-500 mt-6">
        Already have an account?{' '}
        <Link to="/signin" className="text-ink font-medium border-b border-leaf-600/40 hover:border-leaf-600 pb-0.5">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
