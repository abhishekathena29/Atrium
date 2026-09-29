import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { AuthLayout } from '../components/auth/AuthLayout';
import { Field, TextInput } from '../components/ui/Field';
import { nextPathFor } from '../engine/flow';

export function SignIn() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const u = await signIn(email, password);
      // Unfinished first-run setup takes priority over wherever they were headed.
      const next = nextPathFor(u);
      navigate(next !== '/dashboard' ? next : from ?? '/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Welcome back. Your plan is where you left it.">
      <h1 className="font-jakarta font-extrabold text-ink text-[32px]">Sign in</h1>
      <p className="text-[14px] text-slate-500 mt-2">
        Good to see you again.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {error && (
          <div className="text-[13px] text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
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
          className="w-full inline-flex items-center justify-center gap-2 bg-leaf-600 text-white text-[15px] font-semibold px-6 py-3.5 rounded-full hover:bg-leaf-700 transition-colors disabled:opacity-60"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </form>

      <p className="text-[13px] text-slate-500 mt-6">
        New to Atrium?{' '}
        <Link to="/signup" className="text-ink font-medium border-b border-leaf-600/40 hover:border-leaf-600 pb-0.5">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
