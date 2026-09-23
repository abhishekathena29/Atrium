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
  /** Merge fields into the signed-in user's account. */
  updateUser: (patch: Partial<Omit<User, 'id' | 'email' | 'role' | 'createdAt'>>) => User;
}

const ACCOUNTS_KEY = 'atrium.accounts';
const SESSION_KEY = 'atrium.session';

const AuthContext = createContext<AuthContextValue | null>(null);

function readAccounts(): StoredAccount[] {
  try {
    const raw: StoredAccount[] = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? '[]');
    // Accounts created before segments existed default to the launch segment.
    return raw.map((a) => ({ ...a, segment: a.segment ?? 'india' }));
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

function makeInviteCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

/** Look up any account by id (used by the parent view to read the linked student). */
// eslint-disable-next-line react-refresh/only-export-components
export function findUserById(id: string): User | null {
  const account = readAccounts().find((a) => a.id === id);
  return account ? stripPassword(account) : null;
}

/** All accounts matching a filter (used for mentor matching; would be a server query). */
// eslint-disable-next-line react-refresh/only-export-components
export function listUsers(filter: (u: User) => boolean): User[] {
  return readAccounts().map(stripPassword).filter(filter);
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

      let linkedStudentId: string | undefined;
      let segment = input.segment;
      if (input.role === 'parent') {
        const code = input.parentInviteCode?.trim().toUpperCase();
        const student = accounts.find((a) => a.role === 'student' && a.parentInviteCode === code);
        if (!student) throw new Error('That invite code does not match a student account.');
        linkedStudentId = student.id;
        segment = student.segment;
      }

      const account: StoredAccount = {
        id: makeId(),
        name: input.name.trim(),
        email: input.email.trim(),
        role: input.role,
        segment,
        headline: input.headline.trim(),
        subjects: input.subjects,
        athleteMentor: input.role === 'mentor' ? !!input.athleteMentor : undefined,
        linkedStudentId,
        parentInviteCode: input.role === 'student' ? makeInviteCode() : undefined,
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

    function updateUser(patch: Partial<User>): User {
      if (!user) throw new Error('Not signed in.');
      const accounts = readAccounts();
      const idx = accounts.findIndex((a) => a.id === user.id);
      if (idx === -1) throw new Error('Account not found.');
      const next = { ...accounts[idx], ...patch, id: user.id };
      accounts[idx] = next;
      writeAccounts(accounts);
      const safe = stripPassword(next);
      setUser(safe);
      return safe;
    }

    return { user, loading, signIn, signUp, signOut, updateUser };
  }, [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
