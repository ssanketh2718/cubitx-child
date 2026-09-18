// src/core/pages/WhoIsPlaying.tsx
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
  const { children: kids, signOut } = useAuth();
  const { setActiveChild } = useChild();

  return (
    <div
      className="flex min-h-screen items-center justify-center px-5 py-12"
      style={{ background: BRAND.surface, color: BRAND.ink, fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      <div className="w-full max-w-md">
        <img src="/cubitx-logo.jpg" alt="CubitX" className="mx-auto h-9 w-auto mb-8" />

        <h1 className="text-center text-[26px] font-semibold">Who's playing?</h1>
        <p className="mt-2 text-center text-[13.5px]" style={{ color: BRAND.inkDim }}>
          Pick a child to start today's thinking
        </p>

        <div className="mt-8 grid gap-3">
          {kids.map((child) => (
            <button
              key={child.id}
              onClick={() => setActiveChild(child)}
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

        <button
          onClick={signOut}
          className="mt-8 block w-full text-center text-[12px]"
          style={{ color: BRAND.inkFaint }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
