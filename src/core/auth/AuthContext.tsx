// src/core/auth/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

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
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  addChild: (name: string, classLevel: number, avatar: string) => Promise<{ error: string | null }>;
  refreshChildren: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children: reactChildren }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [parent, setParent] = useState<ParentProfile | null>(null);
  const [kids, setKids] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  // Session listener
  useEffect(() => {
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
  }, []);

  // Load parent + children when session exists
  useEffect(() => {
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
  }, [session?.user?.id]);

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
    await supabase.auth.signOut();
  };

  const refreshChildren = async () => {
    const { data } = await supabase
      .from('children')
      .select('*')
      .order('created_at', { ascending: true });
    setKids(data ?? []);
  };

  const addChild = async (name: string, classLevel: number, avatar: string) => {
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

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        parent,
        children: kids,
        loading,
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
