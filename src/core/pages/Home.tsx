import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { loadDayConfig } from '../../missions/curriculum';
import { curriculumTierFrom } from '../../missions/tiers';
import { isDevMode } from '../auth/devMode';
import type { DayItem } from '../../missions/types';
import { PAYMENT_LINK } from '../config';
import { supabase } from '../lib/supabase';

function itemKey(tier: number, day: number, idx: number): string {
  return `t${tier}:d${day}:i${idx}`;
}

// 7-day organic serpentine trail coordinates
const sectorPositions = [20, 48, 76, 55, 25, 45, 75];

export default function Home() {
  const navigate = useNavigate();

  const user = useApp((s) => s.user);
  const setSupabaseId = useApp((s) => s.setSupabaseId);
  const streak = useApp((s) => s.getStreak());
  const isItemDone = useApp((s) => s.isItemDoneToday);
  const isTrialActive = useApp((s) => s.isTrialActive);
  const getTrialDaysLeft = useApp((s) => s.getTrialDaysLeft);
  const getActiveDay = useApp((s) => s.getActiveDay);
  const isDayComplete = useApp((s) => s.isDayComplete);
  const refreshDayUnlocks = useApp((s) => s.refreshDayUnlocks);
  const devDayOverride = useApp((s) => s.devDayOverride);
  const setDevDayOverride = useApp((s) => s.setDevDayOverride);

  const [selectedDayModal, setSelectedDayModal] = useState<number | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (authUser) setSupabaseId(authUser.id);
    };

    fetchUser();
    refreshDayUnlocks();
  }, [refreshDayUnlocks, setSupabaseId]);

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
  const tierLabel = curriculumTier === 1 ? 'Classes 5–7' : 'Classes 8–10';
  const dev = isDevMode();

  const completedDaysCount = Array.from({ length: 30 }, (_, i) => i + 1).filter(
    (d) => isDayComplete(d)
  ).length;

  const surgeMultiplier = streak >= 5 ? 1.5 : streak >= 3 ? 1.25 : 1.0;
  const totalSparksEarned = completedDaysCount * 200 + doneCount * 50;

  const openPayment = () => {
    window.open(PAYMENT_LINK, '_blank', 'noopener,noreferrer');
  };

  const selectedConfig =
    selectedDayModal !== null
      ? loadDayConfig(curriculumTier, selectedDayModal)
      : null;

  const selectedItems: DayItem[] = selectedConfig?.items ?? [];
  const firstName = user.name?.trim().split(/\s+/)[0] || 'Explorer';
  const initialLetter = firstName.charAt(0).toUpperCase();

  // Sector calculations: Group days into 7-day chapters
  const currentSectorIndex = Math.floor((activeDay - 1) / 7);
  const sectorStartDay = currentSectorIndex * 7 + 1;
  const sectorDays = Array.from({ length: 7 }, (_, i) => sectorStartDay + i).filter(
    (d) => d <= 30
  );

  const sectorNames = [
    'The River Crossing',
    'The Village Foothills',
    'The Highland Valley',
    'The Mountain Pass',
    'The Final Discovery',
  ];

  // Primary active adventure for today
  const primaryIndex = Math.max(
    0,
    items.findIndex((_, idx) => !isItemDone(itemKey(curriculumTier, activeDay, idx)))
  );
  const primaryItem = items[primaryIndex];
  const primaryDone = isItemDone(itemKey(curriculumTier, activeDay, primaryIndex));
  const primaryLocked = !canPlay && !primaryDone;

  return (
    <div className="relative -mt-6 -mx-4 min-h-screen bg-[#FAF9F5] px-4 pb-32 pt-5 text-[#111827] font-sans selection:bg-[#EDE9FE] selection:text-[#6D28D9]">
      {/* Atmospheric Ambient Flares */}
      <div className="pointer-events-none absolute -left-28 top-20 h-72 w-72 rounded-full bg-emerald-100/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 top-[380px] h-80 w-80 rounded-full bg-purple-100/40 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-2xl space-y-6">
        {/* ── 1. STUDENT IDENTITY STRIP ── */}
        <header className="sticky top-2 z-40 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border border-[#E7E5E0] shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Monogram Crest */}
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#111827] text-white shadow-sm font-black text-lg">
                {initialLetter}
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-emerald-600 text-[8px] font-black text-white">
                  ✓
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-extrabold text-[#111827] tracking-tight">
                    {firstName}
                  </h2>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#F3E8FF] text-[#5B21B6] border border-[#DDD6FE]">
                    Day {activeDay} Explorer
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-700 mt-0.5">
                  Class {user.grade} · {tierLabel}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Sparks Treasury */}
              <div className="flex items-center gap-1.5 bg-[#FEF9C3] border border-[#FACC15] px-3 py-1.5 rounded-xl shadow-xs">
                <span className="text-base text-amber-800">✳</span>
                <div>
                  <div className="text-xs font-black text-amber-950 leading-none">
                    {totalSparksEarned}
                  </div>
                  <div className="text-[9px] font-extrabold uppercase text-amber-900">
                    Sparks
                  </div>
                </div>
              </div>

              {/* Curiosity Streak */}
              <div className="flex items-center gap-2 bg-[#111827] text-white px-3.5 py-1.5 rounded-xl shadow-sm">
                <span className="text-base">🔥</span>
                <div>
                  <div className="text-xs font-black text-white leading-none">
                    {streak} <span className="text-[10px] text-amber-300 font-bold uppercase">Days</span>
                  </div>
                  <div className="text-[9px] font-bold text-slate-200 uppercase tracking-wider">
                    {surgeMultiplier > 1.0 ? `${surgeMultiplier}x Spark Boost` : 'Curiosity Streak'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Spark Boost Strip */}
          {surgeMultiplier > 1.0 && (
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-amber-950 bg-amber-50 px-3 py-1 rounded-lg border border-amber-300">
              <span className="flex items-center gap-1.5">
                <span>⚡</span> Spark Multiplier Active: {surgeMultiplier}x on every discovery today!
              </span>
              <span className="text-[9px] font-black uppercase tracking-wider bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">
                Active
              </span>
            </div>
          )}
        </header>

        {/* ── 2. HERO: EXPEDITION DISPATCH ── */}
        <section className="relative overflow-hidden rounded-[32px] bg-[#111827] p-6 text-white shadow-xl sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-4 -top-4 h-48 w-48 rounded-full border border-white/5" />
          <div className="pointer-events-none absolute -bottom-16 right-20 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl" />

          {/* Encouragement pills */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-[11px] font-bold text-slate-100">
              <span>A new challenge awaits</span>
              <span className="text-amber-300">✦</span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold text-slate-100">
              <span>Your idea matters</span>
              <span className="text-emerald-300">↗</span>
            </div>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="max-w-md">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
                {dayComplete ? (
                  <>Day {activeDay} Explored. <span className="text-emerald-400">All discoveries made! ✦</span></>
                ) : (
                  <>Are you ready for the adventure, <span className="text-[#FDE68A]">Champ?</span></>
                )}
              </h1>
              <p className="mt-2 text-xs sm:text-sm font-medium text-slate-200 leading-relaxed">
                {dayComplete
                  ? 'You worked through every situation today. Your thinking trail is recorded!'
                  : 'Notice what changes, test your ideas, and discover the answer on your own.'}
              </p>
            </div>

            {/* Stage Progress Gauge */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/10 border border-white/15 shrink-0 self-start sm:self-auto min-w-[130px] shadow-inner">
              <div className="text-2xl font-black text-white">
                {doneCount} / {requiredCount}
              </div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-200 mt-0.5 text-center">
                Discoveries Made
              </div>
            </div>
          </div>

          {dev && devDayOverride !== null && (
            <div className="relative z-10 mt-4 flex items-center justify-between rounded-xl border border-amber-300/40 bg-amber-400/15 px-3 py-1.5 text-[11px] font-bold text-amber-100">
              <span>Developer Preview Active · Day {devDayOverride}</span>
              <button
                onClick={() => setDevDayOverride(null)}
                className="underline cursor-pointer font-extrabold"
              >
                Reset Natural Day
              </button>
            </div>
          )}
        </section>

        {/* ── 3. TODAY'S REASONING ADVENTURES ── */}
        <section className="space-y-3">
          <div className="flex items-end justify-between px-1">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#5B21B6]">
                Today's Adventures
              </div>
              <h2 className="text-xl font-black text-[#111827]">
                Challenges to Explore
              </h2>
            </div>
            <span className="text-[10px] font-bold text-slate-700 bg-white border border-[#E7E5E0] px-3 py-1 rounded-full shadow-xs">
              {requiredCount} Adventures Ready
            </span>
          </div>

          {items.length > 0 && primaryItem && (
            <>
              {/* PRIMARY FEATURED ADVENTURE */}
              <button
                onClick={() => {
                  if (!primaryLocked) {
                    navigate(`/play/${curriculumTier}/${activeDay}/${primaryIndex}`);
                  }
                }}
                disabled={primaryLocked}
                className="group w-full overflow-hidden rounded-[28px] border border-[#E7E5E0] bg-white p-5 sm:p-6 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-md border-b-4 border-b-[#DDD9D2] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="max-w-[75%]">
                    <span className="inline-flex rounded-full border border-[#DDD6FE] bg-[#F3E8FF] px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#5B21B6]">
                      {primaryDone ? '✓ Explored' : 'Featured Adventure'}
                    </span>

                    <h3 className="mt-2 text-xl sm:text-2xl font-black text-[#111827] tracking-tight group-hover:text-[#6D28D9] transition-colors">
                      {itemTitle(primaryItem)}
                    </h3>

                    <p className="mt-1 text-xs sm:text-sm font-medium text-slate-700 leading-relaxed">
                      {itemSub(primaryItem)}
                    </p>
                  </div>

                  <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl bg-[#FAF9F5] border border-[#E7E5E0] text-3xl sm:text-4xl shadow-xs group-hover:scale-105 transition-transform">
                    {itemEmoji(primaryItem)}
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-black">
                  <span className="text-slate-600 text-[11px] font-semibold">
                    {primaryDone ? 'You can explore it again' : 'No single right way to think'}
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#111827] px-4 py-2 text-xs font-extrabold text-white group-hover:bg-[#6D28D9] transition-colors">
                    {primaryLocked ? 'Pass Required' : primaryDone ? 'Explore Again' : 'Start Adventure ↗'}
                  </span>
                </div>
              </button>

              {/* SECONDARY ADVENTURE PODS */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {items.map((item, idx) => {
                  const id = itemKey(curriculumTier, activeDay, idx);
                  const itemDone = isItemDone(id);
                  const locked = !canPlay && !itemDone;

                  return (
                    <button
                      key={id}
                      onClick={() => {
                        if (!locked) navigate(`/play/${curriculumTier}/${activeDay}/${idx}`);
                      }}
                      disabled={locked}
                      className={`group rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 cursor-pointer ${
                        itemDone
                          ? 'border-emerald-300 bg-[#ECFDF5] border-b-2 border-b-emerald-400'
                          : locked
                          ? 'border-slate-200 bg-slate-100 opacity-60 cursor-not-allowed'
                          : 'border-[#E7E5E0] bg-white border-b-2 border-b-[#E7E5E0] hover:border-purple-300 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-2xl">
                          {locked ? '🔒' : itemEmoji(item)}
                        </span>
                        {itemDone && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-black text-white">
                            ✓
                          </span>
                        )}
                      </div>

                      <div className="mt-3 text-sm font-black text-[#111827] truncate">
                        {itemTitle(item)}
                      </div>

                      <div className="mt-0.5 text-[10px] font-medium text-slate-600 line-clamp-1">
                        {itemSub(item)}
                      </div>

                      <div
                        className={`mt-2 text-[9px] font-black uppercase tracking-wider ${
                          itemDone
                            ? 'text-emerald-800'
                            : locked
                            ? 'text-slate-500'
                            : 'text-[#5B21B6]'
                        }`}
                      >
                        {itemDone ? 'Explored' : locked ? 'Locked' : 'Try it ↗'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </section>

        {/* ── 4. THIS WEEK'S JOURNEY ── */}
        <section className="relative rounded-[32px] bg-white border border-[#E7E5E0] p-6 sm:p-7 shadow-sm border-b-4 border-b-[#DDD9D2] overflow-hidden">
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-[#5B21B6]">
                {sectorNames[currentSectorIndex] || `Chapter 0${currentSectorIndex + 1}`}
              </div>
              <h2 className="text-lg font-black text-[#111827] tracking-tight">
                This Week's Journey
              </h2>
            </div>
            <div className="text-xs font-bold text-slate-700 bg-[#FAF9F5] border border-[#E7E5E0] px-3 py-1 rounded-xl">
              Days {sectorStartDay}–{Math.min(sectorStartDay + 6, 30)}
            </div>
          </div>

          {/* 7-Day Serpentine Canvas */}
          <div className="relative h-[480px] w-full overflow-hidden rounded-2xl bg-[#FAF9F5] border border-slate-200 py-4">
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full"
              viewBox="0 0 500 480"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="sectorPath" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#059669" />
                  <stop offset="50%" stopColor="#6D28D9" />
                  <stop offset="100%" stopColor="#94A3B8" />
                </linearGradient>
              </defs>
              <path
                d={generateCompactSectorPath(sectorPositions, sectorDays.length, 60)}
                fill="none"
                stroke="url(#sectorPath)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray="6 8"
                opacity="0.6"
              />
            </svg>

            {/* Exactly 7 Landmark Nodes along the curve */}
            {sectorDays.map((dayNum, index) => {
              const xPercent = sectorPositions[index % sectorPositions.length];
              const yOffset = index * 60 + 40;
              const isCurrent = dayNum === activeDay;
              const isComplete = isDayComplete(dayNum);
              const isLocked = dayNum > activeDay && !dev;
              const isMilestone = dayNum % 7 === 0;
              const isAvailable =
                isCurrent || (dev && !!loadDayConfig(curriculumTier, dayNum)?.items.length);

              return (
                <div
                  key={dayNum}
                  className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
                  style={{ left: `${xPercent}%`, top: `${yOffset}px` }}
                >
                  <button
                    onClick={() => {
                      if (isAvailable) {
                        if (dev) setDevDayOverride(dayNum);
                        setSelectedDayModal(dayNum);
                      }
                    }}
                    disabled={!isAvailable || isLocked}
                    className={`relative flex h-12 w-12 flex-col items-center justify-center rounded-2xl border-2 transition-all duration-200 active:scale-95 ${
                      isCurrent
                        ? 'scale-110 border-[#111827] bg-[#111827] text-white shadow-lg shadow-purple-500/20 ring-4 ring-purple-200 z-20 cursor-pointer'
                        : isComplete
                        ? 'border-emerald-400 bg-[#ECFDF5] text-emerald-950 border-b-2 border-b-emerald-600 shadow-xs hover:scale-105 cursor-pointer'
                        : isMilestone
                        ? 'border-amber-400 bg-amber-50 text-amber-950 border-b-2 border-b-amber-600 z-10'
                        : 'border-[#CBD5E1] bg-white text-slate-500 opacity-60'
                    }`}
                  >
                    <span className="text-[8px] font-black uppercase opacity-90">
                      {isMilestone && !isComplete ? '★' : 'DAY'}
                    </span>
                    <span className="text-sm font-black leading-none">{dayNum}</span>

                    {isComplete && (
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border border-white bg-emerald-600 text-[8px] font-black text-white">
                        ✓
                      </span>
                    )}
                  </button>

                  {(isCurrent || isMilestone) && (
                    <div className="mt-1 whitespace-nowrap rounded-md border border-[#CBD5E1] bg-white px-2 py-0.5 text-[8px] font-black text-slate-800 shadow-xs pointer-events-none">
                      {isCurrent ? 'YOU ARE HERE' : 'MILESTONE'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 5. TRIAL PROGRESSION GAUGE ── */}
        {trialActive && trialDaysLeft !== null && (
          <div className="rounded-2xl border border-[#E7E5E0] bg-white p-4 shadow-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F3E8FF] text-xl text-[#5B21B6]">
                ⏳
              </div>
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-[#111827]">
                  {trialDaysLeft} Day{trialDaysLeft === 1 ? '' : 's'} Remaining in Trial Access
                </div>
                <p className="text-[11px] font-semibold text-slate-600 mt-0.5">
                  Unlock all 30 days of adventures for ₹999/year.
                </p>
              </div>
            </div>
            <button
              onClick={openPayment}
              className="shrink-0 rounded-xl bg-[#111827] px-4 py-2 text-xs font-black text-white hover:bg-[#6D28D9] transition cursor-pointer shadow-xs"
            >
              Upgrade ↗
            </button>
          </div>
        )}

        {/* ── 6. PARENT INSIGHTS LINK ── */}
        <button
          onClick={() => navigate('/parent')}
          className="group flex w-full items-center gap-4 rounded-3xl border border-[#E7E5E0] bg-white p-5 text-left shadow-sm border-b-4 border-b-[#DDD9D2] transition-all hover:border-purple-300 cursor-pointer"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F3E8FF] border border-[#DDD6FE] text-2xl group-hover:scale-105 transition-transform">
            📊
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-black text-[#111827] group-hover:text-[#6D28D9] transition-colors">
              Parent Insights: See the Thinking Behind the Marks
            </div>
            <p className="mt-0.5 text-xs font-semibold text-slate-600">
              Review verified thinking observations and evidence rubrics without labels or scores.
            </p>
          </div>
          <span className="text-sm font-black text-[#5B21B6] group-hover:translate-x-1 transition-transform">
            View Insights ↗
          </span>
        </button>
      </div>

      {/* ── 7. DAY ADVENTURE MODAL ── */}
      {selectedDayModal !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/40 p-4 backdrop-blur-xs"
          onClick={() => setSelectedDayModal(null)}
        >
          <div
            className="w-full max-w-md space-y-4 rounded-3xl border border-[#E7E5E0] bg-white p-6 shadow-2xl border-b-4 border-b-[#DDD9D2]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-[#5B21B6]">
                  Day Navigation
                </div>
                <h3 className="mt-0.5 text-xl font-black text-[#111827]">
                  Day {selectedDayModal} Adventures
                </h3>
                <p className="text-xs font-semibold text-slate-600">
                  Select a challenge to begin exploring.
                </p>
              </div>

              <button
                onClick={() => setSelectedDayModal(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {selectedItems.length > 0 ? (
              <div className="grid grid-cols-2 gap-2.5">
                {selectedItems.map((item, idx) => {
                  const itemDone = isItemDone(
                    itemKey(curriculumTier, selectedDayModal, idx)
                  );
                  const locked = !trialActive && !itemDone;

                  return (
                    <button
                      key={idx}
                      disabled={locked}
                      onClick={() => {
                        setSelectedDayModal(null);
                        if (!locked) {
                          navigate(`/play/${curriculumTier}/${selectedDayModal}/${idx}`);
                        }
                      }}
                      className={`rounded-2xl border p-3.5 text-left transition hover:-translate-y-0.5 cursor-pointer ${
                        itemDone
                          ? 'border-emerald-300 bg-[#ECFDF5]'
                          : locked
                          ? 'border-slate-200 bg-slate-100 opacity-60 cursor-not-allowed'
                          : 'border-[#E7E5E0] bg-[#FAF9F5] hover:border-purple-300 hover:bg-white'
                      }`}
                    >
                      <div className="text-2xl">{locked ? '🔒' : itemEmoji(item)}</div>
                      <div className="mt-2 text-xs font-black text-[#111827] truncate">
                        {itemTitle(item)}
                      </div>
                      <div className="mt-0.5 text-[9px] font-semibold text-slate-600 line-clamp-1">
                        {itemSub(item)}
                      </div>
                      <div className="mt-2 text-[9px] font-black uppercase tracking-wider text-[#5B21B6]">
                        {itemDone ? '✓ Explored' : locked ? 'Locked' : 'Start ↗'}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl bg-slate-50 p-6 text-center text-xs font-semibold text-slate-600">
                This day's challenges are currently being prepared.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function generateCompactSectorPath(xPositions: number[], count: number, stepY: number): string {
  let path = '';
  for (let i = 0; i < count; i++) {
    const x = (xPositions[i % xPositions.length] / 100) * 500;
    const y = i * stepY + 40;

    if (i === 0) {
      path += `M ${x} ${y}`;
    } else {
      const prevX = (xPositions[(i - 1) % xPositions.length] / 100) * 500;
      const prevY = (i - 1) * stepY + 40;
      const cY = prevY + stepY * 0.5;
      path += ` C ${prevX} ${cY}, ${x} ${cY}, ${x} ${y}`;
    }
  }
  return path;
}

function itemEmoji(item: DayItem): string {
  switch (item.engine) {
    case 'm1': return '⚙';
    case 'm2': return '⚖';
    case 'm3': return '⌁';
    case 'm4': return '↗';
    case 'm5': return '?';
    case 'math': return '⚙';
    case 'opinion': return '🗣️';
    case 'creative': return '✦';
    case 'watch': return '🎬';
    case 'observe': return '👁️';
    default: return '✳';
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
    case 'creative': return 'Create & Synthesize';
    case 'watch': return 'Watch & Think';
    case 'observe': return item.title;
    default: return 'Adventure';
  }
}

function itemSub(item: DayItem): string {
  switch (item.engine) {
    case 'm1': return 'Look for what changes, what stays the same and what rule is hidden.';
    case 'm2': return 'Weigh competing clues to isolate the key factor.';
    case 'm3': return 'Spot a possible pattern, then test your rule instead of assuming.';
    case 'm4': return 'Two events may be connected—does one cause the other?';
    case 'm5': return 'Choose the question that would help you think more clearly.';
    case 'math': return 'Test hypotheses and uncover underlying mathematical rules.';
    case 'opinion': return 'Articulate your reasoning and defend your perspective.';
    case 'creative': return 'Synthesize an original solution with available materials.';
    case 'watch': return 'Scrutinize visual evidence under time constraints.';
    case 'observe': return 'Spot micro-patterns hidden in plain sight.';
    default: return 'Explore the situation and explain your reasoning.';
  }
}