import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { SignUpInput, User } from './types';

/**
 * Prototype auth: no backend. Accounts and the active session are persisted to
 * localStorage so the flow survives reloads. Passwords are stored in plain text
 * here purely for the demo — do NOT carry this into production.
 */

interface StoredAccount extends User {
  password: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (input: SignUpInput) => Promise<User>;
  signOut: () => void;
}

const ACCOUNTS_KEY = 'atrium.accounts';
const SESSION_KEY = 'atrium.session';

const AuthContext = createContext<AuthContextValue | null>(null);

function readAccounts(): StoredAccount[] {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function writeAccounts(accounts: StoredAccount[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function stripPassword(account: StoredAccount): User {
  const { password, ...user } = account;
  void password;
  return user;
}

function makeId() {
  return 'u_' + Math.random().toString(36).slice(2, 10);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore the active session on mount.
  useEffect(() => {
    try {
      const sessionId = localStorage.getItem(SESSION_KEY);
      if (sessionId) {
        const account = readAccounts().find((a) => a.id === sessionId);
        if (account) setUser(stripPassword(account));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    async function signIn(email: string, password: string): Promise<User> {
      const normalized = email.trim().toLowerCase();
      const account = readAccounts().find((a) => a.email.toLowerCase() === normalized);
      if (!account) throw new Error('No account found for that email.');
      if (account.password !== password) throw new Error('Incorrect password.');
      const safe = stripPassword(account);
      localStorage.setItem(SESSION_KEY, account.id);
      setUser(safe);
      return safe;
    }

    async function signUp(input: SignUpInput): Promise<User> {
      const accounts = readAccounts();
      const normalized = input.email.trim().toLowerCase();
      if (accounts.some((a) => a.email.toLowerCase() === normalized)) {
        throw new Error('An account with that email already exists.');
      }
      const account: StoredAccount = {
        id: makeId(),
        name: input.name.trim(),
        email: input.email.trim(),
        role: input.role,
        headline: input.headline.trim(),
        subjects: input.subjects,
        password: input.password,
        createdAt: new Date().toISOString(),
      };
      writeAccounts([...accounts, account]);
      const safe = stripPassword(account);
      localStorage.setItem(SESSION_KEY, account.id);
      setUser(safe);
      return safe;
    }

    function signOut() {
      localStorage.removeItem(SESSION_KEY);
      setUser(null);
    }

    return { user, loading, signIn, signUp, signOut };
  }, [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
