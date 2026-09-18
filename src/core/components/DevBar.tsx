// src/core/components/DevBar.tsx
import { useAuth } from '../auth/AuthContext';
import { useChild } from '../auth/ChildContext';

export default function DevBar() {
  const { session, signOut, isDev } = useAuth();
  const { activeChild } = useChild();

  if (!session) return null;

  return (
    <div className="fixed bottom-3 left-3 z-50 flex items-center gap-3 rounded-full bg-black/85 backdrop-blur-md border border-white/20 px-3.5 py-2 text-[11px] text-white/80 shadow-lg">
      <span className="font-bold">
        {isDev ? '🧪 DEV' : '✓ Live'}
      </span>

      {activeChild && (
        <span className="text-white/50">
          {activeChild.avatar} {activeChild.name}
        </span>
      )}

      <button
        onClick={async () => { await signOut(); }}
        className="underline text-white/60 hover:text-white transition"
      >
        {isDev ? 'exit dev' : 'sign out'}
      </button>
    </div>
  );
}
