import { useNavigate } from 'react-router-dom';
import { registry } from '../sdk';
import { useApp } from '../store';

export default function Home() {
  const navigate = useNavigate();
  const user = useApp((s) => s.user);
  const streak = useApp((s) => s.getStreak());
  const isDone = useApp((s) => s.isMissionDoneToday);

  if (!user) return null;

  const userTier = user.tier;

  const missions = registry.all().filter((m) =>
    m.tiers.includes(userTier)
  );

  const doneCount = missions.filter((m) => isDone(m.id)).length;

  /* ---------- Foundation tier: coming soon ---------- */
  if (userTier === 'foundation') {
    return (
      <div className="max-w-md mx-auto px-5 pt-8 text-center">
        <div className="text-[80px] leading-none mb-4 animate-float">🎈</div>

        <div className="text-[13px] text-white/40 font-extrabold tracking-widest uppercase mb-2">
          Welcome, {user.name}
        </div>

        <h1 className="text-[26px] font-black text-white mb-3 leading-tight">
          Your missions are
          <br />
          being built!
        </h1>

        <p className="text-[15px] text-white/50 font-semibold leading-relaxed mb-8 max-w-xs mx-auto">
          We're creating special thinking games
          for Class 5–7. They'll be ready very soon.
        </p>

        <div className="rounded-2xl border border-gold/30 bg-gold/[0.06] p-5 mb-6 text-left">
          <div className="text-[11px] tracking-widest text-gold font-black uppercase mb-3">
            🔮 Coming soon
          </div>
          <div className="flex flex-col gap-3 text-[14px] font-bold text-white/85 leading-snug">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🧩</span>
              <span>Riddles that make you think</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🐾</span>
              <span>Puzzles with hidden rules</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎨</span>
              <span>Games about what's really happening</span>
            </div>
          </div>
        </div>

        <div className="text-[12px] text-white/40 font-bold leading-relaxed">
          Check back soon. We'll let you know!
        </div>

        {/* Streak still shows if they have one */}
        {streak > 0 && (
          <div className="mt-8 rounded-2xl border border-blue-400/20 bg-blue-500/[0.06] p-4">
            <div className="text-[12px] text-white/50 font-extrabold tracking-widest uppercase mb-1">
              🔥 Streak
            </div>
            <div className="text-[24px] font-black text-blue-300">
              {streak} day{streak === 1 ? '' : 's'}
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ---------- Advanced tier: normal home ---------- */
  return (
    <div className="max-w-2xl mx-auto px-5">
      <div className="mb-8">
        <div className="text-[13px] text-white/40 font-semibold tracking-tight">
          {user.name} · Class {user.grade}
        </div>
        <div className="text-[26px] font-bold text-white mt-1.5 tracking-tight leading-tight">
          {doneCount >= missions.length
            ? 'Done for today.'
            : "Ready for today's thinking?"}
        </div>
      </div>

      <div className="rounded-2xl border border-blue-400/15 bg-gradient-to-br from-blue-500/[0.08] to-transparent p-5 mb-7">
        <div className="flex items-center gap-4">
          <div className="text-[40px] leading-none font-bold text-blue-400 tabular-nums">
            {streak}
          </div>
          <div className="flex-1">
            <div className="text-[14px] font-semibold text-white tracking-tight">
              day{streak === 1 ? '' : 's'} in a row
            </div>
            <div className="text-[12px] text-white/40 font-medium mt-0.5">
              {streak === 0
                ? 'Complete 1 mission to start'
                : 'Keep it alive tomorrow'}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="text-[11px] tracking-[0.08em] text-white/40 font-bold uppercase">
          Today
        </div>
        <div className="text-[12px] text-white/40 font-semibold tabular-nums">
          {doneCount} / {missions.length}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {missions.map((m) => {
          const mDone = isDone(m.id);
          return (
            <button
              key={m.id}
              onClick={() => navigate(`/mission/${m.id}`)}
              className={`text-left rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5 ${
                mDone
                  ? 'border-success/20 bg-success/[0.04]'
                  : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-blue-400/30'
              }`}
            >
              <div className="text-[32px] mb-3 leading-none">{m.emoji}</div>
              <div className="text-[15px] font-bold text-white tracking-tight mb-1">
                {m.name}
              </div>
              <div className="text-[12px] text-white/40 font-medium leading-snug">
                {m.sub}
              </div>
              <div
                className={`inline-block mt-3 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                  mDone
                    ? 'bg-success/10 text-success'
                    : 'bg-blue-500/10 text-blue-300'
                }`}
              >
                {mDone ? 'Done' : 'Play now'}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
