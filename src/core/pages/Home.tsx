import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { useChild } from '../auth/ChildContext';
import { loadDayConfig } from '../../missions/curriculum';
import { curriculumTierFrom } from '../../missions/tiers';
import { PAYMENT_LINK } from '../config';
import { supabase } from '../lib/supabase';
import { triggerDialTick, triggerSoftConfirm } from '../lib/tactileFeedback';
import { summarizeThinkingSheets } from '../analytics/thinkingSheetBridge';

interface DateSlot {
  iso: string;
  dayNum: number;
  weekday: string;
  dateLabel: string;
  isToday: boolean;
  mappedDay: number;
  isUnlocked: boolean;
}

interface LiveScreenFrame {
  id: string;
  stepTag: string;
  statusLabel: string;
  statusTone: 'teal' | 'amber' | 'ink';
  headline: string;
  readoutLabel: string;
  readoutLeftTitle: string;
  readoutLeftValue: string;
  readoutRightTitle: string;
  readoutRightValue: string;
  liveNote: string;
  actionPreview: string;
}

const MOVING_SCREEN_FRAMES: LiveScreenFrame[] = [
  {
    id: 'frame-1',
    stepTag: 'Mission 01 · Check Clues',
    statusLabel: 'Free today',
    statusTone: 'teal',
    headline: 'The Missing Tiffin',
    readoutLabel: '3 Clues · 1 New Twist',
    readoutLeftTitle: 'Door locked',
    readoutLeftValue: '10–12 PM',
    readoutRightTitle: 'Bench at 12:30',
    readoutRightValue: 'Kabir',
    liveNote:
      'Wait—check the new clue before locking your answer. Did Kabir actually eat the mangoes?',
    actionPreview: 'Play Mission 01',
  },
  {
    id: 'frame-2',
    stepTag: 'Mission 02 · Two Causes',
    statusLabel: 'Free today',
    statusTone: 'amber',
    headline: 'The Wet Shoes',
    readoutLabel: '3 Clues · Spot the Real Cause',
    readoutLeftTitle: 'Road outside',
    readoutLeftValue: 'Dry',
    readoutRightTitle: '7 AM wash',
    readoutRightValue: 'Bicycle',
    liveNote:
      'Meera thinks it rained at night. Check the road outside to test her guess.',
    actionPreview: 'Play Mission 02',
  },
  {
    id: 'frame-3',
    stepTag: 'Missions 03–05 · Full Year',
    statusLabel: '3 more missions',
    statusTone: 'ink',
    headline: 'School Route, Flower Pot & Juice Shops',
    readoutLabel: '5 Daily Missions · Full Year',
    readoutLeftTitle: 'Free daily',
    readoutLeftValue: '2 open',
    readoutRightTitle: 'Annual pass',
    readoutRightValue: 'All 5',
    liveNote:
      'Unlock all 5 daily missions and unlimited chapter questions across the full year.',
    actionPreview: 'Explore Day 1',
  },
];

function formatIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

/**
 * Anchors Day 1 to the child's joining date (`registeredAt`), while ensuring:
 * - Today always opens the child's current active uncompleted day (e.g. Day 1 if they joined Nov 17 and haven't played yet).
 * - Past dates since joining map sequentially starting at Day 1.
 */
function buildAnchoredDateStrip(
  registeredAtIso: string,
  activeDay: number
): DateSlot[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const joined = new Date(registeredAtIso);
  if (!Number.isNaN(joined.getTime())) {
    joined.setHours(0, 0, 0, 0);
  }

  return Array.from({ length: 7 }, (_, i) => {
    const offset = i - 6;
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    const isToday = offset === 0;

    // Today always points to the child's current playable activeDay (e.g., Day 1)
    // Earlier dates back to joining date map starting from Day 1
    let mappedDay = activeDay;
    if (!isToday) {
      if (!Number.isNaN(joined.getTime()) && d >= joined) {
        const daysFromJoin = Math.floor(
          (d.getTime() - joined.getTime()) / (1000 * 60 * 60 * 24)
        );
        mappedDay = Math.max(1, Math.min(activeDay, daysFromJoin + 1));
      } else {
        mappedDay = 1;
      }
    }

    const isUnlocked =
      isToday || (!Number.isNaN(joined.getTime()) && d >= joined);

    return {
      iso: formatIso(d),
      dayNum: d.getDate(),
      weekday: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      dateLabel: d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
      }),
      isToday,
      mappedDay,
      isUnlocked,
    };
  });
}

