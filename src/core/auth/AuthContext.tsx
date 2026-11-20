
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useApp } from '../store';
import {
  isDevMode,
  MOCK_PARENT,
  MOCK_CHILDREN,
  disableDevMode,
} from './devMode';

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

  signInWithOtp: (params: {
    email: string;
  }) => Promise<{ error: string | null }>;

  verifyOtp: (params: {
    email: string;
    token: string;
    type: 'email';
  }) => Promise<{ error: string | null }>;

  signInWithOAuth: (params: {
    provider: 'google';
  }) => Promise<{ error: string | null }>;

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

const MOCK_CHILD_LIST: Child[] = MOCK_CHILDREN.map((child) => ({
  id: child.id,
  name: child.name,
  class_level: child.class_level,
  avatar: child.avatar,
  school_id: null,
}));

export function AuthProvider({
  children: reactChildren,
}: {
  children: ReactNode;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [parent, setParent] = useState<ParentProfile | null>(null);
  const [kids, setKids] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [dev, setDev] = useState<boolean>(() => isDevMode());

  const setSupabaseId = useApp((state) => state.setSupabaseId);

  /* ─── Derived State ──────────────────────────────── */

  const effectiveSession = dev ? MOCK_SESSION : session;
  const effectiveUser = dev
    ? MOCK_SESSION.user
    : session?.user ?? null;

  const effectiveParent = dev ? MOCK_PARENT_PROFILE : parent;
  const effectiveChildren = dev ? MOCK_CHILD_LIST : kids;
  const hasConsent = dev ? true : !!parent?.consent_given;

  /* ─── Sync Global Store ──────────────────────────── */

  useEffect(() => {
    if (effectiveUser?.id) {
      setSupabaseId(effectiveUser.id);
    }
  }, [effectiveUser?.id, setSupabaseId]);

  /* ─── Session Listener ───────────────────────────── */

  useEffect(() => {
    if (dev) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const initialiseSession = async () => {
      try {
        const {
          data: { session: currentSession },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error('[CubitX Auth] Session initialization failed:', error);
          return;
        }

        if (mounted) {
          setSession(currentSession);
        }
      } catch (error) {
        console.error('[CubitX Auth] Session initialization error:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void initialiseSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (!mounted) return;

      setSession(currentSession);

      if (!currentSession) {
        setParent(null);
        setKids([]);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [dev]);

  /* ─── Load Parent and Children ───────────────────── */

  useEffect(() => {
    if (dev || !session?.user) return;

    let cancelled = false;

    const loadAccountData = async () => {
      setLoading(true);

      try {
        const { data: parentRow, error: parentError } = await supabase
          .from('parents')
          .select('id, email, name, first_name, surname, consent_given')
          .eq('id', session.user.id)
          .maybeSingle();

        if (parentError) {
          console.error('[CubitX Auth] Parent loading failed:', parentError);
        }

        if (!cancelled) {
          setParent(parentRow ?? null);
        }

        const { data: childRows, error: childError } = await supabase
          .from('children')
          .select('id, name, class_level, avatar, school_id')
          .order('created_at', { ascending: true });

        if (childError) {
          console.error('[CubitX Auth] Children loading failed:', childError);
        }

        if (!cancelled) {
          setKids((childRows as Child[]) ?? []);
        }
      } catch (error) {
        console.error('[CubitX Auth] Account loading error:', error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadAccountData();

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id, dev]);

  /* ─── Authentication Methods ─────────────────────── */

  const signInWithOAuth = async ({
    provider,
  }: {
    provider: 'google';
  }): Promise<{ error: string | null }> => {
    try {
      const redirectTo = `${window.location.origin}/onboard`;

      console.info('[CubitX Auth] Starting OAuth:', {
        provider,
        redirectTo,
        origin: window.location.origin,
      });

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
        },
      });

      if (error) {
        console.error('[CubitX Auth] OAuth initiation failed:', {
          message: error.message,
          status: error.status,
          name: error.name,
        });

        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      console.error('[CubitX Auth] OAuth exception:', error);

      return {
        error:
          error instanceof Error
            ? error.message
            : 'Google sign-in could not be started.',
      };
    }
  };

  // Legacy interface retained for existing components.
  const signInWithGoogle = async (): Promise<void> => {
    const { error } = await signInWithOAuth({
      provider: 'google',
    });

    if (error) {
      throw new Error(error);
    }
  };

  const signInWithEmail = async (
    email: string
  ): Promise<{ error: string | null }> => {
    return signInWithOtp({ email });
  };

  const signInWithOtp = async ({
    email,
  }: {
    email: string;
  }): Promise<{ error: string | null }> => {
    try {
      const cleanedEmail = email.trim().toLowerCase();

      const { error } = await supabase.auth.signInWithOtp({
        email: cleanedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/onboard`,
        },
      });

      if (error) {
        console.error('[CubitX Auth] OTP request failed:', error);
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      console.error('[CubitX Auth] OTP exception:', error);

      return {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to send verification code.',
      };
    }
  };

  const verifyOtp = async ({
    email,
    token,
    type,
  }: {
    email: string;
    token: string;
    type: 'email';
  }): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: token.trim(),
        type,
      });

      if (error) {
        console.error('[CubitX Auth] OTP verification failed:', error);
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      console.error('[CubitX Auth] OTP verification exception:', error);

      return {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to verify the code.',
      };
    }
  };

  /* ─── Sign Out ───────────────────────────────────── */

  const signOut = async (): Promise<void> => {
    useApp.getState().reset();
    useApp.persist.clearStorage();

    try {
      window.localStorage.removeItem('cubitx-active-child-id');
      window.localStorage.removeItem('cubitx-dev-day');
    } catch {
      // Authentication sign-out must continue if storage is unavailable.
    }

    if (dev) {
      disableDevMode();
      setDev(false);
      window.location.href = '/';
      return;
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('[CubitX Auth] Sign-out failed:', error);
      throw error;
    }
  };

  /* ─── Refresh Children ───────────────────────────── */

  const refreshChildren = async (): Promise<void> => {
    if (dev) return;

    const { data, error } = await supabase
      .from('children')
      .select('id, name, class_level, avatar, school_id')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[CubitX Auth] Refresh children failed:', error);
      return;
    }

    setKids((data as Child[]) ?? []);
  };

  /* ─── Refresh Parent ─────────────────────────────── */

  const refreshParent = async (): Promise<void> => {
    if (dev || !session?.user) return;

    const { data, error } = await supabase
      .from('parents')
      .select('id, email, name, first_name, surname, consent_given')
      .eq('id', session.user.id)
      .maybeSingle();

    if (error) {
      console.error('[CubitX Auth] Refresh parent failed:', error);
      return;
    }

    setParent(data ?? null);
  };

  /* ─── Add Child ──────────────────────────────────── */

  const addChild = async (
    name: string,
    classLevel: number,
    avatar: string,
    schoolId?: string | null
  ): Promise<{ error: string | null }> => {
    if (dev) {
      return { error: 'Not available in dev mode' };
    }

    if (!session?.user) {
      return { error: 'Not signed in' };
    }

    if (kids.length >= 3) {
      return { error: 'Maximum 3 children' };
    }

    const { error } = await supabase.from('children').insert({
      parent_id: session.user.id,
      name,
      class_level: classLevel,
      avatar,
      school_id: schoolId ?? null,
    });

    if (error) {
      console.error('[CubitX Auth] Add child failed:', error);
      return { error: error.message };
    }

    await refreshChildren();

    return { error: null };
  };

  /* ─── Context Provider ───────────────────────────── */

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
        signInWithOtp,
        verifyOtp,
        signInWithOAuth,

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
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be inside <AuthProvider>');
  }

  return context;
}
