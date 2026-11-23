import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useChild } from '../auth/ChildContext';
import { triggerDialTick } from '../lib/tactileFeedback';
import ParentLockModal from './ParentLockModal';

type ParentRoute = '/parent' | '/try-at-home';

export default function TopBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, signOut } = useAuth();
  const { activeChild } = useChild();

  const [showGate, setShowGate] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<ParentRoute>('/parent');

  const firstName = activeChild?.name?.trim().split(/\s+/)[0] || 'Explorer';
  const initialLetter = firstName.charAt(0).toUpperCase();
  const currentPath = location.pathname;

  const brainMapLabel = activeChild?.name?.trim()
    ? `${firstName}'s Brain Mapping`
    : "Your Kid's Brain Map";

  const openParentRoute = (target: ParentRoute) => {
    triggerDialTick(true);
    if (currentPath === target) return;

    if (sessionStorage.getItem('parent_gate_unlocked') === 'true') {
      navigate(target);
    } else {
      setPendingRoute(target);
      setShowGate(true);
    }
  };

  const navItems = [
    {
      label: 'Thinking Missions',
      active: currentPath === '/home' || currentPath.startsWith('/play'),
      onClick: () => {
        triggerDialTick(false);
        navigate('/home');
      },
      locked: false,
    },
    {
      label: 'Chapter Challenges',
      active: currentPath === '/sheets',
      onClick: () => {
        triggerDialTick(false);
        navigate('/sheets');
      },
      locked: false,
    },
    {
      label: brainMapLabel,
      active: currentPath === '/parent',
      onClick: () => openParentRoute('/parent'),
      locked: true,
    },
    {
      label: 'For Parents',
      active: currentPath === '/try-at-home',
      onClick: () => openParentRoute('/try-at-home'),
      locked: true,
    },
    {
      label: 'Profile',
      active: currentPath === '/profile',
      onClick: () => {
        triggerDialTick(false);
        navigate('/profile');
      },
      locked: false,
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#030917]/95 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* EXACT CUBITX LOGO */}
            <button
              type="button"
              onClick={() => navigate('/home')}
              className="flex items-center text-left cursor-pointer shrink-0"
            >
              <img
                src="/cubitx-logo.jpg"
                alt="CubitX"
                className="h-8 sm:h-9 w-auto object-contain"
              />
            </button>

            {/* UNIFIED CENTER NAV (DESKTOP) */}
            {session && (
              <nav
                aria-label="Main navigation"
                className="hidden lg:flex items-center gap-1"
              >
                {navItems.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.onClick}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                      item.active
                        ? 'bg-[#8FA8FF] text-[#030917] font-extrabold'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            )}

            {/* RIGHT ACTIONS */}
            <div className="flex items-center gap-2.5">
              {session && (
                <button
                  type="button"
                  onClick={() => navigate('/switch')}
                  title="Switch child"
                  className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 py-1 pl-1.5 pr-3 hover:border-white/35 transition cursor-pointer"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8FA8FF] font-display text-[11px] font-extrabold text-[#030917]">
                    {initialLetter}
                  </span>
                  <span className="text-xs font-semibold text-white">
                    {firstName}
                  </span>
                </button>
              )}

              {session ? (
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition cursor-pointer"
                >
                  Sign out
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/signin')}
                  className="cx-action-pill bg-[#8FA8FF] px-4 py-2 text-xs font-extrabold text-[#030917] hover:bg-white cursor-pointer"
                >
                  Sign in
                </button>
              )}
            </div>
          </div>

          {/* CLEAN TOP SUB-BAR ON MOBILE / TABLET */}
          {session && (
            <nav
              aria-label="Mobile navigation"
              className="flex lg:hidden items-center gap-1.5 overflow-x-auto pb-3 pt-0.5 no-scrollbar"
            >
              {navItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.onClick}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                    item.active
                      ? 'bg-[#8FA8FF] text-[#030917] font-extrabold'
                      : 'border border-white/15 bg-white/10 text-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          )}
        </div>
      </header>

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