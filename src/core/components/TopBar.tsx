import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useChild } from '../auth/ChildContext';

export default function TopBar() {
  const navigate = useNavigate();
  const { children: kids, signOut, isDev } = useAuth();
  const { activeChild } = useChild();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const displayAvatar = activeChild?.avatar ?? '👤';
  const displayName = activeChild?.name ?? 'Menu';

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    navigate('/');
  };

  return (
    <div className="border-b border-white/[0.06] sticky top-0 z-40 bg-[#05091a]/95 backdrop-blur">
      <div className="max-w-2xl mx-auto flex items-center justify-between px-5 py-3.5">
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-2"
          aria-label="CubitX home"
        >
          <img src="/cubitx-logo.jpg" alt="CubitX" className="h-6 w-auto" />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] pl-1 pr-3 py-1 hover:bg-white/[0.06] transition"
            aria-label="Menu"
          >
            <span className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-[18px]">
              {displayAvatar}
            </span>
            <span className="text-[12.5px] font-semibold text-white/80 max-w-[90px] truncate">
              {displayName}
            </span>
            <span className="text-[10px] text-white/40">▾</span>
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-white/[0.08] bg-[#0a1228] shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden">
              {activeChild && (
                <div className="px-4 py-3 border-b border-white/[0.06]">
                  <div className="text-[10px] uppercase tracking-[0.14em] text-white/40 font-bold">
                    Playing as
                  </div>
                  <div className="mt-1 text-[14px] font-semibold text-white flex items-center gap-2">
                    <span>{activeChild.avatar}</span>
                    <span>{activeChild.name}</span>
                  </div>
                  <div className="text-[11.5px] text-white/50 mt-0.5">
                    Class {activeChild.class_level}
                  </div>
                </div>
              )}

              <button
                onClick={() => { setOpen(false); navigate('/parent'); }}
                className="w-full text-left px-4 py-3 text-[13.5px] text-white/85 hover:bg-white/[0.04] transition border-b border-white/[0.06]"
              >
                📈 Habits
              </button>

              {kids.length > 1 && (
                <button
                  onClick={() => { setOpen(false); navigate('/switch'); }}
                  className="w-full text-left px-4 py-3 text-[13.5px] text-white/85 hover:bg-white/[0.04] transition border-b border-white/[0.06]"
                >
                  🔄 Switch child
                </button>
              )}

              {kids.length < 3 && (
                <button
                  onClick={() => { setOpen(false); navigate('/add-child'); }}
                  className="w-full text-left px-4 py-3 text-[13.5px] text-white/85 hover:bg-white/[0.04] transition border-b border-white/[0.06]"
                >
                  ➕ Add another child
                </button>
              )}

              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-3 text-[13.5px] text-red-300 hover:bg-red-500/[0.08] transition"
              >
                {isDev ? '🧪 Exit dev mode' : '🚪 Sign out'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
