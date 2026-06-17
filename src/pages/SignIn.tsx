import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { AuthLayout } from '../components/auth/AuthLayout';
import { Field, TextInput } from '../components/ui/Field';

export function SignIn() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      aside={{
        quote: 'My mentor had already aced the exact AP load I was terrified of. That changed everything.',
        attribution: 'Maya R. · Junior, mentored since 2024',
        image:
          'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
      }}
    >
      <span className="eyebrow text-bronze-600">Welcome back</span>
      <h1 className="font-serif text-ink text-display-md mt-3">Sign in to Atrium</h1>
      <p className="text-[14px] text-slate-500 mt-2">
        Pick up where you left off with your mentors and sessions.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {error && (
          <div className="text-[13px] text-red-700 bg-red-50 border border-red-200 rounded-sm px-3 py-2">
            {error}
          </div>
        )}

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

        <Field label="Password">
          <TextInput
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        <button
          type="submit"
          disabled={submitting}
          className="w-full inline-flex items-center justify-center gap-2 bg-ink text-paper text-[14px] font-medium px-6 py-3 rounded-sm hover:bg-ink-soft transition-colors disabled:opacity-60"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </form>

      <p className="text-[13px] text-slate-500 mt-6">
        New to Atrium?{' '}
        <Link to="/signup" className="text-ink font-medium border-b border-ink/40 hover:border-ink pb-0.5">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
