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
    stepTag: 'Step 1 · Spot the clue',
    statusLabel: 'Live signal',
    statusTone: 'teal',
    headline: 'Test one input before guessing the rule',
    readoutLabel: 'Secret Machine · Probe 01',
    readoutLeftTitle: 'Input tried',
    readoutLeftValue: '3',
    readoutRightTitle: 'Machine output',
    readoutRightValue: '9',
    liveNote: '3 → 9 could be "+6" or "×3". One clue is never enough yet.',
    actionPreview: 'Try another number',
  },
  {
    id: 'frame-2',
    stepTag: 'Step 2 · Run a second test',
    statusLabel: 'Checking again',
    statusTone: 'amber',
    headline: 'Watch what breaks your first guess',
    readoutLabel: 'Secret Machine · Probe 02',
    readoutLeftTitle: 'Input tried',
    readoutLeftValue: '5',
    readoutRightTitle: 'Machine output',
    readoutRightValue: '15',
    liveNote: '5 + 6 would be 11, not 15. The first guess just fell apart.',
    actionPreview: 'Update rule to ×3',
  },
  {
    id: 'frame-3',
    stepTag: 'Step 3 · Your own words',
    statusLabel: 'Ready to solve',
    statusTone: 'ink',
    headline: 'Explain why your idea holds up',
    readoutLabel: 'Brain Mapping · Verified',
    readoutLeftTitle: 'Clues checked',
    readoutLeftValue: '2 probes',
    readoutRightTitle: 'Mind shift',
    readoutRightValue: 'Updated',
    liveNote:
      '“Because 5 gave 15, it could not be adding 6. Multiplying by 3 fits both.”',
    actionPreview: 'Save & unlock next',
  },
];

function formatIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

function buildDateStrip(activeDay: number): DateSlot[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, i) => {
    const offset = i - 6;
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    const mappedDay = Math.max(1, Math.min(30, activeDay + offset));

    return {
      iso: formatIso(d),
      dayNum: d.getDate(),
      weekday: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      dateLabel: d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
      }),
      isToday: offset === 0,
      mappedDay,
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
  const refreshDayUnlocks = useApp((s) => s.refreshDayUnlocks);

  const activeDay = getActiveDay();
  const dateSlots = useMemo(() => buildDateStrip(activeDay), [activeDay]);
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
  const selectedDateDone = completedDates.has(selectedSlot.iso);
  const currentFrame = MOVING_SCREEN_FRAMES[activeFrameIdx];

  const selectedDayConfig = useMemo(
    () => loadDayConfig(curriculumTier, selectedSlot.mappedDay),
    [curriculumTier, selectedSlot.mappedDay]
  );

  const missionCount = selectedDayConfig?.items?.length ?? 2;
  const upNextTitle = `Day ${selectedSlot.mappedDay} · Clue & Variable Investigation (${missionCount} Missions)`;
  const upNextHook =
    'Test your first hunch against a second clue before locking in your answer.';

  const launchMission = (mappedDay: number) => {
    triggerSoftConfirm(true);
    const cfg = loadDayConfig(curriculumTier, mappedDay);
    if (cfg && cfg.items.length > 0) {
      navigate(`/play/${curriculumTier}/${mappedDay}/0`);
    } else {
      navigate('/baseline');
    }
  };

  const completedCount = Object.keys(responses).length;

  const journeyItems = useMemo(() => {
    if (sheetSummary.entries.length > 0) {
      return sheetSummary.entries.slice(0, 6).map((entry, idx) => ({
        id: entry.key,
        code: String(idx + 1).padStart(2, '0'),
        title: `${entry.topicName} · ${entry.questionTitle}`,
        state: 'Completed',
        note:
          entry.text ||
          entry.twistText ||
          `Completed in ${entry.subject} (${entry.skillCode}).`,
      }));
    }

    return [
      {
        id: 'j-1',
        code: '01',
        title: 'Day 1 · The Secret Machine (Testing Two Clues)',
        state: completedCount > 0 ? 'Unlocked' : 'Next',
        note: 'One input can match two rules—testing a second number reveals which rule actually holds.',
      },
      {
        id: 'j-2',
        code: '02',
        title: 'Day 2 · Fair Comparison Check (Variables)',
        state: completedCount > 1 ? 'Unlocked' : 'Next',
        note: 'Change only one variable at a time so you know what actually caused the difference.',
      },
      {
        id: 'j-3',
        code: '03',
        title: 'Day 3 · Spotting Missing Information',
        state: 'Next',
        note: 'Ask what facts were left out before accepting a bold claim or headline.',
      },
    ];
  }, [sheetSummary.entries, completedCount]);

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
                  ? `Today · ${selectedSlot.dateLabel}`
                  : selectedSlot.dateLabel}
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
                Up Next · {selectedDateDone ? 'Done' : 'Open'}
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
                disabled={!trialActive && !selectedDateDone}
                onClick={() => launchMission(selectedSlot.mappedDay)}
                className="cx-action-pill bg-[#142033] px-7 py-3.5 text-sm text-white hover:bg-[#087F80] cursor-pointer disabled:opacity-50"
              >
                <span>{selectedDateDone ? 'Replay mission' : 'Play'}</span>
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
                      {childName} · Live Mission Preview
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

        {/* 02 · PICK A DATE */}
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
              Tap today or any earlier date to start or replay.
            </p>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5">
            {dateSlots.map((slot) => {
              const isSelected = slot.iso === selectedSlot.iso;
              const isDone = completedDates.has(slot.iso);

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
                    {isDone ? 'Done' : 'Open'}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 03 · YOUR JOURNEY */}
        <section className="cx-hairline-t pt-10 space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#142033]">
              Your journey
            </h2>
            <span className="text-xs text-[#586579]">
              {sheetSummary.totalCompleted > 0
                ? `${sheetSummary.totalCompleted} Chapter Challenge${
                    sheetSummary.totalCompleted === 1 ? '' : 's'
                  } completed. Tap any row to read your note.`
                : 'Tap any row to see what you figured out'}
            </span>
          </div>

          <div className="cx-hairline-t">
            {journeyItems.map((entry, idx) => {
              const open = openJourneyIdx === idx;
              const unlocked =
                entry.state === 'Unlocked' || entry.state === 'Completed';
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
                    <p className="pb-4 pl-10 pr-4 text-xs sm:text-sm text-[#586579] leading-relaxed">
                      {entry.note}
                    </p>
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