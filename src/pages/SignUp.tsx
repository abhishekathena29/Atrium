import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import type { UserRole } from '../auth/types';
import { AuthLayout } from '../components/auth/AuthLayout';
import { Field, TextInput } from '../components/ui/Field';

const ROLES: {
  value: UserRole;
  title: string;
  blurb: string;
  icon: string;
  headlineLabel: string;
  headlinePlaceholder: string;
  subjectsLabel: string;
}[] = [
  {
    value: 'student',
    title: "I'm a student",
    blurb: 'Get matched with a peer mentor who has aced your coursework.',
    icon: 'school',
    headlineLabel: 'Grade / year',
    headlinePlaceholder: 'e.g. 11th grade · IB Diploma',
    subjectsLabel: 'Subjects you want help with',
  },
  {
    value: 'mentor',
    title: "I'm a mentor",
    blurb: 'Guide younger students through the coursework you’ve already mastered.',
    icon: 'volunteer_activism',
    headlineLabel: 'University & class year',
    headlinePlaceholder: "e.g. MIT '26 · Mechanical Engineering",
    subjectsLabel: 'Subjects you can mentor in',
  },
];

export function SignUp() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const initialRole = params.get('role') === 'mentor' ? 'mentor' : 'student';
  const [role, setRole] = useState<UserRole>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [headline, setHeadline] = useState('');
  const [subjects, setSubjects] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const config = ROLES.find((r) => r.value === role)!;

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
        headline,
        subjects: subjects
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      aside={{
        quote: 'Atrium mentors don’t lecture — they remember exactly what it felt like to sit where you are.',
        attribution: 'From the Atrium mentor handbook',
        image:
          'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&w=1200&q=80',
      }}
    >
      <span className="eyebrow text-bronze-600">Join Atrium</span>
      <h1 className="font-serif text-ink text-display-md mt-3">Create your account</h1>
      <p className="text-[14px] text-slate-500 mt-2">First, tell us how you’ll use Atrium.</p>

      {/* Role selector */}
      <div className="mt-6 grid sm:grid-cols-2 gap-3">
        {ROLES.map((r) => {
          const active = r.value === role;
          return (
            <button
              key={r.value}
              type="button"
              onClick={() => setRole(r.value)}
              className={
                'text-left rounded-md border p-4 transition-colors ' +
                (active
                  ? 'border-bronze-400 bg-accent-soft/60 ring-1 ring-bronze-300'
                  : 'border-line-2 bg-canvas hover:border-bronze-300')
              }
            >
              <span
                className={
                  'material-symbols-outlined text-[22px] ' +
                  (active ? 'text-bronze-600' : 'text-slate-400')
                }
              >
                {r.icon}
              </span>
              <p className="font-serif text-ink text-[17px] mt-2">{r.title}</p>
              <p className="text-[12px] text-slate-500 mt-1 leading-snug">{r.blurb}</p>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && (
          <div className="text-[13px] text-red-700 bg-red-50 border border-red-200 rounded-sm px-3 py-2">
            {error}
          </div>
        )}

        <Field label="Full name">
          <TextInput
            required
            autoComplete="name"
            placeholder="Jordan Lee"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>

        <Field label="Email">
          <TextInput
            type="email"
            required
            autoComplete="email"
            placeholder="you@school.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
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

        <Field label={config.headlineLabel}>
          <TextInput
            required
            placeholder={config.headlinePlaceholder}
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
          />
        </Field>

        <Field label={config.subjectsLabel} hint="Comma-separated, e.g. AP Calculus BC, Physics C">
          <TextInput
            placeholder="AP Calculus BC, Chemistry, College essays"
            value={subjects}
            onChange={(e) => setSubjects(e.target.value)}
          />
        </Field>

        <button
          type="submit"
          disabled={submitting}
          className="w-full inline-flex items-center justify-center gap-2 bg-ink text-paper text-[14px] font-medium px-6 py-3 rounded-sm hover:bg-ink-soft transition-colors disabled:opacity-60"
        >
          {submitting ? 'Creating account…' : `Create ${role} account`}
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
