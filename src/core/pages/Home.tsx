import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { registry } from '../sdk';
import { useApp } from '../store';

export default function Home() {
  const navigate = useNavigate();
  const user = useApp((s) => s.user);
  const streak = useApp((s) => s.getStreak());
  const isDone = useApp((s) => s.isMissionDoneToday);
  const isTrialActive = useApp((s) => s.isTrialActive);
  const getTrialDaysLeft = useApp((s) => s.getTrialDaysLeft);
  const getActiveDay = useApp((s) => s.getActiveDay);
  const isDayComplete = useApp((s) => s.isDayComplete);
  const refreshDayUnlocks = useApp((s) => s.refreshDayUnlocks);

  // Runs on every Home visit — unlocks the next day if a calendar
  // day has passed since the previous day was completed.
  useEffect(() => {
    refreshDayUnlocks();
  }, [refreshDayUnlocks]);

  if (!user) return null;

  const trialActive = isTrialActive();
  const trialDaysLeft = getTrialDaysLeft();
  const activeDay = getActiveDay();
  const missions = registry.all();
  const doneCount = missions.filter((m) => isDone(m.id)).length;
  const dayComplete = isDayComplete(activeDay);
  const canPlay = trialActive;

  return (
    <div className="max-w-2xl mx-auto px-5">
      {/* Header */}
      <div className="mb-6">
        <div className="text-[13px] text-white/40 font-semibold tracking-tight">
          {user.name} · Class {user.grade} · Day {activeDay}
        </div>
        <div className="text-[26px] font-bold text-white mt-1.5 tracking-tight leading-tight">
          {!trialActive
            ? 'Your trial has ended.'
            : dayComplete
            ? 'You finished today. Come back tomorrow.'
            : "Ready for today's thinking?"}
        </div>
      </div>

      {/* Trial banner */}
      {trialActive && trialDaysLeft !== null && (
        <div className="rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/[0.08] to-transparent p-4 mb-4 flex items-center gap-3">
          <span className="text-2xl">⏳</span>
          <div className="flex-1">
            <div className="text-[13.5px] font-bold text-white">
              {trialDaysLeft} day{trialDaysLeft === 1 ? '' : 's'} left in trial
            </div>
            <div className="text-[11.5px] text-gold/80 font-semibold mt-0.5">
              Unlock all 30 days for ₹999/year
            </div>
          </div>
          <button
            onClick={() => navigate('/parent')}
            className="text-[12px] font-black px-3.5 py-2 rounded-full bg-gradient-to-br from-gold to-gold2 text-amber-950"
          >
            Upgrade
          </button>
        </div>
      )}

      {/* Streak card */}
      <div className="rounded-2xl border border-blue-400/15 bg-gradient-to-br from-blue-500/[0.08] to-transparent p-5 mb-5 flex items-center gap-4">
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

      {/* Progress within day */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-[11px] tracking-[0.08em] text-white/40 font-bold uppercase">
          Day {activeDay} · Today
        </div>
        <div className="text-[12px] text-white/40 font-semibold tabular-nums">
          {doneCount} / {missions.length}
        </div>
      </div>

      {/* Mission tiles */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {missions.map((m) => {
          const mDone = isDone(m.id);
          const locked = !canPlay && !mDone;
          return (
            <button
              key={m.id}
              onClick={() => !locked && navigate(`/mission/${m.id}`)}
              disabled={locked}
              className={`text-left rounded-2xl border p-5 transition-all duration-200 ${
                mDone
                  ? 'border-success/30 bg-success/[0.05]'
                  : locked
                  ? 'border-white/[0.04] bg-white/[0.01] opacity-40 cursor-not-allowed'
                  : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-blue-400/30 hover:-translate-y-0.5'
              }`}
            >
              <div className="text-[32px] mb-3 leading-none">
                {locked ? '🔒' : m.emoji}
              </div>
              <div className="text-[15px] font-bold text-white tracking-tight mb-1">
                {m.name}
              </div>
              <div className="text-[12px] text-white/40 font-medium leading-snug">
                {m.sub}
              </div>
              <div
                className={`inline-block mt-3 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                  mDone
                    ? 'bg-success/15 text-success'
                    : locked
                    ? 'bg-white/[0.05] text-white/30'
                    : 'bg-blue-500/10 text-blue-300'
                }`}
              >
                {mDone ? 'Done' : locked ? 'Locked' : 'Play now'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Day complete message */}
      {dayComplete && trialActive && (
        <div className="rounded-2xl border border-mint/25 bg-gradient-to-br from-mint/[0.08] to-transparent p-5 text-center">
          <div className="text-[24px] mb-2">🌟</div>
          <div className="text-[14px] font-bold text-white mb-1">
            All missions for Day {activeDay} complete
          </div>
          <div className="text-[12.5px] text-white/50 font-semibold">
            Day {activeDay + 1} unlocks tomorrow at midnight
          </div>
        </div>
      )}

      {/* Trial expired paywall */}
      {!trialActive && (
        <div className="rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/[0.08] to-transparent p-6 text-center">
          <div className="text-[36px] mb-3">🎓</div>
          <div className="text-[16px] font-bold text-white mb-2">
            Unlock CubitX for ₹999/year
          </div>
          <div className="text-[13px] text-white/50 font-semibold mb-4">
            Your child's 30-day trial has ended. Keep going for less than ₹3/day.
          </div>
          <button
            onClick={() => navigate('/parent')}
            className="px-8 py-3.5 rounded-full font-black text-[14px] bg-gradient-to-br from-gold to-gold2 text-amber-950 shadow-[0_10px_30px_rgba(255,157,46,0.45)]"
          >
            Continue Learning
          </button>
        </div>
      )}
    </div>
  );
}