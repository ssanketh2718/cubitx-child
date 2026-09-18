import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useChild } from '../auth/ChildContext';

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

export default function WhoIsPlaying() {
  const navigate = useNavigate();
  const { children: kids, signOut } = useAuth();
  const { setActiveChild, activeChild } = useChild();

  const canGoBack = !!activeChild;

  return (
    <div
      className="flex min-h-screen items-center justify-center px-5 py-12"
      style={{ background: BRAND.surface, color: BRAND.ink, fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      <div className="w-full max-w-md">
        {canGoBack && (
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-1.5 text-[12.5px] font-semibold transition hover:text-white"
            style={{ color: BRAND.inkFaint }}
          >
            ← Back
          </button>
        )}

        <img src="/cubitx-logo.jpg" alt="CubitX" className="mx-auto h-9 w-auto mb-8" />

        <h1 className="text-center text-[26px] font-semibold">Who's playing?</h1>
        <p className="mt-2 text-center text-[13.5px]" style={{ color: BRAND.inkDim }}>
          Pick a child to start today's thinking
        </p>

        <div className="mt-8 grid gap-3">
          {kids.map((child) => (
            <button
              key={child.id}
              onClick={() => {
                setActiveChild(child);
                navigate('/home');
              }}
              className="flex items-center gap-4 rounded-2xl p-5 text-left transition-transform hover:-translate-y-0.5"
              style={{
                background: BRAND.surface2,
                border: `1px solid ${BRAND.inkGhost}`,
              }}
            >
              <span className="text-[36px] leading-none">{child.avatar}</span>
              <div className="flex-1">
                <div className="text-[17px] font-semibold">{child.name}</div>
                <div className="text-[12px] mt-0.5" style={{ color: BRAND.inkDim }}>
                  Class {child.class_level}
                </div>
              </div>
              <span className="text-[18px]" style={{ color: BRAND.blueBright }}>→</span>
            </button>
          ))}
        </div>

        {kids.length < 3 && (
          <button
            onClick={() => navigate('/add-child')}
            className="mt-4 w-full rounded-2xl p-4 text-[13.5px] font-semibold transition hover:bg-white/[0.04]"
            style={{
              border: `1px dashed ${BRAND.inkGhost}`,
              color: BRAND.inkDim,
            }}
          >
            ➕ Add another child
          </button>
        )}

        <button
          onClick={async () => { await signOut(); navigate('/'); }}
          className="mt-8 block w-full text-center text-[12px]"
          style={{ color: BRAND.inkFaint }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}