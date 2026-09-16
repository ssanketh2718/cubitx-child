import { useNavigate } from 'react-router-dom';
import { registry } from '../sdk';
import { useApp } from '../store';

export default function Home() {
  const navigate = useNavigate();
  const user = useApp((s) => s.user);
  const streak = useApp((s) => s.getStreak());
  const isDone = useApp((s) => s.isMissionDoneToday);

  const missions = registry.all();
  const doneCount = missions.filter((m) => isDone(m.id)).length;

  if (!user) return null;

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
