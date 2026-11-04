import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useChild } from '../auth/ChildContext';

export default function TopBar() {
  const navigate = useNavigate();
  const { session, signOut } = useAuth();
  const { activeChild } = useChild();

  const firstName = activeChild?.name?.trim().split(/\s+/)[0] || 'Explorer';
  const initialLetter = firstName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF9F5]/90 backdrop-blur-md border-b border-[#E7E5E0] px-4 py-3">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        {/* Brand Link — Single Clean Logo with no duplicate text */}
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-3 cursor-pointer group text-left"
        >
          <img
            src="/cubitx-logo.jpg"
            alt="CubitX"
            className="h-8 w-auto rounded-lg shadow-sm border border-[#E7E5E0]"
          />
          <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 border-l border-slate-300 pl-3">
            Thinking Adventures
          </span>
        </button>

        {/* User Identity & Account Actions */}
        <div className="flex items-center gap-3">
          {session && (
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 bg-white border border-[#E7E5E0] hover:border-purple-300 px-3 py-1.5 rounded-xl shadow-sm transition cursor-pointer"
            >
              <div className="w-6 h-6 rounded-lg bg-[#111827] text-white flex items-center justify-center text-xs font-black">
                {initialLetter}
              </div>
              <span className="text-xs font-extrabold text-[#111827]">
                {firstName}
              </span>
            </button>
          )}

          {session ? (
            <button
              onClick={() => signOut()}
              className="text-xs font-bold text-slate-500 hover:text-[#111827] transition px-2 py-1 cursor-pointer"
            >
              Sign Out
            </button>
          ) : (
            <button
              onClick={() => navigate('/signin')}
              className="text-xs font-bold bg-[#111827] text-white px-3.5 py-1.5 rounded-xl hover:bg-[#6D28D9] transition shadow-sm cursor-pointer"
            >
              Log In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}