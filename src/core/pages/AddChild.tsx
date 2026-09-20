import { useState } from 'react';
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
};

const AVATARS = ['🦊', '🐼', '🦉', '🐯', '🐨', '🦁', '🐸', '🐧'];

export default function AddChild() {
  const navigate = useNavigate();
  const { children, addChild } = useAuth();
  const [name, setName] = useState('');
  const [classLevel, setClassLevel] = useState(5);
  const [avatar, setAvatar] = useState('🦊');
  const [schoolCode, setSchoolCode] = useState('');
  const [schoolLookup, setSchoolLookup] = useState<{ name: string; city: string | null } | null>(null);
  const [schoolError, setSchoolError] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(false);

  const checkSchool = async () => {
    const code = schoolCode.trim().toUpperCase();
    if (!code) {
      setSchoolLookup(null);
      setSchoolError('');
      return;
    }
    setChecking(true);
    const { data, error: err } = await supabase.rpc('lookup_school_by_parent_code', {
      p_code: code,
    });
    setChecking(false);
    if (err || !data || data.length === 0) {
      setSchoolLookup(null);
      setSchoolError('We could not find that code. Check with your school.');
      return;
    }
    setSchoolError('');
    setSchoolLookup(data[0]);
  };

  const handleSave = async () => {
    if (name.trim().length < 2) return setError('Please enter a name');

    setSaving(true);

    let schoolId: string | null = null;
    if (schoolCode.trim()) {
      const { data, error: err } = await supabase.rpc('lookup_school_by_parent_code', {
        p_code: schoolCode.trim().toUpperCase(),
      });
      if (!err && data && data.length > 0) {
        schoolId = data[0].id;
      }
    }

    const { error: err } = await addChild(name.trim(), classLevel, avatar, schoolId);
    setSaving(false);
    if (err) return setError(err);
    navigate('/');
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center px-5 py-12"
      style={{ background: BRAND.surface, color: BRAND.ink, fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      <div
        className="w-full max-w-md rounded-[1.75rem] p-8"
        style={{ background: BRAND.surface2, border: `1px solid ${BRAND.inkGhost}` }}
      >
        <div className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: BRAND.blueBright }}>
          Step {children.length + 1} of 3
        </div>
        <h1 className="mt-4 text-[26px] font-semibold">Who's playing?</h1>
        <p className="mt-3 text-[13.5px] leading-[1.7]" style={{ color: BRAND.inkDim }}>
          Add your child. They'll pick their name every time they play — no password for them.
        </p>

        <div className="mt-7">
          <label className="text-[12px] font-semibold" style={{ color: BRAND.inkDim }}>
            Child's name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Aarav"
            className="mt-2 w-full rounded-xl px-4 py-3.5 text-[14px] outline-none"
            style={{ background: 'rgba(0,0,0,0.2)', border: `1px solid ${BRAND.inkGhost}`, color: BRAND.ink }}
          />
        </div>

        <div className="mt-5">
          <label className="text-[12px] font-semibold" style={{ color: BRAND.inkDim }}>
            Class
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {[5, 6, 7, 8, 9, 10].map((c) => (
              <button
                key={c}
                onClick={() => setClassLevel(c)}
                className="rounded-full px-4 py-2 text-[13px] font-semibold transition"
                style={{
                  background: classLevel === c ? BRAND.blue : 'rgba(255,255,255,0.04)',
                  color: classLevel === c ? BRAND.surface : BRAND.inkDim,
                  border: `1px solid ${classLevel === c ? BRAND.blue : BRAND.inkGhost}`,
                }}
              >
                Class {c}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <label className="text-[12px] font-semibold" style={{ color: BRAND.inkDim }}>
            Pick an avatar
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {AVATARS.map((a) => (
              <button
                key={a}
                onClick={() => setAvatar(a)}
                className="h-11 w-11 rounded-full text-[22px] transition"
                style={{
                  background: avatar === a ? `${BRAND.blue}30` : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${avatar === a ? BRAND.blue : BRAND.inkGhost}`,
                }}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* School code */}
        <div className="mt-5">
          <label className="text-[12px] font-semibold" style={{ color: BRAND.inkDim }}>
            School code <span style={{ color: BRAND.inkFaint }}>(optional)</span>
          </label>
          <div className="mt-2 flex gap-2">
            <input
              value={schoolCode}
              onChange={(e) => { setSchoolCode(e.target.value); setSchoolLookup(null); setSchoolError(''); }}
              onBlur={checkSchool}
              placeholder="e.g., CUB-PUN-001"
              className="flex-1 rounded-xl px-4 py-3.5 text-[14px] outline-none uppercase tracking-wider"
              style={{ background: 'rgba(0,0,0,0.2)', border: `1px solid ${BRAND.inkGhost}`, color: BRAND.ink }}
            />
          </div>
          {checking && (
            <div className="text-[11.5px] mt-1.5" style={{ color: BRAND.inkFaint }}>Checking…</div>
          )}
          {schoolLookup && (
            <div
              className="mt-1.5 rounded-lg px-3 py-2 text-[12px]"
              style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399' }}
            >
              ✓ Linked to {schoolLookup.name}
              {schoolLookup.city ? ` (${schoolLookup.city})` : ''}
            </div>
          )}
          {schoolError && (
            <div className="text-[11.5px] mt-1.5" style={{ color: '#f87171' }}>{schoolError}</div>
          )}
          <div className="text-[11px] mt-1.5" style={{ color: BRAND.inkFaint }}>
            Ask your school for the code. Skip if you don't have one.
          </div>
        </div>

        {error && (
          <div
            className="mt-4 rounded-xl px-4 py-3 text-[12.5px]"
            style={{ background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171' }}
          >
            {error}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-7 w-full rounded-full py-3.5 text-[14px] font-bold transition disabled:opacity-40"
          style={{ background: BRAND.ink, color: BRAND.surface }}
        >
          {saving ? 'Saving…' : 'Save and start'}
        </button>

        {children.length > 0 && (
          <button
            onClick={() => navigate('/')}
            className="mt-3 block w-full text-center text-[12.5px]"
            style={{ color: BRAND.inkFaint }}
          >
            Skip — I'll add later
          </button>
        )}
      </div>
    </div>
  );
}