import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FREE_DAILY_MISSIONS,
  FREE_THINKING_SHEET_LIMIT,
  PAID_THINKING_SHEET_MIN,
  PRICE_INR,
  TRIAL_DAYS,
  TRIAL_PRICE_INR,
} from '../config';
import { triggerDialTick, triggerSoftConfirm } from '../lib/tactileFeedback';

interface HeroFrame {
  id: string;
  tabLabel: string;
  contextLine: string;
  statusLabel: string;
  statusTone: 'teal' | 'amber' | 'ink';
  title: string;
  leftLabel: string;
  leftValue: string;
  rightLabel: string;
  rightValue: string;
  transcript: string;
  footnote: string;
}

const HERO_FRAMES: HeroFrame[] = [
  {
    id: 'baseline-test',
    tabLabel: '01 · 15-Min Test',
    contextLine: 'Free 15-Minute Thinking Test · Classes 5 to 10',
    statusLabel: 'Free to try',
    statusTone: 'teal',
    title: 'Find out if your child guesses fast or checks clues first',
    leftLabel: 'Time needed',
    leftValue: '15 mins',
    rightLabel: 'You get',
    rightValue: 'Parent note',
    transcript:
      'Three short puzzles with no marks and no countdown clock. Ends with a plain-English snapshot of how they reasoned.',
    footnote: 'No card needed · Instant parent snapshot',
  },
  {
    id: 'thinking-sheet',
    tabLabel: '02 · Sheets',
    contextLine: 'Class 6 · CBSE & Maharashtra Board · Science',
    statusLabel: 'Anti-copy',
    statusTone: 'amber',
    title: 'School chapters rewritten so no two classmates can copy',
    leftLabel: 'Free plan',
    leftValue: `${FREE_THINKING_SHEET_LIMIT} questions`,
    rightLabel: 'Full plan',
    rightValue: `${PAID_THINKING_SHEET_MIN}+ / chapter`,
    transcript:
      '“Both plants got water, so we cannot blame the soil until we check how much sunlight each corner gets.”',
    footnote: 'Shuffled order, different names, zero A/B/C labels',
  },
  {
    id: 'parent-replay',
    tabLabel: '03 · Parent View',
    contextLine: 'PIN / Fingerprint Locked · Parent View',
    statusLabel: 'Observed',
    statusTone: 'ink',
    title: 'Read their actual words and watch where they changed their mind',
    leftLabel: 'Checked 2+ clues',
    leftValue: '78%',
    rightLabel: 'Skills seen',
    rightValue: '5 of 8',
    transcript:
      'Earlier: picked after the first clue. Recently: tested a second number and caught their own mistake.',
    footnote: 'Step-by-step replay + Weekly Championship updates',
  },
  {
    id: 'try-at-home',
    tabLabel: '04 · Try at Home',
    contextLine: 'Free Forever · The 10-Second Rule',
    statusLabel: 'Open to all',
    statusTone: 'teal',
    title: 'Simple dinner-table questions that make kids pause and think',
    leftLabel: 'Each week',
    leftValue: '3 prompts',
    rightLabel: 'One rule',
    rightValue: 'Wait 10s',
    transcript:
      '“That ad says 2x energy. Who did they test it on, and what are they not telling us?”',
    footnote: 'Stay quiet for 10 seconds. Let them answer without hints.',
  },
];

const EIGHT_SKILLS_PREVIEW = [
  { code: 'A1', name: 'Asking good questions', status: 'Observed' },
  { code: 'A2', name: 'Spotting missing info', status: 'Early signal' },
  { code: 'B1', name: 'Giving reasons', status: 'Observed' },
  { code: 'B2', name: 'Using evidence', status: 'Observed' },
  { code: 'B3', name: 'Detecting weak reasoning', status: 'In review' },
  { code: 'C1', name: 'Weighing trade-offs', status: 'Coming up' },
  { code: 'C2', name: 'Updating on evidence', status: 'Early signal' },
  { code: 'C3', name: 'Reflecting', status: 'Coming up' },
] as const;

const FAQ_ITEMS = [
  {
    q: 'What do we get on the Free Plan?',
    a: `You get the 15-Minute Thinking Test, ${FREE_DAILY_MISSIONS} daily missions every day, full Try at Home prompts, ${FREE_THINKING_SHEET_LIMIT} Thinking Sheet questions per chapter, Weekly Championship entry, and clear activity numbers in Parent View.`,
  },
  {
    q: 'What opens up for ₹49 (7 days) or ₹999/year?',
    a: `Full access unlocks all ${PAID_THINKING_SHEET_MIN}+ tailored Thinking Sheet questions per chapter for CBSE and Maharashtra State Board, the complete unblurred Parent View (verbatim quotes, step-by-step replay, 8-area progress web), Monthly Championship Awards eligibility, and up to 3 child profiles.`,
  },
  {
    q: 'What if I pay now and my child’s school joins CubitX later?',
    a: 'If your child’s school partners with CubitX later, whatever balance is left on your family plan automatically carries forward to next year. You do not lose a rupee.',
  },
  {
    q: 'How do you stop kids from copying Thinking Sheet answers from friends?',
    a: 'Every student gets a different version. Question order, character names, numbers, and option positions are shuffled per child with zero A/B/C labels.',
  },
  {
    q: 'Can my child open Parent View by mistake?',
    a: 'No. Parent View stays behind a 4-digit Parent PIN with optional Fingerprint or Face ID unlock on supported phones.',
  },
];