export default function Home() {
  const navigate = useNavigate();
  const { activeChild } = useChild();

  const user = useApp((s) => s.user);
  const setSupabaseId = useApp((s) => s.setSupabaseId);
  const sessions = useApp((s) => s.sessions);
  const responses = useApp((s) => s.responses);
  const isTrialActive = useApp((s) => s.isTrialActive);
  const getTrialDaysLeft = useApp((s) => s.getTrialDaysLeft);
  const getActiveDay = useApp((s) => s.getActiveDay);
  const isDayComplete = useApp((s) => s.isDayComplete);
  const refreshDayUnlocks = useApp((s) => s.refreshDayUnlocks);

  const activeDay = getActiveDay();
  const registeredAt = user?.registeredAt ?? new Date().toISOString();

  const dateSlots = useMemo(
    () => buildAnchoredDateStrip(registeredAt, activeDay),
    [registeredAt, activeDay]
  );

  const [selectedIso, setSelectedIso] = useState<string>(
    () => dateSlots[dateSlots.length - 1]?.iso ?? formatIso(new Date())
  );
  const [activeFrameIdx, setActiveFrameIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [openJourneyIdx, setOpenJourneyIdx] = useState<number | null>(null);

  const sheetSummary = useMemo(
    () => summarizeThinkingSheets(responses),
    [responses]
  );

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (authUser) setSupabaseId(authUser.id);
    };
    void fetchUser();
    refreshDayUnlocks();
  }, [refreshDayUnlocks, setSupabaseId]);

  useEffect(() => {
    if (isPaused) return;
    const timer = window.setInterval(() => {
      setActiveFrameIdx((prev) => (prev + 1) % MOVING_SCREEN_FRAMES.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [isPaused]);

  if (!user) return null;

  const childName =
    activeChild?.name?.trim().split(/\s+/)[0] ||
    user.name?.trim().split(/\s+/)[0] ||
    'Explorer';
  const classLevel = activeChild?.class_level ?? user.grade ?? 6;
  const board = activeChild?.board || 'CBSE';
  const curriculumTier = curriculumTierFrom(user.tier);
  const trialActive = isTrialActive();
  const trialDaysLeft = getTrialDaysLeft();

  const completedDates = useMemo(
    () => new Set(sessions.map((s) => s.date)),
    [sessions]
  );

  const selectedSlot =
    dateSlots.find((s) => s.iso === selectedIso) ??
    dateSlots[dateSlots.length - 1];

  const selectedDayDone =
    isDayComplete(selectedSlot.mappedDay) ||
    completedDates.has(selectedSlot.iso);
  const currentFrame = MOVING_SCREEN_FRAMES[activeFrameIdx];

  const selectedDayConfig = useMemo(
    () => loadDayConfig(curriculumTier, selectedSlot.mappedDay),
    [curriculumTier, selectedSlot.mappedDay]
  );

  const dayItems = selectedDayConfig?.items ?? [];
  const missionCount = dayItems.length || 5;
  const upNextTitle = `Day ${selectedSlot.mappedDay} · ${
    selectedDayConfig?.title || 'Detective Lab'
  } (${missionCount} Missions)`;
  const upNextHook =
    dayItems[0]?.hookPrompt ||
    'Tap clues, check what happened, and answer in your own words.';

  const launchMission = (mappedDay: number) => {
    triggerSoftConfirm(true);
    if (mappedDay === 1) {
      navigate('/baseline');
    } else {
      navigate(`/play/${curriculumTier}/${mappedDay}/0`);
    }
  };

  const journeyItems = useMemo(() => {
    if (dayItems.length > 0) {
      return dayItems.map((item, idx) => {
        const itemKey = `t${curriculumTier}:d${selectedSlot.mappedDay}:i${idx}`;
        const saved = responses[itemKey];
        const isFree = idx < 2;
        return {
          id: item.id,
          code: String(idx + 1).padStart(2, '0'),
          title: item.title,
          state: saved
            ? 'Done'
            : isFree
            ? 'Free · Open'
            : 'Annual Pass',
          note: saved?.text
            ? `Your answer: “${saved.text}”`
            : item.hookPrompt,
        };
      });
    }

    return [
      {
        id: 'j-1',
        code: '01',
        title: 'The Missing Tiffin',
        state: 'Free · Open',
        note: 'Rohan kept his mango tiffin on the classroom bench at 10 AM. At 1 PM, the tiffin was empty.',
      },
      {
        id: 'j-2',
        code: '02',
        title: 'The Wet Shoes',
        state: 'Free · Open',
        note: 'Meera’s school shoes were totally wet at 8 AM. She says: “It rained at night!”',
      },
    ];
  }, [dayItems, curriculumTier, selectedSlot.mappedDay, responses]);

  return (
    <div className="min-h-screen bg-[#F7F6F1] text-[#142033]">
      <div className="mx-auto max-w-6xl space-y-16 px-2 sm:px-4 pt-4 pb-16">
        {/* 01 · HERO + LIVE MOVING SCREEN */}
        <section className="grid grid-cols-1 gap-10 lg:grid-cols-[1.02fr_0.98fr] items-center pt-2">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#142033]/10 bg-white px-3.5 py-1.5 text-xs font-medium text-[#586579]">
              <span className="h-2 w-2 rounded-full bg-[#087F80]" />
              <span>
                {selectedSlot.isToday
                  ? `Today · Day ${selectedSlot.mappedDay}`
                  : `${selectedSlot.dateLabel} · Day ${selectedSlot.mappedDay}`}
              </span>
              <span className="text-[#142033]/25">·</span>
              <span className="text-[#142033] font-semibold">
                Class {classLevel} · {board}
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight leading-[1.06] text-[#142033]">
              {childName}, are you ready for today’s Thinking Missions?
            </h1>

            <div className="space-y-1.5 pt-1">
              <div className="font-mono-tech text-[11px] font-bold uppercase tracking-[0.14em] text-[#087F80]">
                Up Next · {selectedDayDone ? 'Done' : '2 Free Missions Open'}
              </div>
              <p className="font-display text-xl font-bold text-[#142033]">
                {upNextTitle}
              </p>
              <p className="text-sm sm:text-base text-[#586579] max-w-lg leading-relaxed">
                {upNextHook}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => launchMission(selectedSlot.mappedDay)}
                className="cx-action-pill bg-[#142033] px-7 py-3.5 text-sm text-white hover:bg-[#087F80] cursor-pointer"
              >
                <span>{selectedDayDone ? 'Play Again' : 'Start Day 1 Missions'}</span>
                <span aria-hidden="true">→</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerDialTick(false);
                  navigate('/sheets');
                }}
                className="inline-flex items-center gap-2 rounded-full border border-[#142033]/15 bg-white px-5 py-3.5 text-sm font-semibold text-[#142033] hover:border-[#142033]/40 transition cursor-pointer"
              >
                <span>Chapter Challenges</span>
                {sheetSummary.totalCompleted > 0 && (
                  <span className="rounded-full bg-[#087F80]/12 px-2 py-0.5 font-mono-tech text-[11px] font-bold text-[#087F80]">
                    {sheetSummary.totalCompleted} done
                  </span>
                )}
              </button>
            </div>

            <p className="text-xs text-[#586579]">
              2 free Thinking Missions daily + 4 free Chapter Challenges per chapter. No timers, no marks.
            </p>
          </div>

          <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="cx-soft-float"
          >
            <div className="rounded-[28px] border border-[#142033]/12 bg-white p-5 sm:p-6 shadow-[var(--shadow-device)] space-y-5">
              <div className="flex items-center justify-between border-b border-[#142033]/8 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F7F6F1] font-display text-xs font-extrabold text-[#142033]">
                    {childName.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-[#142033]">
                      {childName} · Day {selectedSlot.mappedDay} Missions
                    </div>
                    <div className="font-mono-tech text-[10px] text-[#586579]">
                      {currentFrame.readoutLabel}
                    </div>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    currentFrame.statusTone === 'teal'
                      ? 'bg-[#087F80]/10 text-[#087F80]'
                      : currentFrame.statusTone === 'amber'
                      ? 'bg-[#F5B942]/20 text-[#8A5A00]'
                      : 'bg-[#142033]/8 text-[#142033]'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      currentFrame.statusTone === 'teal'
                        ? 'bg-[#087F80]'
                        : currentFrame.statusTone === 'amber'
                        ? 'bg-[#F5B942]'
                        : 'bg-[#142033]'
                    }`}
                  />
                  {currentFrame.statusLabel}
                </span>
              </div>

              <div key={currentFrame.id} className="cx-screen-enter space-y-4">
                <div className="space-y-1">
                  <div className="font-mono-tech text-[10px] font-bold uppercase tracking-widest text-[#087F80]">
                    {currentFrame.stepTag}
                  </div>
                  <h2 className="font-display text-lg sm:text-xl font-extrabold text-[#142033]">
                    {currentFrame.headline}
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-[#142033]/8 bg-[#F7F6F1] p-4">
                    <div className="text-[11px] font-medium text-[#586579]">
                      {currentFrame.readoutLeftTitle}
                    </div>
                    <div className="mt-1 font-display text-2xl sm:text-3xl font-extrabold tabular-nums text-[#142033]">
                      {currentFrame.readoutLeftValue}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-[#087F80]/20 bg-[#087F80]/[0.05] p-4">
                    <div className="text-[11px] font-medium text-[#087F80]">
                      {currentFrame.readoutRightTitle}
                    </div>
                    <div className="mt-1 font-display text-2xl sm:text-3xl font-extrabold tabular-nums text-[#087F80]">
                      {currentFrame.readoutRightValue}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#142033]/8 bg-white px-4 py-3 text-xs sm:text-sm text-[#142033] leading-relaxed">
                  {currentFrame.liveNote}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => launchMission(selectedSlot.mappedDay)}
                    className="text-xs font-bold text-[#087F80] hover:underline cursor-pointer"
                  >
                    {currentFrame.actionPreview} →
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPaused((p) => !p)}
                    className="font-mono-tech text-[10px] font-semibold text-[#586579] hover:text-[#142033] cursor-pointer"
                  >
                    {isPaused ? 'Resume preview' : 'Pause preview'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                {MOVING_SCREEN_FRAMES.map((frame, idx) => {
                  const isCurrent = idx === activeFrameIdx;
                  const isPast = idx < activeFrameIdx;
                  return (
                    <button
                      key={frame.id}
                      type="button"
                      aria-label={`Preview ${frame.stepTag}`}
                      onClick={() => {
                        triggerDialTick(false);
                        setActiveFrameIdx(idx);
                      }}
                      className="space-y-1.5 text-left cursor-pointer group"
                    >
                      <div className="h-1 w-full overflow-hidden rounded-full bg-[#142033]/10">
                        {isCurrent && !isPaused ? (
                          <div
                            key={`${frame.id}-bar`}
                            className="h-full w-full bg-[#087F80] cx-progress-sweep"
                          />
                        ) : (
                          <div
                            className={`h-full transition-all ${
                              isCurrent || isPast
                                ? 'w-full bg-[#087F80]'
                                : 'w-0 bg-[#087F80]'
                            }`}
                          />
                        )}
                      </div>
                      <span
                        className={`block font-mono-tech text-[10px] font-semibold ${
                          isCurrent
                            ? 'text-[#142033]'
                            : 'text-[#586579] group-hover:text-[#142033]'
                        }`}
                      >
                        0{idx + 1}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* 02 · PICK A DATE (ANCHORED TO JOINING DATE = DAY 1) */}
        <section className="cx-hairline-t pt-10 space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <div className="font-mono-tech text-[10px] font-bold uppercase tracking-[0.16em] text-[#087F80]">
                Pick a Date
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#142033] mt-1">
                Your Path
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#586579]">
              Your joining date starts Day 1—nothing is skipped if you miss a day.
            </p>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5">
            {dateSlots.map((slot) => {
              const isSelected = slot.iso === selectedSlot.iso;
              const isDone =
                isDayComplete(slot.mappedDay) || completedDates.has(slot.iso);

              return (
                <button
                  key={slot.iso}
                  type="button"
                  onClick={() => {
                    triggerDialTick(true);
                    setSelectedIso(slot.iso);
                  }}
                  className={`rounded-2xl border px-3 py-4 text-left transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'border-[#142033] bg-[#142033] text-white shadow-sm'
                      : isDone
                      ? 'border-[#087F80]/30 bg-[#087F80]/[0.06] text-[#142033]'
                      : 'border-[#142033]/10 bg-white text-[#142033] hover:border-[#142033]/35'
                  }`}
                >
                  <div
                    className={`font-mono-tech text-[10px] font-semibold uppercase ${
                      isSelected ? 'text-white/70' : 'text-[#586579]'
                    }`}
                  >
                    {slot.isToday ? 'Today' : slot.weekday}
                  </div>
                  <div className="mt-1 font-display text-2xl font-extrabold tabular-nums">
                    {slot.dayNum}
                  </div>
                  <div
                    className={`mt-2 inline-flex items-center gap-1 text-[10px] font-semibold ${
                      isSelected
                        ? 'text-[#55E2CE]'
                        : isDone
                        ? 'text-[#087F80]'
                        : 'text-[#586579]'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isSelected
                          ? 'bg-[#55E2CE]'
                          : isDone
                          ? 'bg-[#087F80]'
                          : 'bg-[#142033]/25'
                      }`}
                    />
                    {isDone ? 'Done' : `Day ${slot.mappedDay}`}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 03 · TODAY'S 5 MISSIONS LIST */}
        <section className="cx-hairline-t pt-10 space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#142033]">
              Day {selectedSlot.mappedDay} Missions
            </h2>
            <span className="text-xs text-[#586579]">
              Tap any mission to preview or press Play above
            </span>
          </div>

          <div className="cx-hairline-t">
            {journeyItems.map((entry, idx) => {
              const open = openJourneyIdx === idx;
              const unlocked =
                entry.state === 'Done' || entry.state === 'Free · Open';
              return (
                <div key={entry.id} className="cx-hairline-b">
                  <button
                    type="button"
                    onClick={() => {
                      triggerDialTick(false);
                      setOpenJourneyIdx(open ? null : idx);
                    }}
                    className="w-full flex items-center justify-between gap-4 py-4 text-left hover:bg-white/60 transition px-2 rounded-xl cursor-pointer"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="font-mono-tech text-xs font-semibold text-[#586579]">
                        {entry.code}
                      </span>
                      <span className="font-display text-base font-bold text-[#142033] truncate">
                        {entry.title}
                      </span>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-0.5 text-[11px] font-semibold ${
                        unlocked
                          ? 'bg-[#087F80]/10 text-[#087F80]'
                          : 'bg-[#142033]/6 text-[#586579]'
                      }`}
                    >
                      {entry.state}
                    </span>
                  </button>

                  {open && (
                    <div className="pb-4 pl-10 pr-4 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs sm:text-sm text-[#586579] leading-relaxed">
                        {entry.note}
                      </p>
                      <button
                        type="button"
                        onClick={() => launchMission(selectedSlot.mappedDay)}
                        className="rounded-full bg-[#087F80] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#142033] transition cursor-pointer"
                      >
                        Open Mission →
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {trialActive && trialDaysLeft !== null && (
          <div className="cx-hairline-t pt-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-[#586579]">
              Free Forever includes 2 daily missions + 4 free challenges/chapter · Full access starts at ₹999/year (One-Time)
            </p>
            <button
              type="button"
              onClick={() =>
                window.open(PAYMENT_LINK, '_blank', 'noopener,noreferrer')
              }
              className="text-xs font-bold text-[#142033] underline underline-offset-4 hover:text-[#087F80] cursor-pointer"
            >
              Unlock unlimited access →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}