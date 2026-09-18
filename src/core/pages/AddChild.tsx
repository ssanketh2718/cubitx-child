import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const { children, addChild, signOut } = useAuth();
  const [name, setName] = useState('');
  const [classLevel, setClassLevel] = useState(5);
  const [avatar, setAvatar] = useState('🦊');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const hasChildren = children.length > 0;

  const handleBack = async () => {
    if (hasChildren) {
      navigate('/home');
    } else {
      await signOut();
      navigate('/');
    }
  };

  const handleSave = async () => {
    if (name.trim().length < 2) return setError('Please enter a name');
    setSaving(true);
    const { error: err } = await addChild(name.trim(), classLevel, avatar);
    setSaving(false);
    if (err) return setError(err);
    navigate(hasChildren ? '/home' : '/');
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
        {/* Back / Sign out */}
        <button
          onClick={handleBack}
          className="mb-6 flex items-center gap-1.5 text-[12.5px] font-semibold transition hover:text-white"
          style={{ color: BRAND.inkFaint }}
        >
          {hasChildren ? '← Back' : '← Sign out'}
        </button>

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

        {hasChildren && (
          <button
            onClick={() => navigate('/home')}
            className="mt-3 block w-full text-center text-[12.5px]"
            style={{ color: BRAND.inkFaint }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}