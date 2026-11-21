import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useChild } from '../auth/ChildContext';
import { triggerDialTick, triggerSoftConfirm } from '../lib/tactileFeedback';

export default function WhoIsPlaying() {
  const navigate = useNavigate();
  const { children: kids, signOut } = useAuth();
  const { setActiveChild, activeChild } = useChild();

  const canGoBack = Boolean(activeChild);

  return (
    <div className="min-h-screen bg-[#F7F6F1] text-[#142033] flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md space-y-8">
        {canGoBack && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#586579] hover:text-[#142033] transition cursor-pointer"
          >
            ← Back
          </button>
        )}

        {/* BRAND + HEADER */}
        <header className="text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#142033] font-display text-sm font-extrabold text-[#55E2CE] shadow-md">
            CX
          </div>
          <div className="space-y-1">
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#142033]">
              Who’s playing?
            </h1>
            <p className="text-sm text-[#586579]">
              Pick a profile to start today’s missions.
            </p>
          </div>
        </header>

        {/* CHILD PROFILE LIST */}
        <div className="space-y-3">
          {kids.map((child) => (
            <button
              key={child.id}
              type="button"
              onClick={() => {
                triggerSoftConfirm(true);
                setActiveChild(child);
                navigate('/home');
              }}
              className="group w-full flex items-center gap-4 rounded-3xl border border-[#142033]/12 bg-white p-5 text-left shadow-[var(--shadow-artifact)] transition hover:-translate-y-0.5 hover:border-[#087F80] cursor-pointer"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#F7F6F1] text-3xl leading-none">
                {child.avatar}
              </span>

              <div className="flex-1 min-w-0">
                <div className="font-display text-lg font-extrabold text-[#142033] truncate">
                  {child.name}
                </div>
                <div className="mt-0.5 font-mono-tech text-xs font-semibold text-[#586579]">
                  Class {child.class_level}
                  {child.board ? ` · ${child.board}` : ''}
                </div>
              </div>

              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#142033] text-sm font-bold text-[#55E2CE] transition group-hover:bg-[#087F80] group-hover:text-white">
                →
              </span>
            </button>
          ))}
        </div>

        {/* ADD CHILD & SIGN OUT */}
        <div className="space-y-4 pt-2">
          {kids.length < 3 && (
            <button
              type="button"
              onClick={() => {
                triggerDialTick(true);
                navigate('/add-child');
              }}
              className="w-full rounded-3xl border border-dashed border-[#142033]/25 bg-transparent py-4 text-xs font-extrabold text-[#142033] hover:border-[#087F80] hover:text-[#087F80] transition cursor-pointer"
            >
              + Add another child
            </button>
          )}

          <button
            type="button"
            onClick={async () => {
              await signOut();
              navigate('/');
            }}
            className="block w-full text-center text-xs font-semibold text-[#586579] hover:text-[#142033] transition cursor-pointer"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}