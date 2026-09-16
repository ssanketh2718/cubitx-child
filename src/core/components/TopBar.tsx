import { useApp } from '../store';
import Logo from './Logo';

export default function TopBar() {
  const user = useApp((s) => s.user);
  const streak = useApp((s) => s.getStreak());

  if (!user) return null;

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 px-5 py-4 border-b border-white/[0.06] bg-navy-900/80 backdrop-blur-xl">
      <Logo size={98} />

      <div className="flex items-center gap-2.5">
        {streak > 0 && (
          <div className="px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-200 text-xs font-bold">
            {streak} day{streak === 1 ? '' : 's'}
          </div>
        )}
        <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white text-xs font-bold">
          {user.name.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
