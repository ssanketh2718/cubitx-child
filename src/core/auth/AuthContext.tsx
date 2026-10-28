// src/core/auth/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useApp } from '../store';
import { isDevMode, MOCK_PARENT, MOCK_CHILDREN, disableDevMode } from './devMode';

interface ParentProfile {
  id: string;
  email: string | null;
  name: string | null;
  first_name: string | null;
  surname: string | null;
  consent_given: boolean;
}

interface Child {
  id: string;
  name: string;
  class_level: number;
  avatar: string;
  school_id: string | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  parent: ParentProfile | null;
  children: Child[];
  loading: boolean;
  isDev: boolean;
  hasConsent: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  addChild: (
    name: string,
    classLevel: number,
    avatar: string,
    schoolId?: string | null
  ) => Promise<{ error: string | null }>;
  refreshChildren: () => Promise<void>;
  refreshParent: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const MOCK_SESSION = {
  access_token: 'dev',
  refresh_token: 'dev',
  expires_in: 999999,
  expires_at: Math.floor(Date.now() / 1000) + 999999,
  token_type: 'bearer',
  user: {
    id: 'dev-parent',
    email: 'dev@cubitx.in',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  },
} as unknown as Session;

const MOCK_PARENT_PROFILE: ParentProfile = {
  id: MOCK_PARENT.id,
  email: MOCK_PARENT.email,
  name: MOCK_PARENT.name,
  first_name: 'Dev',
  surname: 'Parent',
  consent_given: true,
};

const MOCK_CHILD_LIST: Child[] = MOCK_CHILDREN.map((c) => ({
  id: c.id,
  name: c.name,
  class_level: c.class_level,
  avatar: c.avatar,
  school_id: null,
}));

export function AuthProvider({ children: reactChildren }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [parent, setParent] = useState<ParentProfile | null>(null);
  const [kids, setKids] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [dev, setDev] = useState<boolean>(() => isDevMode());

  /* ─── Session listener ───────────────────────────── */
  useEffect(() => {
    if (dev) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (!session) {
          setParent(null);
          setKids([]);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [dev]);

  /* ─── Load parent + children when session exists ─── */
  useEffect(() => {
    if (dev) return;
    if (!session?.user) return;

    (async () => {
      const { data: parentRow } = await supabase
        .from('parents')
        .select('id, email, name, first_name, surname, consent_given')
        .eq('id', session.user.id)
        .maybeSingle();

      setParent(parentRow ?? null);

      const { data: childRows } = await supabase
        .from('children')
        .select('id, name, class_level, avatar, school_id')
        .order('created_at', { ascending: true });

      setKids((childRows as Child[]) ?? []);
      setLoading(false);
    })();
  }, [session?.user?.id, dev]);

  /* ─── Auth methods ──────────────────────────────── */
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/onboard` },
    });
  };

  const signInWithEmail = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/onboard` },
    });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    // Clear child-specific cached state before leaving the account. Remove only
    // CubitX keys; do not clear unrelated origin storage.
    useApp.getState().reset();
    useApp.persist.clearStorage();
    try {
      window.localStorage.removeItem('cubitx-active-child-id');
      window.localStorage.removeItem('cubitx-dev-day');
    } catch {
      // The auth sign-out must still proceed if browser storage is unavailable.
    }

    if (dev) {
      disableDevMode();
      setDev(false);
      window.location.href = '/';
      return;
    }
    await supabase.auth.signOut();
  };

  const refreshChildren = async () => {
    if (dev) return;
    const { data } = await supabase
      .from('children')
      .select('id, name, class_level, avatar, school_id')
      .order('created_at', { ascending: true });
    setKids((data as Child[]) ?? []);
  };

  const refreshParent = async () => {
    if (dev) return;
    if (!session?.user) return;
    const { data } = await supabase
      .from('parents')
      .select('id, email, name, first_name, surname, consent_given')
      .eq('id', session.user.id)
      .maybeSingle();
    setParent(data ?? null);
  };

  const addChild = async (
    name: string,
    classLevel: number,
    avatar: string,
    schoolId?: string | null
  ) => {
    if (dev) return { error: 'Not available in dev mode' };
    if (!session?.user) return { error: 'Not signed in' };
    if (kids.length >= 3) return { error: 'Maximum 3 children' };

    const { error } = await supabase.from('children').insert({
      parent_id: session.user.id,
      name,
      class_level: classLevel,
      avatar,
      school_id: schoolId ?? null,
    });

    if (!error) await refreshChildren();
    return { error: error?.message ?? null };
  };

  /* ─── Dev mode: synthesize everything ────────────── */
  const effectiveSession = dev ? MOCK_SESSION : session;
  const effectiveParent = dev ? MOCK_PARENT_PROFILE : parent;
  const effectiveChildren = dev ? MOCK_CHILD_LIST : kids;
  const effectiveUser = dev ? MOCK_SESSION.user : (session?.user ?? null);
  const hasConsent = dev
    ? true
    : !!parent?.consent_given;

  return (
    <AuthContext.Provider
      value={{
        session: effectiveSession,
        user: effectiveUser,
        parent: effectiveParent,
        children: effectiveChildren,
        loading: dev ? false : loading,
        isDev: dev,
        hasConsent,
        signInWithGoogle,
        signInWithEmail,
        signOut,
        addChild,
        refreshChildren,
        refreshParent,
      }}
    >
      {reactChildren}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside <AuthProvider>');
  return ctx;
}