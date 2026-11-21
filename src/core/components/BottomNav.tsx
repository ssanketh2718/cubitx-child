import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { triggerDialTick } from '../lib/tactileFeedback';
import ParentLockModal from './ParentLockModal';

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const currentPath = location.pathname;

  const [showGate, setShowGate] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<'/parent' | '/try-at-home'>(
    '/parent'
  );

  const handleParentRouteClick = (target: '/parent' | '/try-at-home') => {
    triggerDialTick(true);
    if (currentPath === target) return;

    if (sessionStorage.getItem('parent_gate_unlocked') === 'true') {
      navigate(target);
    } else {
      setPendingRoute(target);
      setShowGate(true);
    }
  };

  return (
    <>
      <div className="pointer-events-none fixed bottom-5 left-0 right-0 z-40 flex justify-center px-3">
        <nav
          aria-label="Primary navigation"
          className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/15 bg-[#142033]/95 p-1.5 text-white shadow-2xl backdrop-blur-xl"
        >
          <button
            type="button"
            onClick={() => {
              triggerDialTick(true);
              navigate('/home');
            }}
            className={`rounded-full px-3 sm:px-4 py-2.5 text-[11px] sm:text-xs font-extrabold tracking-wide transition cursor-pointer ${
              currentPath === '/home' || currentPath.startsWith('/play')
                ? 'bg-[#55E2CE] text-[#142033]'
                : 'text-white/75 hover:text-white'
            }`}
          >
            Missions
          </button>

          <button
            type="button"
            onClick={() => {
              triggerDialTick(true);
              navigate('/sheets');
            }}
            className={`rounded-full px-3 sm:px-4 py-2.5 text-[11px] sm:text-xs font-extrabold tracking-wide transition cursor-pointer ${
              currentPath === '/sheets'
                ? 'bg-[#55E2CE] text-[#142033]'
                : 'text-white/75 hover:text-white'
            }`}
          >
            Sheets
          </button>

          <button
            type="button"
            onClick={() => handleParentRouteClick('/parent')}
            className={`rounded-full px-3 sm:px-4 py-2.5 text-[11px] sm:text-xs font-extrabold tracking-wide transition cursor-pointer ${
              currentPath === '/parent'
                ? 'bg-[#F5B942] text-[#142033]'
                : 'text-white/75 hover:text-white'
            }`}
          >
            Parent
          </button>

          <button
            type="button"
            onClick={() => handleParentRouteClick('/try-at-home')}
            className={`rounded-full px-3 sm:px-4 py-2.5 text-[11px] sm:text-xs font-extrabold tracking-wide transition cursor-pointer ${
              currentPath === '/try-at-home'
                ? 'bg-[#087F80] text-white'
                : 'text-white/75 hover:text-white'
            }`}
          >
            Home
          </button>

          <button
            type="button"
            onClick={() => {
              triggerDialTick(true);
              navigate('/profile');
            }}
            className={`rounded-full px-3 sm:px-4 py-2.5 text-[11px] sm:text-xs font-extrabold tracking-wide transition cursor-pointer ${
              currentPath === '/profile'
                ? 'bg-white text-[#142033]'
                : 'text-white/75 hover:text-white'
            }`}
          >
            Profile
          </button>
        </nav>
      </div>

      <ParentLockModal
        open={showGate}
        onClose={() => setShowGate(false)}
        onUnlocked={() => {
          setShowGate(false);
          navigate(pendingRoute);
        }}
        onForgotReset={() => {
          setShowGate(false);
          void signOut();
        }}
      />
    </>
  );
}