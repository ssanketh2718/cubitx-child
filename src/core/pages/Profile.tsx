import { useApp } from '../store';
import { registry } from '../sdk';

export default function Profile() {
  const user = useApp((s) => s.user);
  const events = useApp((s) => s.events);
  const streak = useApp((s) => s.getStreak());

  if (!user) return null;

  const totalMissions = registry.count();
  const completedRounds = events.filter((e) => e.type === 'round_completed').length;

  return (
    <div className="max-w-2xl mx-auto px-5">
      <div className="mb-10">
        <div className="text-[11px] tracking-[0.08em] text-white/40 font-bold uppercase mb-2">
          Thinking profile
        </div>
        <h1 className="text-[28px] font-bold tracking-tight text-white leading-tight">
          {user.name}
        </h1>
        <p className="text-[13px] text-white/40 font-medium mt-1">
          Class {user.grade} · {streak}-day streak
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="text-[11px] tracking-[0.08em] text-white/40 font-bold uppercase mb-3">
            Missions
          </div>
          <div className="text-[38px] font-bold text-blue-400 leading-none tabular-nums">
            {totalMissions}
          </div>
        </div>
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="text-[11px] tracking-[0.08em] text-white/40 font-bold uppercase mb-3">
            Rounds
          </div>
          <div className="text-[38px] font-bold text-white leading-none tabular-nums">
            {completedRounds}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
        <div className="text-[11px] tracking-[0.08em] text-white/40 font-bold uppercase mb-2">
          Reasoning trace
        </div>
        <div className="text-[14px] text-white/60 font-medium leading-relaxed">
          {events.length} events captured. This becomes your child's
          thinking profile once analytics is live.
        </div>
      </div>
    </div>
  );
}
