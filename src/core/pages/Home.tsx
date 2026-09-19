import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { loadDayConfig } from '../../missions/curriculum';
import { curriculumTierFrom } from '../../missions/tiers';
import { isDevMode } from '../auth/devMode';
import type { DayItem } from '../../missions/types';
import { PAYMENT_LINK } from '../config';

function itemKey(tier: number, day: number, idx: number): string {
  return `t${tier}:d${day}:i${idx}`;
}

export default function Home() {
  const navigate = useNavigate();
  const user = useApp((s) => s.user);
  const streak = useApp((s) => s.getStreak());
  const isItemDone = useApp((s) => s.isItemDoneToday);
  const isTrialActive = useApp((s) => s.isTrialActive);
  const getTrialDaysLeft = useApp((s) => s.getTrialDaysLeft);
  const getActiveDay = useApp((s) => s.getActiveDay);
  const isDayComplete = useApp((s) => s.isDayComplete);
  const refreshDayUnlocks = useApp((s) => s.refreshDayUnlocks);
  const devDayOverride = useApp((s) => s.devDayOverride);
  const setDevDayOverride = useApp((s) => s.setDevDayOverride);

  useEffect(() => {
    refreshDayUnlocks();
  }, [refreshDayUnlocks]);

  if (!user) return null;

  const trialActive = isTrialActive();
  const trialDaysLeft = getTrialDaysLeft();
  const activeDay = getActiveDay();
  const curriculumTier = curriculumTierFrom(user.tier);
  const dayConfig = loadDayConfig(curriculumTier, activeDay);
  const items: DayItem[] = dayConfig?.items ?? [];
  const requiredCount = items.length;
  const doneCount = items.filter((_, idx) =>
    isItemDone(itemKey(curriculumTier, activeDay, idx))
  ).length;
  const dayComplete = isDayComplete(activeDay);
  const canPlay = trialActive;
  const hasContent = items.length > 0;
  const tierLabel = curriculumTier === 1 ? 'Classes 5–7' : 'Classes 8–10';

  const dev = isDevMode();

  const openPayment = () => {
    window.open(PAYMENT_LINK, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-2xl mx-auto px-5">
      {dev && (
        <div
          className="mb-5 rounded-2xl p-4"
          style={{ background: 'rgba(123,141,255,0.08)', border: '1px solid rgba(123,141,255,0.35)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: '#9aaaff' }}>
              🧪 Dev · Jump to day
            </div>
            {devDayOverride !== null && (
              <button
                onClick={() => setDevDayOverride(null)}
                className="text-[11px] font-semibold underline"
                style={{ color: '#9aaaff' }}
              >
                reset to natural
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => {
              const cfg = loadDayConfig(curriculumTier, d);
              const hasItems = !!(cfg && cfg.items.length > 0);
              const isCurrent = d === activeDay;
              const isComplete = isDayComplete(d);

              // Priority: complete → green | current → blue | has content → neutral | empty → dim
              let bg = 'rgba(255,255,255,0.02)';
              let color = 'rgba(255,255,255,0.25)';
              let border = 'rgba(255,255,255,0.12)';
              let cursor: 'pointer' | 'not-allowed' = 'not-allowed';

              if (isComplete) {
                bg = 'rgba(52,211,153,0.18)';
                color = '#34d399';
                border = 'rgba(52,211,153,0.5)';
                cursor = 'pointer';
              } else if (isCurrent) {
                bg = '#7b8dff';
                color = '#05091a';
                border = '#7b8dff';
                cursor = 'pointer';
              } else if (hasItems) {
                bg = 'rgba(255,255,255,0.06)';
                color = '#fff';
                border = 'rgba(255,255,255,0.12)';
                cursor = 'pointer';
              }

              return (
                <button
                  key={d}
                  onClick={() => hasItems && setDevDayOverride(d)}
                  disabled={!hasItems}
                  className="w-8 h-8 rounded-lg text-[11px] font-bold transition relative"
                  style={{ background: bg, color, border: `1px solid ${border}`, cursor }}
                  title={
                    isComplete
                      ? `Day ${d} — finished`
                      : hasItems
                      ? `Day ${d}`
                      : `Day ${d} — no content`
                  }
                >
                  {d}
                  {isComplete && (
                    <span
                      className="absolute -top-1 -right-1 text-[9px] leading-none"
                      style={{ color: '#34d399' }}
                    >
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="text-[10.5px] mt-2.5 flex flex-wrap gap-x-3 gap-y-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <span>🔵 current</span>
            <span>🟢 finished</span>
            <span>⬜ has content</span>
            <span>▫️ empty</span>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="text-[13px] text-white/40 font-semibold tracking-tight">
          {user.name} · Class {user.grade} · Day {activeDay}
          {dev && devDayOverride !== null && (
            <span className="ml-2 text-[10.5px] px-2 py-0.5 rounded-full bg-[#7b8dff]/20 text-[#9aaaff]">
              dev override
            </span>
          )}
        </div>
        <div className="text-[26px] font-bold text-white mt-1.5 tracking-tight leading-tight">
          {!trialActive
            ? 'Your trial has ended.'
            : dayComplete
            ? 'You finished today. Come back tomorrow.'
            : hasContent
            ? "Ready for today's thinking?"
            : `Day ${activeDay} is warming up.`}
        </div>
      </div>

      {trialActive && trialDaysLeft !== null && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 mb-4 flex items-center gap-3">
          <span className="text-2xl">⏳</span>
          <div className="flex-1">
            <div className="text-[13.5px] font-bold text-white">
              {trialDaysLeft} day{trialDaysLeft === 1 ? '' : 's'} left in trial
            </div>
            <div className="text-[11.5px] text-white/50 font-semibold mt-0.5">
              Unlock all 30 days for ₹999/year
            </div>
          </div>
          <button
            onClick={openPayment}
            className="text-[12px] font-black px-3.5 py-2 rounded-full bg-white text-[#05091a]"
          >
            Upgrade
          </button>
        </div>
      )}

      <div className="rounded-2xl border border-[#7b8dff]/15 bg-[#7b8dff]/[0.06] p-5 mb-5 flex items-center gap-4">
        <div className="text-[40px] leading-none font-bold text-[#9aaaff] tabular-nums">
          {streak}
        </div>
        <div className="flex-1">
          <div className="text-[14px] font-semibold text-white tracking-tight">
            day{streak === 1 ? '' : 's'} in a row
          </div>
          <div className="text-[12px] text-white/40 font-medium mt-0.5">
            {streak === 0 ? 'Complete 1 item to start' : 'Keep it alive tomorrow'}
          </div>
        </div>
      </div>

      {dayConfig?.label && (
        <div className="text-[11px] tracking-[0.08em] text-[#9aaaff] font-bold uppercase mb-3">
          {dayConfig.label}
        </div>
      )}

      {hasContent && (
        <div className="flex items-center justify-between mb-3">
          <div className="text-[11px] tracking-[0.08em] text-white/40 font-bold uppercase">
            Day {activeDay} · Today
          </div>
          <div className="text-[12px] text-white/40 font-semibold tabular-nums">
            {doneCount} / {requiredCount}
          </div>
        </div>
      )}

      {hasContent ? (
        <div className="grid grid-cols-2 gap-3 mb-6">
          {items.map((item, idx) => {
            const id = itemKey(curriculumTier, activeDay, idx);
            const itemDone = isItemDone(id);
            const locked = !canPlay && !itemDone;
            return (
              <button
                key={id}
                onClick={() =>
                  !locked && navigate(`/play/${curriculumTier}/${activeDay}/${idx}`)
                }
                disabled={locked}
                className={`text-left rounded-2xl border p-5 transition-all duration-200 ${
                  itemDone
                    ? 'border-emerald-400/30 bg-emerald-400/[0.05]'
                    : locked
                    ? 'border-white/[0.04] bg-white/[0.01] opacity-40 cursor-not-allowed'
                    : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-[#7b8dff]/30 hover:-translate-y-0.5'
                }`}
              >
                <div className="text-[32px] mb-3 leading-none">
                  {locked ? '🔒' : itemEmoji(item)}
                </div>
                <div className="text-[15px] font-bold text-white tracking-tight mb-1">
                  {itemTitle(item)}
                </div>
                <div className="text-[12px] text-white/40 font-medium leading-snug">
                  {itemSub(item)}
                </div>
                <div
                  className={`inline-block mt-3 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    itemDone
                      ? 'bg-emerald-400/15 text-emerald-400'
                      : locked
                      ? 'bg-white/[0.05] text-white/30'
                      : 'bg-[#7b8dff]/10 text-[#9aaaff]'
                  }`}
                >
                  {itemDone ? 'Done' : locked ? 'Locked' : 'Play now'}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 mb-6 text-center">
          <div className="text-[36px] mb-3">🗓️</div>
          <div className="text-[14px] font-bold text-white mb-1.5">
            Day {activeDay} content is being prepared
          </div>
          <div className="text-[12.5px] text-white/40 font-semibold leading-relaxed">
            Come back soon — new thinking missions for {tierLabel} are on the way.
          </div>
        </div>
      )}

      {dayComplete && trialActive && (
        <div className="rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.06] p-5 text-center">
          <div className="text-[24px] mb-2">🌟</div>
          <div className="text-[14px] font-bold text-white mb-1">
            All items for Day {activeDay} complete
          </div>
          <div className="text-[12.5px] text-white/50 font-semibold">
            Day {activeDay + 1} unlocks tomorrow at midnight
          </div>
        </div>
      )}

      {!trialActive && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
          <div className="text-[36px] mb-3">🎓</div>
          <div className="text-[16px] font-bold text-white mb-2">
            Unlock CubitX for ₹999/year
          </div>
          <div className="text-[13px] text-white/50 font-semibold mb-4">
            Your child's 30-day trial has ended. Keep going for less than ₹3/day.
          </div>
          <button
            onClick={openPayment}
            className="px-8 py-3.5 rounded-full font-black text-[14px] bg-white text-[#05091a]"
          >
            Continue Learning
          </button>
        </div>
      )}
    </div>
  );
}

function itemEmoji(item: DayItem): string {
  switch (item.engine) {
    case 'm1': return '🔢';
    case 'm2': return '⚖️';
    case 'm3': return '🔮';
    case 'm4': return '🎯';
    case 'm5': return '💭';
    case 'math': return '🔢';
    case 'opinion': return '🗣️';
    case 'creative': return '✨';
    case 'watch': return '🎬';
  }
}

function itemTitle(item: DayItem): string {
  switch (item.engine) {
    case 'm1': return 'Secret Machine';
    case 'm2': return 'Balance Detective';
    case 'm3': return 'Pattern Detective';
    case 'm4': return 'Cause Detective';
    case 'm5': return 'Big Question';
    case 'math': return item.title;
    case 'opinion': return 'Your Opinion';
    case 'creative': return 'Create';
    case 'watch': return 'Watch & Think';
  }
}

function itemSub(item: DayItem): string {
  switch (item.engine) {
    case 'm1': return 'Find the rule';
    case 'm2': return 'Which shape is heaviest?';
    case 'm3': return 'Pattern or noise?';
    case 'm4': return 'Correlation or cause?';
    case 'm5': return 'Which and why?';
    case 'math': return 'Test it, find the rule';
    case 'opinion': return 'What do you think?';
    case 'creative': return 'Make something new';
    case 'watch': return 'A short film + a question';
  }
}