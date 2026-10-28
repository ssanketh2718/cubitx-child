import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/AuthContext';

const BRAND = {
  surface: '#05091a',
  surface2: '#0a1228',
  blue: '#7b8dff',
  blueBright: '#9aaaff',
  ink: '#ffffff',
  inkDim: 'rgba(255,255,255,0.62)',
  inkFaint: 'rgba(255,255,255,0.38)',
  inkGhost: 'rgba(255,255,255,0.14)',
  emerald: '#34d399',
  red: '#f87171',
  amber: '#fbbf24',
};

type Stage = 'signin' | 'enter-code' | 'dashboard';

interface School {
  id: string;
  name: string;
  city: string | null;
}

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [stage, setStage] = useState<Stage>('signin');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [school, setSchool] = useState<School | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [signinSent, setSigninSent] = useState(false);
  const [stats, setStats] = useState<null | {
    totalChildren: number;
    byClass: Record<number, number>;
  }>(null);

  useEffect(() => {
    if (loading) return;
    if (!session) {
      setStage('signin');
      return;
    }
    (async () => {
      const { data } = await supabase
        .from('teacher_schools')
        .select('school_id, schools (id, name, city)')
        .eq('teacher_id', session.user.id)
        .limit(1);
      if (data && data.length > 0) {
        const row = data[0] as any;
        const s = Array.isArray(row.schools) ? row.schools[0] : row.schools;
        if (s) {
          setSchool(s);
          setStage('dashboard');
          return;
        }
      }
      setStage('enter-code');
    })();
  }, [session, loading]);

  useEffect(() => {
    if (stage !== 'dashboard' || !school) return;
    (async () => {
      const { data: children } = await supabase
        .from('children')
        .select('id, class_level')
        .eq('school_id', school.id);

      const byClass: Record<number, number> = {};
      (children ?? []).forEach((c: any) => {
        byClass[c.class_level] = (byClass[c.class_level] ?? 0) + 1;
      });

      // Do not query child_progress without an explicit school-scoped filter.
      // Until the schema and RLS policies are reviewed, show only aggregate
      // enrollment counts for the linked school.
      setStats({
        totalChildren: children?.length ?? 0,
        byClass,
      });
    })();
  }, [stage, school]);

  const sendMagicLink = async () => {
    if (!email.includes('@')) return;
    setBusy(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/teacher` },
    });
    setBusy(false);
    if (err) return setError(err.message);
    setSigninSent(true);
  };

  const linkSchool = async () => {
    if (!session) return;
    const cleaned = code.trim().toUpperCase();
    if (!cleaned) return;
    setBusy(true);
    setError('');
    const { data, error: err } = await supabase.rpc('lookup_school_by_teacher_code', {
      p_code: cleaned,
    });
    if (err || !data || data.length === 0) {
      setBusy(false);
      setError('That code did not match any school.');
      return;
    }
    const found = data[0] as School;
    const { error: linkErr } = await supabase.from('teacher_schools').insert({
      teacher_id: session.user.id,
      school_id: found.id,
    });
    setBusy(false);
    if (linkErr && !linkErr.message.includes('duplicate')) {
      setError(linkErr.message);
      return;
    }
    setSchool(found);
    setStage('dashboard');
  };

  if (loading) {
    return <div style={{ background: BRAND.surface, minHeight: '100vh' }} />;
  }

  if (stage === 'signin') {
    return (
      <div className="min-h-screen px-5 py-12 flex items-center justify-center" style={{ background: BRAND.surface }}>
        <div className="w-full max-w-md rounded-[1.75rem] p-8" style={{ background: BRAND.surface2, border: `1px solid ${BRAND.inkGhost}` }}>
          <button
            onClick={() => navigate('/')}
            className="mb-6 text-[12px]"
            style={{ color: BRAND.inkFaint }}
          >
            ← Back
          </button>
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] mb-3" style={{ color: BRAND.blueBright }}>
            Teacher access
          </div>
          <h1 className="text-[24px] font-semibold mb-3">See how your class is thinking.</h1>
          <p className="text-[13.5px] leading-[1.7] mb-6" style={{ color: BRAND.inkDim }}>
            Sign in with your school email. We'll send a one-time link.
          </p>

          {signinSent ? (
            <div
              className="rounded-xl px-4 py-3 text-[13px]"
              style={{ background: `${BRAND.blue}15`, border: `1px solid ${BRAND.blue}40`, color: BRAND.blueBright }}
            >
              Check your inbox at <span style={{ fontWeight: 700 }}>{email}</span> and click the link to continue.
            </div>
          ) : (
            <>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.edu.in"
                className="w-full rounded-xl px-4 py-3.5 text-[14px] outline-none"
                style={{ background: 'rgba(0,0,0,0.25)', border: `1px solid ${BRAND.inkGhost}`, color: BRAND.ink }}
              />
              {error && (
                <div className="mt-3 rounded-xl px-4 py-3 text-[12.5px]" style={{ background: 'rgba(248,113,113,0.12)', color: BRAND.red }}>
                  {error}
                </div>
              )}
              <button
                onClick={sendMagicLink}
                disabled={busy}
                className="mt-5 w-full rounded-full py-3.5 text-[14px] font-bold transition disabled:opacity-40"
                style={{ background: BRAND.ink, color: BRAND.surface }}
              >
                {busy ? 'Sending…' : 'Send me a sign-in link'}
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  if (stage === 'enter-code') {
    return (
      <div className="min-h-screen px-5 py-12 flex items-center justify-center" style={{ background: BRAND.surface }}>
        <div className="w-full max-w-md rounded-[1.75rem] p-8" style={{ background: BRAND.surface2, border: `1px solid ${BRAND.inkGhost}` }}>
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] mb-3" style={{ color: BRAND.blueBright }}>
            One more step
          </div>
          <h1 className="text-[24px] font-semibold mb-3">Enter your school code.</h1>
          <p className="text-[13.5px] leading-[1.7] mb-6" style={{ color: BRAND.inkDim }}>
            Your principal or the CubitX team will have shared this with you.
          </p>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g., CUB-PUN-T-001"
            className="w-full rounded-xl px-4 py-3.5 text-[14px] outline-none uppercase tracking-wider"
            style={{ background: 'rgba(0,0,0,0.25)', border: `1px solid ${BRAND.inkGhost}`, color: BRAND.ink }}
          />
          {error && (
            <div className="mt-3 rounded-xl px-4 py-3 text-[12.5px]" style={{ background: 'rgba(248,113,113,0.12)', color: BRAND.red }}>
              {error}
            </div>
          )}
          <button
            onClick={linkSchool}
            disabled={busy || !code.trim()}
            className="mt-5 w-full rounded-full py-3.5 text-[14px] font-bold transition disabled:opacity-40"
            style={{ background: BRAND.ink, color: BRAND.surface }}
          >
            {busy ? 'Linking…' : 'Continue'}
          </button>
          <button
            onClick={async () => { await supabase.auth.signOut(); setStage('signin'); }}
            className="mt-4 block w-full text-center text-[12px]"
            style={{ color: BRAND.inkFaint }}
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-5 py-10" style={{ background: BRAND.surface }}>
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="mb-6 text-[12px]"
          style={{ color: BRAND.inkFaint }}
        >
          ← Home
        </button>

        <div className="text-[10px] font-bold uppercase tracking-[0.22em] mb-3" style={{ color: BRAND.blueBright }}>
          Teacher view
        </div>
        <h1 className="text-[28px] font-semibold tracking-tight mb-2">
          {school?.name}
        </h1>
        <div className="text-[13.5px] mb-8" style={{ color: BRAND.inkDim }}>
          {school?.city ?? 'India'} · Class-wide thinking view
        </div>

        {stats && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <StatCard value={stats.totalChildren} label="children enrolled" />
              <StatCard
                value={Object.keys(stats.byClass).length}
                label="class levels active"
              />
            </div>

            <Block title="By class level">
              <div className="flex flex-wrap gap-2">
                {[5, 6, 7, 8, 9, 10].map((c) => (
                  <div
                    key={c}
                    className="rounded-xl px-4 py-3 flex items-center gap-2.5"
                    style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${BRAND.inkGhost}` }}
                  >
                    <span className="text-[12px] font-semibold" style={{ color: BRAND.inkDim }}>
                      Class {c}
                    </span>
                    <span className="text-[18px] font-bold tabular-nums" style={{ color: BRAND.blueBright }}>
                      {stats.byClass[c] ?? 0}
                    </span>
                  </div>
                ))}
              </div>
            </Block>

            <div
              className="rounded-2xl p-5 mt-2"
              style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.28)' }}
            >
              <div className="text-[12px] leading-[1.7]" style={{ color: BRAND.inkDim }}>
                This view shows <strong style={{ color: BRAND.ink }}>observable behaviour</strong> —
                how many children are practicing, what kinds of thinking they're doing.
                It does not show marks, rankings, or comparisons between children.
              </div>
            </div>
          </>
        )}

        <button
          onClick={async () => { await supabase.auth.signOut(); setStage('signin'); }}
          className="mt-8 block text-center text-[12px]"
          style={{ color: BRAND.inkFaint }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div
      className="rounded-2xl p-4 text-center"
      style={{ background: BRAND.surface2, border: `1px solid ${BRAND.inkGhost}` }}
    >
      <div className="text-[28px] font-bold tabular-nums" style={{ color: BRAND.blueBright }}>
        {value}
      </div>
      <div className="text-[11px] mt-1 leading-tight" style={{ color: BRAND.inkDim }}>
        {label}
      </div>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5 mb-5" style={{ background: BRAND.surface2, border: `1px solid ${BRAND.inkGhost}` }}>
      <div className="text-[15px] font-semibold mb-3">{title}</div>
      {children}
    </div>
  );
}