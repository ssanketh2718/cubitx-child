// src/core/auth/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { isDevMode, MOCK_PARENT, MOCK_CHILDREN, disableDevMode } from './devMode';

interface ParentProfile {
  id: string;
  email: string | null;
  name: string | null;
}

interface Child {
  id: string;
  name: string;
  class_level: number;
  avatar: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  parent: ParentProfile | null;
  children: Child[];
  loading: boolean;
  isDev: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  addChild: (name: string, classLevel: number, avatar: string) => Promise<{ error: string | null }>;
  refreshChildren: () => Promise<void>;
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

export function AuthProvider({ children: reactChildren }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [parent, setParent] = useState<ParentProfile | null>(null);
  const [kids, setKids] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [dev, setDev] = useState<boolean>(() => isDevMode());

  // Session listener — skip entirely when in dev mode
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

  // Load parent + children when session exists
  useEffect(() => {
    if (dev) return;
    if (!session?.user) return;

    (async () => {
      const { data: parentRow } = await supabase
        .from('parents')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      setParent(parentRow);

      const { data: childRows } = await supabase
        .from('children')
        .select('*')
        .order('created_at', { ascending: true });

      setKids(childRows ?? []);
      setLoading(false);
    })();
  }, [session?.user?.id, dev]);

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
      .select('*')
      .order('created_at', { ascending: true });
    setKids(data ?? []);
  };

  const addChild = async (name: string, classLevel: number, avatar: string) => {
    if (dev) return { error: 'Not available in dev mode' };
    if (!session?.user) return { error: 'Not signed in' };
    if (kids.length >= 3) return { error: 'Maximum 3 children' };

    const { error } = await supabase.from('children').insert({
      parent_id: session.user.id,
      name,
      class_level: classLevel,
      avatar,
    });

    if (!error) await refreshChildren();
    return { error: error?.message ?? null };
  };

  // ─── Dev mode: synthesize everything ─────────────────────
  const effectiveSession = dev ? MOCK_SESSION : session;
  const effectiveParent = dev ? MOCK_PARENT : parent;
  const effectiveChildren = dev ? MOCK_CHILDREN : kids;
  const effectiveUser = dev ? MOCK_SESSION.user : (session?.user ?? null);

  return (
    <AuthContext.Provider
      value={{
        session: effectiveSession,
        user: effectiveUser,
        parent: effectiveParent,
        children: effectiveChildren,
        loading: dev ? false : loading,
        isDev: dev,
        signInWithGoogle,
        signInWithEmail,
        signOut,
        addChild,
        refreshChildren,
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