export default function Landing() {
  const navigate = useNavigate();

  const [frameIdx, setFrameIdx] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);

  const [sandboxTab, setSandboxTab] = useState<'mission' | 'sheet'>('mission');
  const missionTabRef = useRef<HTMLButtonElement>(null);
  const sheetTabRef = useRef<HTMLButtonElement>(null);

  const [machineInput, setMachineInput] = useState<number>(3);
  const [probes, setProbes] = useState<Array<{ x: number; y: number }>>([
    { x: 3, y: 9 },
  ]);
  const [ruleGuess, setRuleGuess] = useState<'plus6' | 'times3' | null>(null);

  const [sheetBoard, setSheetBoard] = useState<
    'CBSE' | 'Maharashtra State Board'
  >('CBSE');
  const [sheetPick, setSheetPick] = useState<number | null>(null);

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    if (heroPaused) return;
    const id = window.setInterval(() => {
      setFrameIdx((prev) => (prev + 1) % HERO_FRAMES.length);
    }, 4200);
    return () => window.clearInterval(id);
  }, [heroPaused]);

  const activeFrame = HERO_FRAMES[frameIdx];

  const handleSandboxTabKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>
  ) => {
    if (
      e.key === 'ArrowRight' ||
      e.key === 'ArrowLeft' ||
      e.key === 'Home' ||
      e.key === 'End'
    ) {
      e.preventDefault();
      let nextTab: 'mission' | 'sheet' = sandboxTab;
      if (e.key === 'Home') nextTab = 'mission';
      else if (e.key === 'End') nextTab = 'sheet';
      else nextTab = sandboxTab === 'mission' ? 'sheet' : 'mission';

      triggerDialTick(false);
      setSandboxTab(nextTab);
      if (nextTab === 'mission') {
        missionTabRef.current?.focus();
      } else {
        sheetTabRef.current?.focus();
      }
    }
  };

  const handleProbe = (n: number) => {
    triggerDialTick(true);
    setMachineInput(n);
    setProbes((prev) =>
      prev.some((p) => p.x === n)
        ? prev
        : [...prev.slice(-3), { x: n, y: n * 3 }]
    );
  };

  const resetMachine = () => {
    triggerDialTick(false);
    setMachineInput(3);
    setProbes([{ x: 3, y: 9 }]);
    setRuleGuess(null);
  };

  const handleStart = () => {
    triggerSoftConfirm(true);
    navigate('/signin');
  };

  return (
    <div className="min-h-screen bg-[#F7F6F1] text-[#142033] font-sans">
      {/* SINGLE TOP BAR */}
      <header className="sticky top-0 z-50 border-b border-[#142033]/12 bg-[#F7F6F1]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <a href="#top" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#142033] font-display text-xs font-extrabold text-white">
              CX
            </span>
            <span className="font-display text-base font-extrabold tracking-tight text-[#142033]">
              CubitX
            </span>
          </a>

          <nav
            aria-label="Primary sections"
            className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#424F63]"
          >
            <a href="#sandbox" className="hover:text-[#142033] transition">
              Try a puzzle
            </a>
            <a href="#how-it-works" className="hover:text-[#142033] transition">
              How it works
            </a>
            <a href="#schools" className="hover:text-[#142033] transition">
              For Schools
            </a>
            <a href="#access" className="hover:text-[#142033] transition">
              Plans
            </a>
            <a href="#faq" className="hover:text-[#142033] transition">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate('/signin')}
              className="rounded-full px-3 py-2 text-xs font-semibold text-[#424F63] hover:text-[#142033] transition cursor-pointer"
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={handleStart}
              className="cx-action-pill bg-[#142033] px-4 py-2 text-xs text-white hover:bg-[#066869] cursor-pointer"
            >
              15-Min Test →
            </button>
          </div>
        </div>
      </header>

      <main id="top" className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* =================================================================
            01 · HERO — DIRECT HOOK + LIVE PREVIEW
            ================================================================= */}
        <section className="grid grid-cols-1 items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.02fr_0.98fr] lg:py-24">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#142033]/12 bg-white px-3.5 py-1.5 text-xs font-medium text-[#424F63]">
              <span className="h-2 w-2 rounded-full bg-[#066869]" />
              <span>Classes 5 to 10</span>
              <span className="text-[#142033]/30">·</span>
              <span className="font-semibold text-[#142033]">
                CBSE &amp; Maharashtra State Board
              </span>
            </div>

            <h1 className="font-display text-4xl font-extrabold leading-[1.04] tracking-tight text-[#142033] sm:text-5xl lg:text-[56px]">
              Marks show what they memorized. Not how they think.
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-[#424F63] sm:text-lg">
              Most kids rush to the first answer that looks right. In 15 free
              minutes, see how your child handles a tricky clue, spots a weak
              claim, and explains their reason in their own words.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleStart}
                className="cx-action-pill bg-[#142033] px-7 py-3.5 text-sm text-white hover:bg-[#066869] cursor-pointer"
              >
                <span>Take Free 15-Min Thinking Test</span>
                <span aria-hidden="true">→</span>
              </button>

              <a
                href="#sandbox"
                className="rounded-full border border-[#142033]/20 bg-white px-6 py-3.5 text-sm font-semibold text-[#142033] hover:border-[#142033] transition"
              >
                Try 1 puzzle right now ↓
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 text-xs font-medium text-[#424F63]">
              <span>
                Free plan ({FREE_DAILY_MISSIONS} daily missions + Try at Home)
              </span>
              <span>·</span>
              <span>
                Full unlock ₹{TRIAL_PRICE_INR} for {TRIAL_DAYS} days
              </span>
            </div>
          </div>

          {/* LIVE MOVING PREVIEW */}
          <div
            onMouseEnter={() => setHeroPaused(true)}
            onMouseLeave={() => setHeroPaused(false)}
            className="cx-soft-float"
          >
            <div className="rounded-[28px] border border-[#142033]/14 bg-white p-5 sm:p-7 shadow-[var(--shadow-device)] space-y-5">
              <div className="flex items-center justify-between gap-3 border-b border-[#142033]/10 pb-4">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F7F6F1] font-display text-xs font-extrabold text-[#142033]">
                    CX
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-xs font-bold text-[#142033]">
                      {activeFrame.contextLine}
                    </div>
                    <div className="font-mono-tech text-[10px] text-[#424F63]">
                      {activeFrame.footnote}
                    </div>
                  </div>
                </div>

                <span
                  className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    activeFrame.statusTone === 'teal'
                      ? 'bg-[#066869]/10 text-[#066869]'
                      : activeFrame.statusTone === 'amber'
                      ? 'bg-[#F5B942]/25 text-[#6E4700]'
                      : 'bg-[#142033]/10 text-[#142033]'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      activeFrame.statusTone === 'teal'
                        ? 'bg-[#066869]'
                        : activeFrame.statusTone === 'amber'
                        ? 'bg-[#8A5A00]'
                        : 'bg-[#142033]'
                    }`}
                  />
                  {activeFrame.statusLabel}
                </span>
              </div>

              <div key={activeFrame.id} className="cx-screen-enter space-y-4">
                <h2 className="font-display text-lg sm:text-xl font-extrabold text-[#142033] leading-snug">
                  {activeFrame.title}
                </h2>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-[#142033]/10 bg-[#F7F6F1] p-4">
                    <div className="text-[11px] font-semibold text-[#424F63]">
                      {activeFrame.leftLabel}
                    </div>
                    <div className="mt-1 font-display text-2xl font-extrabold tabular-nums text-[#142033]">
                      {activeFrame.leftValue}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-[#066869]/25 bg-[#066869]/[0.06] p-4">
                    <div className="text-[11px] font-semibold text-[#066869]">
                      {activeFrame.rightLabel}
                    </div>
                    <div className="mt-1 font-display text-2xl font-extrabold tabular-nums text-[#066869]">
                      {activeFrame.rightValue}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#142033]/10 bg-[#FFFDF7] px-4 py-3.5 text-xs sm:text-sm text-[#142033] leading-relaxed">
                  {activeFrame.transcript}
                </div>
              </div>

              <div className="space-y-2.5 pt-1">
                <div className="grid grid-cols-4 gap-2">
                  {HERO_FRAMES.map((frame, idx) => {
                    const isCurrent = idx === frameIdx;
                    const isPast = idx < frameIdx;
                    return (
                      <button
                        key={frame.id}
                        type="button"
                        aria-pressed={isCurrent}
                        onClick={() => {
                          triggerDialTick(false);
                          setFrameIdx(idx);
                        }}
                        className="space-y-1.5 rounded-md p-1 text-left cursor-pointer group"
                      >
                        <div className="h-1 w-full overflow-hidden rounded-full bg-[#142033]/12">
                          {isCurrent && !heroPaused ? (
                            <div
                              key={`${frame.id}-sweep`}
                              className="h-full w-full bg-[#066869] cx-progress-sweep"
                            />
                          ) : (
                            <div
                              className={`h-full transition-all ${
                                isCurrent || isPast
                                  ? 'w-full bg-[#066869]'
                                  : 'w-0 bg-[#066869]'
                              }`}
                            />
                          )}
                        </div>
                        <span
                          className={`block truncate font-mono-tech text-[10px] font-semibold ${
                            isCurrent
                              ? 'text-[#142033]'
                              : 'text-[#424F63] group-hover:text-[#142033]'
                          }`}
                        >
                          {frame.tabLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setHeroPaused((p) => !p)}
                    className="rounded px-1.5 py-0.5 font-mono-tech text-[10px] font-semibold text-[#424F63] hover:text-[#142033] cursor-pointer"
                  >
                    {heroPaused ? 'Resume live preview' : 'Pause preview'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            02 · LIVE INTERACTIVE SANDBOX (FULL WAI-ARIA TABS)
            ================================================================= */}
        <section id="sandbox" className="cx-hairline-t py-16 sm:py-24 space-y-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl space-y-2">
              <div className="font-mono-tech text-[10px] font-bold uppercase tracking-[0.16em] text-[#066869]">
                Try It Yourself
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#142033]">
                See how fast a first guess fools even adults.
              </h2>
            </div>

            <div
              role="tablist"
              aria-label="Choose a live demo"
              className="inline-flex rounded-full border border-[#142033]/15 bg-white p-1"
            >
              <button
                ref={missionTabRef}
                id="tab-mission"
                type="button"
                role="tab"
                aria-selected={sandboxTab === 'mission'}
                aria-controls="panel-mission"
                tabIndex={sandboxTab === 'mission' ? 0 : -1}
                onKeyDown={handleSandboxTabKeyDown}
                onClick={() => {
                  triggerDialTick(false);
                  setSandboxTab('mission');
                }}
                className={`rounded-full px-4 py-2 text-xs font-bold transition cursor-pointer ${
                  sandboxTab === 'mission'
                    ? 'bg-[#142033] text-white'
                    : 'text-[#424F63] hover:text-[#142033]'
                }`}
              >
                Daily Mission
              </button>
              <button
                ref={sheetTabRef}
                id="tab-sheet"
                type="button"
                role="tab"
                aria-selected={sandboxTab === 'sheet'}
                aria-controls="panel-sheet"
                tabIndex={sandboxTab === 'sheet' ? 0 : -1}
                onKeyDown={handleSandboxTabKeyDown}
                onClick={() => {
                  triggerDialTick(false);
                  setSandboxTab('sheet');
                }}
                className={`rounded-full px-4 py-2 text-xs font-bold transition cursor-pointer ${
                  sandboxTab === 'sheet'
                    ? 'bg-[#142033] text-white'
                    : 'text-[#424F63] hover:text-[#142033]'
                }`}
              >
                Thinking Sheet
              </button>
            </div>
          </div>

          {sandboxTab === 'mission' ? (
            <div
              id="panel-mission"
              role="tabpanel"
              aria-labelledby="tab-mission"
              tabIndex={0}
              className="grid grid-cols-1 gap-8 rounded-[28px] border border-[#142033]/12 bg-white p-6 sm:p-10 shadow-[var(--shadow-artifact)] lg:grid-cols-[0.9fr_1.1fr] items-center"
            >
              <div className="space-y-4">
                <span className="font-mono-tech text-[10px] font-bold uppercase tracking-[0.16em] text-[#066869]">
                  Mission Demo · Secret Machine
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[#142033]">
                  One clue can trick you. Two clues show the truth.
                </h3>
                <p className="text-sm text-[#424F63] leading-relaxed">
                  Put numbers into this machine and watch what comes out. Most
                  kids lock in a rule after one try. Watch what happens when you
                  test a second number.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <span className="rounded-full bg-[#F7F6F1] border border-[#142033]/12 px-3 py-1 font-mono-tech text-[11px] font-semibold text-[#142033] tabular-nums">
                    {probes.length} test{probes.length === 1 ? '' : 's'} tried
                  </span>
                  <button
                    type="button"
                    onClick={resetMachine}
                    className="rounded px-2 py-1 text-xs font-semibold text-[#424F63] hover:text-[#142033] underline underline-offset-4 cursor-pointer"
                  >
                    Reset machine
                  </button>
                </div>
              </div>

              <div className="space-y-5 rounded-2xl border border-[#142033]/12 bg-[#F7F6F1] p-5 sm:p-6">
                <div className="grid grid-cols-3 items-center gap-3 rounded-2xl border border-[#142033]/10 bg-white p-4 text-center">
                  <div>
                    <div className="font-mono-tech text-[10px] font-semibold uppercase text-[#424F63]">
                      Input
                    </div>
                    <div className="mt-1 font-display text-3xl font-extrabold tabular-nums text-[#142033]">
                      {machineInput}
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="rounded-full bg-[#142033] px-3 py-1 font-mono-tech text-xs font-bold text-white">
                      Rule
                    </span>
                  </div>
                  <div>
                    <div className="font-mono-tech text-[10px] font-semibold uppercase text-[#066869]">
                      Output
                    </div>
                    <div className="mt-1 font-display text-3xl font-extrabold tabular-nums text-[#066869]">
                      {machineInput * 3}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold text-[#424F63]">
                    Tap another number to test:
                  </div>
                  <div
                    role="group"
                    aria-label="Test input numbers"
                    className="grid grid-cols-5 gap-2"
                  >
                    {[2, 3, 4, 5, 7].map((n) => (
                      <button
                        key={n}
                        type="button"
                        aria-pressed={machineInput === n}
                        aria-label={`Test number ${n}`}
                        onClick={() => handleProbe(n)}
                        className={`rounded-xl border py-2.5 font-display text-base font-extrabold tabular-nums transition cursor-pointer ${
                          machineInput === n
                            ? 'border-[#142033] bg-[#142033] text-white'
                            : 'border-[#142033]/15 bg-white text-[#142033] hover:border-[#066869]'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold text-[#424F63]">
                    Which rule fits every number you tested?
                  </div>
                  <div
                    role="group"
                    aria-label="Choose the hidden rule"
                    className="grid grid-cols-2 gap-2.5"
                  >
                    <button
                      type="button"
                      aria-pressed={ruleGuess === 'plus6'}
                      onClick={() => {
                        triggerDialTick(false);
                        setRuleGuess('plus6');
                      }}
                      className={`rounded-xl border p-3 text-left text-xs font-bold transition cursor-pointer ${
                        ruleGuess === 'plus6'
                          ? 'border-[#C83E2B] bg-[#F07868]/12 text-[#8F2416]'
                          : 'border-[#142033]/15 bg-white text-[#142033] hover:border-[#142033]/50'
                      }`}
                    >
                      Input + 6
                    </button>
                    <button
                      type="button"
                      aria-pressed={ruleGuess === 'times3'}
                      onClick={() => {
                        triggerSoftConfirm(true);
                        setRuleGuess('times3');
                      }}
                      className={`rounded-xl border p-3 text-left text-xs font-bold transition cursor-pointer ${
                        ruleGuess === 'times3'
                          ? 'border-[#066869] bg-[#066869]/10 text-[#066869]'
                          : 'border-[#142033]/15 bg-white text-[#142033] hover:border-[#142033]/50'
                      }`}
                    >
                      Input × 3
                    </button>
                  </div>

                  {ruleGuess === 'plus6' && (
                    <p
                      role="status"
                      className="rounded-xl border border-[#C83E2B]/30 bg-white px-3.5 py-2.5 text-xs font-medium text-[#8F2416]"
                    >
                      3 + 6 = 9 works once, but tap 5 above. 5 + 6 would be 11,
                      not 15.
                    </p>
                  )}
                  {ruleGuess === 'times3' && (
                    <p
                      role="status"
                      className="rounded-xl border border-[#066869]/30 bg-white px-3.5 py-2.5 text-xs font-semibold text-[#066869]"
                    >
                      Fits every tested number. That is checking proof before
                      deciding.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div
              id="panel-sheet"
              role="tabpanel"
              aria-labelledby="tab-sheet"
              tabIndex={0}
              className="grid grid-cols-1 gap-8 rounded-[28px] border border-[#142033]/12 bg-white p-6 sm:p-10 shadow-[var(--shadow-artifact)] lg:grid-cols-[0.9fr_1.1fr] items-center"
            >
              <div className="space-y-4">
                <span className="font-mono-tech text-[10px] font-bold uppercase tracking-[0.16em] text-[#066869]">
                  Thinking Sheet Demo · Anti-Copy
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[#142033]">
                  Same chapter. Different version for every child.
                </h3>
                <p className="text-sm text-[#424F63] leading-relaxed">
                  Matched to your child’s Class (5 to 10) and Board. No
                  memorized textbook definitions. Free gives{' '}
                  {FREE_THINKING_SHEET_LIMIT} questions; Paid opens{' '}
                  {PAID_THINKING_SHEET_MIN}+ per chapter.
                </p>

                <div
                  role="group"
                  aria-label="Preview board"
                  className="flex flex-wrap gap-2 pt-1"
                >
                  {(['CBSE', 'Maharashtra State Board'] as const).map((b) => (
                    <button
                      key={b}
                      type="button"
                      aria-pressed={sheetBoard === b}
                      onClick={() => {
                        triggerDialTick(false);
                        setSheetBoard(b);
                      }}
                      className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                        sheetBoard === b
                          ? 'border-[#142033] bg-[#142033] text-white'
                          : 'border-[#142033]/18 bg-[#F7F6F1] text-[#424F63] hover:text-[#142033]'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 rounded-2xl border border-[#142033]/12 bg-[#F7F6F1] p-5 sm:p-6">
                <div className="flex items-center justify-between text-[11px] font-semibold text-[#424F63]">
                  <span>Class 6 · {sheetBoard} · Science</span>
                  <span className="font-mono-tech text-[#066869]">
                    Step 2 · What is really happening?
                  </span>
                </div>

                <p className="text-sm font-semibold text-[#142033] leading-relaxed">
                  Two classmates planted the same seeds in opposite corners of
                  the school garden. After three weeks, one grew much taller.
                  Which explanation misses an important clue?
                </p>

                <div className="space-y-2">
                  {[
                    '“The taller plant must have stronger seeds, because both were watered every morning.”',
                    '“Before blaming the seeds, we should check how many hours of sunlight each corner gets.”',
                  ].map((viewpoint, idx) => (
                    <button
                      key={idx}
                      type="button"
                      aria-pressed={sheetPick === idx}
                      onClick={() => {
                        triggerDialTick(true);
                        setSheetPick(idx);
                      }}
                      className={`w-full rounded-xl border p-3.5 text-left text-xs sm:text-sm font-medium transition cursor-pointer ${
                        sheetPick === idx
                          ? 'border-[#066869] bg-white text-[#142033]'
                          : 'border-[#142033]/12 bg-white/80 text-[#424F63] hover:border-[#142033]/40 hover:text-[#142033]'
                      }`}
                    >
                      {viewpoint}
                    </button>
                  ))}
                </div>

                {sheetPick !== null && (
                  <p
                    role="status"
                    className="rounded-xl border border-[#066869]/25 bg-white px-4 py-3 text-xs text-[#142033]"
                  >
                    {sheetPick === 0
                      ? 'Good catch. It ignores sunlight and soil differences. Next, the child explains why in one short line of their own words.'
                      : 'That second idea actually checks the missing clue. Look at the first one: it jumps straight to seeds without checking sunlight.'}
                  </p>
                )}
              </div>
            </div>
          )}
        </section>

        {/* =================================================================
            03 · HOW CUBITX WORKS
            ================================================================= */}
        <section id="how-it-works" className="cx-hairline-t py-16 sm:py-24 space-y-14">
          <div className="max-w-2xl space-y-2">
            <div className="font-mono-tech text-[10px] font-bold uppercase tracking-[0.16em] text-[#066869]">
              How It Works
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#142033]">
              10 minutes after school. Three habits that actually stick.
            </h2>
          </div>

          <div className="divide-y divide-[#142033]/12 border-t border-b border-[#142033]/12">
            <div className="grid grid-cols-1 gap-8 py-10 lg:grid-cols-[0.9fr_1.1fr] items-center">
              <div className="space-y-2.5">
                <div className="font-mono-tech text-[11px] font-bold text-[#066869]">
                  01 · Daily Missions &amp; Weekly Championship
                </div>
                <h3 className="font-display text-2xl font-extrabold text-[#142033]">
                  Short daily puzzles kids want to finish on their own.
                </h3>
                <p className="text-sm text-[#424F63] leading-relaxed">
                  Your child solves {FREE_DAILY_MISSIONS} daily missions free,
                  joins the weekend Weekly Championship, and can earn Monthly
                  Awards for sharp reasoning instead of rote speed.
                </p>
              </div>

              <div className="grid grid-cols-4 gap-2.5">
                {[
                  { day: 'Thu', num: '19', status: 'Done', active: false },
                  { day: 'Fri', num: '20', status: 'Done', active: false },
                  { day: 'Today', num: '21', status: 'Open', active: true },
                  { day: 'Wknd', num: '🏆', status: 'Champ', active: false },
                ].map((d) => (
                  <div
                    key={d.day}
                    className={`rounded-2xl border p-4 ${
                      d.active
                        ? 'border-[#142033] bg-[#142033] text-white'
                        : d.status === 'Done'
                        ? 'border-[#066869]/30 bg-[#066869]/[0.06] text-[#142033]'
                        : 'border-[#142033]/12 bg-white text-[#424F63]'
                    }`}
                  >
                    <div
                      className={`font-mono-tech text-[10px] font-semibold uppercase ${
                        d.active ? 'text-white/80' : 'text-[#424F63]'
                      }`}
                    >
                      {d.day}
                    </div>
                    <div className="mt-1 font-display text-2xl font-extrabold tabular-nums">
                      {d.num}
                    </div>
                    <div
                      className={`mt-1.5 text-[10px] font-semibold ${
                        d.active
                          ? 'text-[#55E2CE]'
                          : d.status === 'Done'
                          ? 'text-[#066869]'
                          : 'text-[#424F63]'
                      }`}
                    >
                      {d.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 py-10 lg:grid-cols-[0.9fr_1.1fr] items-center">
              <div className="space-y-2.5">
                <div className="font-mono-tech text-[11px] font-bold text-[#066869]">
                  02 · Thinking Sheets (CBSE &amp; Maharashtra Board)
                </div>
                <h3 className="font-display text-2xl font-extrabold text-[#142033]">
                  School chapters without rote memorization.
                </h3>
                <p className="text-sm text-[#424F63] leading-relaxed">
                  Matched to your child’s class and board. Instead of asking for
                  textbook definitions, every question asks what is really
                  happening and lets them explain it to a friend.
                </p>
              </div>

              <div className="rounded-2xl border border-[#142033]/12 bg-white divide-y divide-[#142033]/10">
                {[
                  {
                    subject: 'Science & EVS',
                    meta: 'Real-life puzzles behind every chapter',
                    tag: '4 Free / 12+ Paid',
                  },
                  {
                    subject: 'History',
                    meta: 'Source checks and missing viewpoints',
                    tag: '4 Free / 12+ Paid',
                  },
                  {
                    subject: 'Geography',
                    meta: 'Cause, climate, and trade-off prompts',
                    tag: '4 Free / 12+ Paid',
                  },
                  {
                    subject: 'Extra Curricular',
                    meta: 'AI claims, money sense, and daily logic',
                    tag: '4 Free / 12+ Paid',
                  },
                ].map((row) => (
                  <div
                    key={row.subject}
                    className="flex items-center justify-between gap-4 px-5 py-3.5"
                  >
                    <div>
                      <div className="font-display text-sm font-bold text-[#142033]">
                        {row.subject}
                      </div>
                      <div className="text-xs text-[#424F63]">{row.meta}</div>
                    </div>
                    <span className="shrink-0 rounded-full bg-[#F7F6F1] px-3 py-0.5 font-mono-tech text-[10px] font-semibold text-[#424F63]">
                      {row.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 py-10 lg:grid-cols-[0.9fr_1.1fr] items-center">
              <div className="space-y-2.5">
                <div className="font-mono-tech text-[11px] font-bold text-[#066869]">
                  03 · Parent View &amp; Try at Home
                </div>
                <h3 className="font-display text-2xl font-extrabold text-[#142033]">
                  See how they think, not a meaningless percentage.
                </h3>
                <p className="text-sm text-[#424F63] leading-relaxed">
                  Every plan shows clear activity counts and full Try at Home
                  dinner prompts. Unlock the PIN-protected Parent View for
                  verbatim quotes, step-by-step replays, and all 8 thinking
                  areas.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {EIGHT_SKILLS_PREVIEW.map((skill) => (
                  <div
                    key={skill.code}
                    className="flex items-center justify-between gap-2 rounded-xl border border-[#142033]/12 bg-white px-3.5 py-2.5"
                  >
                    <span className="truncate text-xs font-semibold text-[#142033]">
                      <span className="font-mono-tech text-[#424F63] mr-1.5">
                        {skill.code}
                      </span>
                      {skill.name}
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        skill.status === 'Observed'
                          ? 'bg-[#066869]/10 text-[#066869]'
                          : skill.status === 'Early signal'
                          ? 'bg-[#F5B942]/25 text-[#6E4700]'
                          : 'bg-[#F7F6F1] text-[#424F63]'
                      }`}
                    >
                      {skill.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            04 · PARTNER WITH US (FOR SCHOOLS)
            ================================================================= */}
        <section id="schools" className="py-12 sm:py-16">
          <div className="rounded-[28px] border border-[#142033]/14 bg-white p-7 sm:p-10 shadow-[var(--shadow-artifact)] grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr] items-center">
            <div className="space-y-3">
              <div className="font-mono-tech text-[10px] font-bold uppercase tracking-[0.16em] text-[#066869]">
                Partner With Us · For Schools
              </div>
              <h2 className="font-display text-3xl font-extrabold text-[#142033]">
                A thinking period your teachers can run with zero extra grading.
              </h2>
              <p className="text-sm text-[#424F63] leading-relaxed">
                Partner schools get class-wide Teacher Dashboards, guided
                School-Level Activities, Weekly Championship participation, and
                Monthly Awards for Classes 5 to 10.
              </p>
              <p className="text-xs font-semibold text-[#066869]">
                Joined individually first? If your child’s school partners with
                CubitX later, your remaining balance carries forward to next
                year automatically.
              </p>
            </div>

            <div className="rounded-2xl border border-[#142033]/12 bg-[#F7F6F1] p-6 space-y-4">
              <ul className="space-y-2 text-xs sm:text-sm font-medium text-[#142033]">
                <li className="flex items-center gap-2">
                  <span className="text-[#066869] font-bold">✓</span>
                  <span>Class-wide Teacher Dashboard (no student shaming)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#066869] font-bold">✓</span>
                  <span>Ready-to-run School-Level Activity kits</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#066869] font-bold">✓</span>
                  <span>Weekly Championship &amp; Monthly Awards</span>
                </li>
              </ul>

              <div className="flex flex-wrap gap-2.5 pt-1">
                <a
                  href="mailto:hello@cubitx.in?subject=CubitX%20School%20Partnership%20Inquiry"
                  className="cx-action-pill bg-[#142033] px-5 py-3 text-xs text-white hover:bg-[#066869]"
                >
                  Partner with us →
                </a>
                <button
                  type="button"
                  onClick={() => navigate('/teacher')}
                  className="rounded-full border border-[#142033]/20 bg-white px-5 py-3 text-xs font-bold text-[#142033] hover:border-[#142033] transition cursor-pointer"
                >
                  Teacher Sign In
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            05 · TRANSPARENT PLANS
            ================================================================= */}
        <section id="access" className="cx-hairline-t py-16 sm:py-24 space-y-10">
          <div className="max-w-2xl space-y-2">
            <div className="font-mono-tech text-[10px] font-bold uppercase tracking-[0.16em] text-[#066869]">
              Simple Pricing
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#142033]">
              Try it free first. Pay ₹{TRIAL_PRICE_INR} only if you see a difference.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {/* FREE PLAN */}
            <div className="rounded-3xl border border-[#142033]/14 bg-white p-7 flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <div className="font-mono-tech text-[10px] font-bold uppercase tracking-widest text-[#424F63]">
                  Free Forever
                </div>
                <div className="font-display text-3xl font-extrabold text-[#142033]">
                  ₹0
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-[#424F63]">
                  <li>✓ Free 15-Minute Thinking Test</li>
                  <li>✓ {FREE_DAILY_MISSIONS} daily missions every day</li>
                  <li>✓ Try at Home (full access)</li>
                  <li>
                    ✓ {FREE_THINKING_SHEET_LIMIT} Thinking Sheet questions /
                    chapter
                  </li>
                  <li>✓ Clear activity counts in Parent View</li>
                </ul>
              </div>
              <button
                type="button"
                onClick={handleStart}
                className="w-full rounded-full border border-[#142033]/25 py-3 text-xs font-extrabold text-[#142033] hover:border-[#142033] transition cursor-pointer"
              >
                Start Free →
              </button>
            </div>

            {/* ₹49 / 7 DAYS */}
            <div className="rounded-3xl border-2 border-[#066869] bg-white p-7 shadow-[var(--shadow-artifact)] flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono-tech text-[10px] font-bold uppercase tracking-widest text-[#066869]">
                    7-Day Full Trial
                  </span>
                  <span className="rounded-full bg-[#066869]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#066869]">
                    Best way to test
                  </span>
                </div>
                <div>
                  <span className="font-display text-3xl font-extrabold tabular-nums text-[#142033]">
                    ₹{TRIAL_PRICE_INR}
                  </span>
                  <span className="text-xs font-semibold text-[#424F63]">
                    {' '}
                    / {TRIAL_DAYS} days
                  </span>
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-[#142033]">
                  <li>✓ Full unblurred Parent View + Replay</li>
                  <li>
                    ✓ {PAID_THINKING_SHEET_MIN}+ tailored Thinking Sheet
                    questions / chapter
                  </li>
                  <li>✓ Weekly Championship + Monthly Awards</li>
                  <li>✓ Up to 3 child profiles</li>
                  <li>✓ No auto-debit after {TRIAL_DAYS} days</li>
                </ul>
              </div>
              <button
                type="button"
                onClick={handleStart}
                className="cx-action-pill w-full bg-[#142033] py-3.5 text-xs text-white hover:bg-[#066869] cursor-pointer"
              >
                Try {TRIAL_DAYS} Days for ₹{TRIAL_PRICE_INR} →
              </button>
            </div>

            {/* ₹999 / YEAR */}
            <div className="rounded-3xl border border-[#142033]/14 bg-white p-7 flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <div className="font-mono-tech text-[10px] font-bold uppercase tracking-widest text-[#424F63]">
                  Full Year Family Plan
                </div>
                <div>
                  <span className="font-display text-3xl font-extrabold tabular-nums text-[#142033]">
                    ₹{PRICE_INR}
                  </span>
                  <span className="text-xs font-semibold text-[#424F63]">
                    {' '}
                    / year
                  </span>
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-[#424F63]">
                  <li>✓ Everything unlocked for 12 months</li>
                  <li>✓ Up to 3 child profiles (Classes 5 to 10)</li>
                  <li>✓ CBSE &amp; Maharashtra State Board sheets</li>
                  <li>✓ School credit carry-forward guarantee</li>
                  <li>✓ Manual renewal only</li>
                </ul>
              </div>
              <button
                type="button"
                onClick={handleStart}
                className="w-full rounded-full border border-[#142033]/25 py-3 text-xs font-extrabold text-[#142033] hover:bg-[#142033] hover:text-white transition cursor-pointer"
              >
                Get Full Year →
              </button>
            </div>
          </div>
        </section>

        {/* =================================================================
            06 · FAQ ACCORDION
            ================================================================= */}
        <section id="faq" className="cx-hairline-t py-16 sm:py-24">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.75fr_1.25fr]">
            <div className="space-y-2">
              <div className="font-mono-tech text-[10px] font-bold uppercase tracking-[0.16em] text-[#066869]">
                Questions
              </div>
              <h2 className="font-display text-3xl font-extrabold text-[#142033]">
                Common questions parents ask.
              </h2>
            </div>

            <div className="divide-y divide-[#142033]/12 border-t border-b border-[#142033]/12">
              {FAQ_ITEMS.map((item, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={item.q}>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => {
                        triggerDialTick(false);
                        setOpenFaq(isOpen ? null : idx);
                      }}
                      className="flex w-full items-center justify-between gap-4 py-5 text-left cursor-pointer"
                    >
                      <span className="font-display text-base font-bold text-[#142033]">
                        {item.q}
                      </span>
                      <span
                        aria-hidden="true"
                        className="font-mono-tech text-lg font-medium text-[#424F63]"
                      >
                        {isOpen ? '−' : '+'}
                      </span>
                    </button>
                    {isOpen && (
                      <p className="pb-5 pr-8 text-sm text-[#424F63] leading-relaxed">
                        {item.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#142033]/12 bg-[#EFECE3]/60 py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 sm:px-6 text-xs text-[#424F63]">
          <div className="font-display font-bold text-[#142033]">
            CubitX · Train the mind behind the marks.
          </div>
          <div>© 2026 CubitX · hello@cubitx.in</div>
        </div>
      </footer>
    </div>
  );
}