import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PRICE_INR, TRIAL_DAYS } from '../config';
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
    id: 'mission-probe',
    tabLabel: '01 · Mission',
    contextLine: 'Neeta · Class 6 · Secret Machine',
    statusLabel: 'Testing clues',
    statusTone: 'teal',
    title: 'Checks a second input before locking in a rule',
    leftLabel: 'Input tried',
    leftValue: '3 → 9',
    rightLabel: 'Next check',
    rightValue: '5 → 15',
    transcript:
      '“3 gave 9, which could be +6 or ×3. Testing 5 gave 15, so adding 6 doesn’t hold.”',
    footnote: 'Observed · Using evidence (B2)',
  },
  {
    id: 'thinking-sheet',
    tabLabel: '02 · Sheet',
    contextLine: 'Class 6 · CBSE · Science',
    statusLabel: 'After class',
    statusTone: 'amber',
    title: 'Spots the reasoning gap in a real-world chapter twist',
    leftLabel: 'Step 2 of 3',
    leftValue: 'Spot the Catch',
    rightLabel: 'Student note',
    rightValue: 'Saved',
    transcript:
      '“Both plants got water, so we can’t blame soil until we check sunlight hours.”',
    footnote: 'Auto-matched to Class 5–10 · CBSE & Maharashtra Board',
  },
  {
    id: 'parent-replay',
    tabLabel: '03 · Parent View',
    contextLine: 'PIN / Fingerprint Protected · Parent Snapshot',
    statusLabel: 'Observed',
    statusTone: 'ink',
    title: 'See the exact thinking steps—without marks or IQ scores',
    leftLabel: 'Clue-testing habit',
    leftValue: '78%',
    rightLabel: 'Skills explored',
    rightValue: '5 of 8',
    transcript:
      'Earlier: picked on the first hunch. More recently: tests an extra clue before deciding.',
    footnote: 'Step-by-step deterministic replay · Zero streak guilt',
  },
  {
    id: 'try-at-home',
    tabLabel: '04 · Try at Home',
    contextLine: 'Dinner-Table Prompt · The 10-Second Rule',
    statusLabel: 'For parents',
    statusTone: 'teal',
    title: 'One calm everyday question—no worksheets required',
    leftLabel: 'Skill',
    leftValue: 'Missing Info',
    rightLabel: 'Golden rule',
    rightValue: 'Wait 10s',
    transcript:
      '“That ad says 2× energy. Who did they test it on, and what aren’t they telling us?”',
    footnote: 'Stay quiet for 10 seconds. Let them think without hints.',
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
    q: 'Does CubitX give marks, ranks, or IQ scores?',
    a: 'Never. Marks and rankings make children rush for the “safe” answer. CubitX logs observable thinking habits—like checking an extra clue or updating a first guess—and shows them to parents in plain English.',
  },
  {
    q: 'How do Thinking Sheets match my child’s school syllabus?',
    a: 'When you add your child’s profile, you pick their Class (5–10) and School Board (CBSE or Maharashtra State Board). CubitX automatically loads chapter-aligned Thinking Sheets across Science, History, Geography, and Extra Curricular.',
  },
  {
    q: 'Can my child open Parent View by mistake?',
    a: 'No. Both Parent View and Try at Home are protected by a 4-digit Parent PIN with optional Fingerprint / Face ID unlock on supported devices.',
  },
  {
    q: 'What happens if my child skips a few days?',
    a: 'Nothing breaks. Missions are organised by calendar date with zero streak-loss penalties or “falling behind” alerts. Children can pick today’s date or revisit any earlier date calmly.',
  },
  {
    q: 'How does pricing and renewal work?',
    a: `You start with a full ${TRIAL_DAYS}-day free trial with no card required. After that, full annual access is ₹${PRICE_INR}/year for up to 3 child profiles—manual renewal only, with no automatic recurring charges.`,
  },
];

export default function Landing() {
  const navigate = useNavigate();

  // Moving Hero Screen State
  const [frameIdx, setFrameIdx] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);

  // Interactive Sandbox State (Mission vs Thinking Sheet)
  const [sandboxTab, setSandboxTab] = useState<'mission' | 'sheet'>('mission');
  const [machineInput, setMachineInput] = useState<number>(3);
  const [probes, setProbes] = useState<Array<{ x: number; y: number }>>([
    { x: 3, y: 9 },
  ]);
  const [ruleGuess, setRuleGuess] = useState<'plus6' | 'times3' | null>(null);

  // Interactive Thinking Sheet Preview State
  const [sheetBoard, setSheetBoard] = useState<
    'CBSE' | 'Maharashtra State Board'
  >('CBSE');
  const [sheetPick, setSheetPick] = useState<number | null>(null);

  // FAQ State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    if (heroPaused) return;
    const id = window.setInterval(() => {
      setFrameIdx((prev) => (prev + 1) % HERO_FRAMES.length);
    }, 4200);
    return () => window.clearInterval(id);
  }, [heroPaused]);

  const activeFrame = HERO_FRAMES[frameIdx];

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
      {/* =================================================================
          CLEAN EDITORIAL HEADER (SINGLE TOP BAR)
          ================================================================= */}
      <header className="sticky top-0 z-50 border-b border-[#142033]/10 bg-[#F7F6F1]/90 backdrop-blur-xl">
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
            className="hidden md:flex items-center gap-7 text-xs font-semibold text-[#586579]"
          >
            <a href="#sandbox" className="hover:text-[#142033] transition">
              Try it live
            </a>
            <a href="#how-it-works" className="hover:text-[#142033] transition">
              How it works
            </a>
            <a href="#parents" className="hover:text-[#142033] transition">
              Parent View
            </a>
            <a href="#access" className="hover:text-[#142033] transition">
              Access
            </a>
            <a href="#faq" className="hover:text-[#142033] transition">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate('/signin')}
              className="px-3 py-2 text-xs font-semibold text-[#586579] hover:text-[#142033] transition cursor-pointer"
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={handleStart}
              className="cx-action-pill bg-[#142033] px-4 py-2 text-xs text-white hover:bg-[#087F80] cursor-pointer"
            >
              Start free →
            </button>
          </div>
        </div>
      </header>

      <main id="top" className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* =================================================================
            01 · HERO — CALM EDITORIAL COPY + MOVING LIVE PRODUCT SCREEN
            ================================================================= */}
        <section className="grid grid-cols-1 items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.02fr_0.98fr] lg:py-24">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#142033]/10 bg-white px-3.5 py-1.5 text-xs font-medium text-[#586579]">
              <span className="h-2 w-2 rounded-full bg-[#087F80]" />
              <span>Classes 5–10</span>
              <span className="text-[#142033]/25">·</span>
              <span className="font-semibold text-[#142033]">
                CBSE &amp; Maharashtra State Board
              </span>
            </div>

            <h1 className="font-display text-4xl font-extrabold leading-[1.04] tracking-tight text-[#142033] sm:text-5xl lg:text-[60px]">
              Eyes on how they think, not just the final answer.
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-[#586579] sm:text-lg">
              Daily thinking missions and syllabus-connected Thinking Sheets
              that help children test clues, spot weak reasoning, and explain
              ideas in their own words—without marks, timers, or streak guilt.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleStart}
                className="cx-action-pill bg-[#142033] px-7 py-3.5 text-sm text-white hover:bg-[#087F80] cursor-pointer"
              >
                <span>Start {TRIAL_DAYS}-day free trial</span>
                <span aria-hidden="true">→</span>
              </button>

              <a
                href="#sandbox"
                className="rounded-full border border-[#142033]/15 bg-white px-6 py-3.5 text-sm font-semibold text-[#142033] hover:border-[#142033]/40 transition"
              >
                Try a live mission ↓
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs font-medium text-[#586579]">
              <span>No credit card needed</span>
              <span>·</span>
              <span>Up to 3 child profiles</span>
              <span>·</span>
              <span>PIN-locked Parent View</span>
            </div>
          </div>

          {/* LIVE MOVING PRODUCT SCREEN (CADENCE STYLE) */}
          <div
            onMouseEnter={() => setHeroPaused(true)}
            onMouseLeave={() => setHeroPaused(false)}
            className="cx-soft-float"
          >
            <div className="rounded-[28px] border border-[#142033]/12 bg-white p-5 sm:p-7 shadow-[var(--shadow-device)] space-y-5">
              {/* TOP ARTIFACT BAR */}
              <div className="flex items-center justify-between gap-3 border-b border-[#142033]/8 pb-4">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F7F6F1] font-display text-xs font-extrabold text-[#142033]">
                    N
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-xs font-bold text-[#142033]">
                      {activeFrame.contextLine}
                    </div>
                    <div className="font-mono-tech text-[10px] text-[#586579]">
                      {activeFrame.footnote}
                    </div>
                  </div>
                </div>

                <span
                  className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    activeFrame.statusTone === 'teal'
                      ? 'bg-[#087F80]/10 text-[#087F80]'
                      : activeFrame.statusTone === 'amber'
                      ? 'bg-[#F5B942]/20 text-[#8A5A00]'
                      : 'bg-[#142033]/8 text-[#142033]'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      activeFrame.statusTone === 'teal'
                        ? 'bg-[#087F80]'
                        : activeFrame.statusTone === 'amber'
                        ? 'bg-[#F5B942]'
                        : 'bg-[#142033]'
                    }`}
                  />
                  {activeFrame.statusLabel}
                </span>
              </div>

              {/* ANIMATED FRAME CONTENT */}
              <div key={activeFrame.id} className="cx-screen-enter space-y-4">
                <h2 className="font-display text-lg sm:text-xl font-extrabold text-[#142033] leading-snug">
                  {activeFrame.title}
                </h2>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-[#142033]/8 bg-[#F7F6F1] p-4">
                    <div className="text-[11px] font-medium text-[#586579]">
                      {activeFrame.leftLabel}
                    </div>
                    <div className="mt-1 font-display text-2xl font-extrabold tabular-nums text-[#142033]">
                      {activeFrame.leftValue}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-[#087F80]/20 bg-[#087F80]/[0.05] p-4">
                    <div className="text-[11px] font-medium text-[#087F80]">
                      {activeFrame.rightLabel}
                    </div>
                    <div className="mt-1 font-display text-2xl font-extrabold tabular-nums text-[#087F80]">
                      {activeFrame.rightValue}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#142033]/8 bg-[#FFFDF7] px-4 py-3.5 text-xs sm:text-sm text-[#142033] leading-relaxed">
                  {activeFrame.transcript}
                </div>
              </div>

              {/* INTERACTIVE 4-STAGE PROGRESS STEPPER */}
              <div className="space-y-2.5 pt-1">
                <div className="grid grid-cols-4 gap-2">
                  {HERO_FRAMES.map((frame, idx) => {
                    const isCurrent = idx === frameIdx;
                    const isPast = idx < frameIdx;
                    return (
                      <button
                        key={frame.id}
                        type="button"
                        onClick={() => {
                          triggerDialTick(false);
                          setFrameIdx(idx);
                        }}
                        className="space-y-1.5 text-left cursor-pointer group"
                      >
                        <div className="h-1 w-full overflow-hidden rounded-full bg-[#142033]/10">
                          {isCurrent && !heroPaused ? (
                            <div
                              key={`${frame.id}-sweep`}
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
                          className={`block truncate font-mono-tech text-[10px] font-semibold ${
                            isCurrent
                              ? 'text-[#142033]'
                              : 'text-[#586579] group-hover:text-[#142033]'
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
                    className="font-mono-tech text-[10px] font-semibold text-[#586579] hover:text-[#142033] cursor-pointer"
                  >
                    {heroPaused ? 'Resume live preview' : 'Pause preview'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            02 · LIVE INTERACTIVE SANDBOX (TEST BOTH MISSIONS & THINKING SHEETS)
            ================================================================= */}
        <section id="sandbox" className="cx-hairline-t py-16 sm:py-24 space-y-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl space-y-2">
              <div className="font-mono-tech text-[10px] font-bold uppercase tracking-[0.16em] text-[#087F80]">
                Try It Right Now
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#142033]">
                Quiet helpers in the background. Curiosity in charge.
              </h2>
            </div>

            <div
              role="tablist"
              aria-label="Interactive sandbox mode"
              className="inline-flex rounded-full border border-[#142033]/12 bg-white p-1"
            >
              <button
                type="button"
                role="tab"
                aria-selected={sandboxTab === 'mission'}
                onClick={() => {
                  triggerDialTick(false);
                  setSandboxTab('mission');
                }}
                className={`rounded-full px-4 py-2 text-xs font-bold transition cursor-pointer ${
                  sandboxTab === 'mission'
                    ? 'bg-[#142033] text-white'
                    : 'text-[#586579] hover:text-[#142033]'
                }`}
              >
                Daily Mission
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={sandboxTab === 'sheet'}
                onClick={() => {
                  triggerDialTick(false);
                  setSandboxTab('sheet');
                }}
                className={`rounded-full px-4 py-2 text-xs font-bold transition cursor-pointer ${
                  sandboxTab === 'sheet'
                    ? 'bg-[#142033] text-white'
                    : 'text-[#586579] hover:text-[#142033]'
                }`}
              >
                Thinking Sheet
              </button>
            </div>
          </div>

          {sandboxTab === 'mission' ? (
            <div className="grid grid-cols-1 gap-8 rounded-[28px] border border-[#142033]/10 bg-white p-6 sm:p-10 shadow-[var(--shadow-artifact)] lg:grid-cols-[0.9fr_1.1fr] items-center">
              <div className="space-y-4">
                <span className="font-mono-tech text-[10px] font-bold uppercase tracking-[0.16em] text-[#087F80]">
                  Mission Demo · Secret Machine
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[#142033]">
                  One clue can fool you. Two clues reveal the rule.
                </h3>
                <p className="text-sm text-[#586579] leading-relaxed">
                  Feed numbers into the machine, watch what comes out, and check
                  whether your first guess still holds when you test a second
                  number.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <span className="rounded-full bg-[#F7F6F1] border border-[#142033]/10 px-3 py-1 font-mono-tech text-[11px] font-semibold text-[#142033] tabular-nums">
                    {probes.length} probe{probes.length === 1 ? '' : 's'} logged
                  </span>
                  <button
                    type="button"
                    onClick={resetMachine}
                    className="text-xs font-semibold text-[#586579] hover:text-[#142033] underline underline-offset-4 cursor-pointer"
                  >
                    Reset machine
                  </button>
                </div>
              </div>

              <div className="space-y-5 rounded-2xl border border-[#142033]/10 bg-[#F7F6F1] p-5 sm:p-6">
                {/* INPUT -> OUTPUT DISPLAY */}
                <div className="grid grid-cols-3 items-center gap-3 rounded-2xl border border-[#142033]/8 bg-white p-4 text-center">
                  <div>
                    <div className="font-mono-tech text-[10px] font-semibold uppercase text-[#586579]">
                      Input
                    </div>
                    <div className="mt-1 font-display text-3xl font-extrabold tabular-nums text-[#142033]">
                      {machineInput}
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="rounded-full bg-[#142033] px-3 py-1 font-mono-tech text-xs font-bold text-white">
                      f(x)
                    </span>
                  </div>
                  <div>
                    <div className="font-mono-tech text-[10px] font-semibold uppercase text-[#087F80]">
                      Output
                    </div>
                    <div className="mt-1 font-display text-3xl font-extrabold tabular-nums text-[#087F80]">
                      {machineInput * 3}
                    </div>
                  </div>
                </div>

                {/* NUMBER PROBES */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-[#586579]">
                    Tap another number to test:
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {[2, 3, 4, 5, 7].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => handleProbe(n)}
                        className={`rounded-xl border py-2.5 font-display text-base font-extrabold tabular-nums transition cursor-pointer ${
                          machineInput === n
                            ? 'border-[#142033] bg-[#142033] text-white'
                            : 'border-[#142033]/12 bg-white text-[#142033] hover:border-[#087F80]'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                {/* HYPOTHESIS CHECK */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-[#586579]">
                    Which rule fits all your logged checks?
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        triggerDialTick(false);
                        setRuleGuess('plus6');
                      }}
                      className={`rounded-xl border p-3 text-left text-xs font-bold transition cursor-pointer ${
                        ruleGuess === 'plus6'
                          ? 'border-[#F07868] bg-[#F07868]/10 text-[#9E3324]'
                          : 'border-[#142033]/12 bg-white text-[#142033] hover:border-[#142033]/40'
                      }`}
                    >
                      Input + 6
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        triggerSoftConfirm(true);
                        setRuleGuess('times3');
                      }}
                      className={`rounded-xl border p-3 text-left text-xs font-bold transition cursor-pointer ${
                        ruleGuess === 'times3'
                          ? 'border-[#087F80] bg-[#087F80]/10 text-[#087F80]'
                          : 'border-[#142033]/12 bg-white text-[#142033] hover:border-[#142033]/40'
                      }`}
                    >
                      Input × 3
                    </button>
                  </div>

                  {ruleGuess === 'plus6' && (
                    <p className="rounded-xl border border-[#F07868]/30 bg-white px-3.5 py-2.5 text-xs text-[#9E3324]">
                      3 + 6 = 9 works once, but test 5 above—5 + 6 would be 11,
                      not 15.
                    </p>
                  )}
                  {ruleGuess === 'times3' && (
                    <p className="rounded-xl border border-[#087F80]/30 bg-white px-3.5 py-2.5 text-xs font-semibold text-[#087F80]">
                      Fits every tested input. That’s checking evidence before
                      deciding.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 rounded-[28px] border border-[#142033]/10 bg-white p-6 sm:p-10 shadow-[var(--shadow-artifact)] lg:grid-cols-[0.9fr_1.1fr] items-center">
              <div className="space-y-4">
                <span className="font-mono-tech text-[10px] font-bold uppercase tracking-[0.16em] text-[#087F80]">
                  Thinking Sheet Demo · After Class
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[#142033]">
                  Solve each school topic on your own—in 3 clean steps.
                </h3>
                <p className="text-sm text-[#586579] leading-relaxed">
                  Automatically matched to your child’s Class (5–10) and Board
                  across Science, History, Geography, and Extra Curricular.
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  {(['CBSE', 'Maharashtra State Board'] as const).map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => {
                        triggerDialTick(false);
                        setSheetBoard(b);
                      }}
                      className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                        sheetBoard === b
                          ? 'border-[#142033] bg-[#142033] text-white'
                          : 'border-[#142033]/15 bg-[#F7F6F1] text-[#586579]'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 rounded-2xl border border-[#142033]/10 bg-[#F7F6F1] p-5 sm:p-6">
                <div className="flex items-center justify-between text-[11px] font-semibold text-[#586579]">
                  <span>Class 6 · {sheetBoard} · Science</span>
                  <span className="font-mono-tech text-[#087F80]">
                    Step 2 · Spot the Catch
                  </span>
                </div>

                <p className="text-sm font-semibold text-[#142033] leading-relaxed">
                  Two classmates placed identical saplings in opposite corners
                  of the school garden. After three weeks, one grew much taller.
                  Which explanation has a reasoning gap?
                </p>

                <div className="space-y-2">
                  {[
                    '“The taller sapling must have stronger seeds, because both were watered every morning.”',
                    '“Before blaming the seeds, we should check how many hours of direct sunlight each corner gets.”',
                  ].map((viewpoint, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        triggerDialTick(true);
                        setSheetPick(idx);
                      }}
                      className={`w-full rounded-xl border p-3.5 text-left text-xs sm:text-sm font-medium transition cursor-pointer ${
                        sheetPick === idx
                          ? 'border-[#087F80] bg-white text-[#142033]'
                          : 'border-[#142033]/10 bg-white/70 text-[#586579] hover:border-[#142033]/35'
                      }`}
                    >
                      {viewpoint}
                    </button>
                  ))}
                </div>

                {sheetPick !== null && (
                  <p className="rounded-xl border border-[#087F80]/25 bg-white px-4 py-3 text-xs text-[#142033]">
                    {sheetPick === 0
                      ? 'Good catch—it ignores sunlight and soil differences. Next step: write why in one short line of your own words.'
                      : 'That second view actually checks the missing variable! Look at the first one—it jumps straight to seeds without checking sunlight.'}
                  </p>
                )}
              </div>
            </div>
          )}
        </section>

        {/* =================================================================
            03 · HOW CUBITX WORKS — CALM HAIRLINE ROWS (NO CARD SOUP)
            ================================================================= */}
        <section id="how-it-works" className="cx-hairline-t py-16 sm:py-24 space-y-14">
          <div className="max-w-2xl space-y-2">
            <div className="font-mono-tech text-[10px] font-bold uppercase tracking-[0.16em] text-[#087F80]">
              How It Works
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#142033]">
              Built for real family rhythms, not screen addiction.
            </h2>
          </div>

          <div className="divide-y divide-[#142033]/10 border-t border-b border-[#142033]/10">
            {/* ROW 1: DATE-BASED MISSIONS */}
            <div className="grid grid-cols-1 gap-8 py-10 lg:grid-cols-[0.9fr_1.1fr] items-center">
              <div className="space-y-2.5">
                <div className="font-mono-tech text-[11px] font-bold text-[#087F80]">
                  01 · Daily Missions
                </div>
                <h3 className="font-display text-2xl font-extrabold text-[#142033]">
                  Pick today’s date, or any earlier date.
                </h3>
                <p className="text-sm text-[#586579] leading-relaxed">
                  No streak counters, no “missed Day 4” guilt. Children open
                  today’s mission, test clues freely, and build a calm habit of
                  coming back out of curiosity.
                </p>
              </div>

              <div className="grid grid-cols-4 gap-2.5">
                {[
                  { day: 'Thu', num: '19', status: 'Done', active: false },
                  { day: 'Fri', num: '20', status: 'Done', active: false },
                  { day: 'Today', num: '21', status: 'Open', active: true },
                  { day: 'Sun', num: '22', status: 'Up Next', active: false },
                ].map((d) => (
                  <div
                    key={d.num}
                    className={`rounded-2xl border p-4 ${
                      d.active
                        ? 'border-[#142033] bg-[#142033] text-white'
                        : d.status === 'Done'
                        ? 'border-[#087F80]/30 bg-[#087F80]/[0.06] text-[#142033]'
                        : 'border-[#142033]/10 bg-white text-[#586579]'
                    }`}
                  >
                    <div
                      className={`font-mono-tech text-[10px] font-semibold uppercase ${
                        d.active ? 'text-white/70' : 'text-[#586579]'
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
                          ? 'text-[#087F80]'
                          : 'text-[#586579]'
                      }`}
                    >
                      {d.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ROW 2: THINKING SHEETS */}
            <div className="grid grid-cols-1 gap-8 py-10 lg:grid-cols-[0.9fr_1.1fr] items-center">
              <div className="space-y-2.5">
                <div className="font-mono-tech text-[11px] font-bold text-[#087F80]">
                  02 · Thinking Sheets
                </div>
                <h3 className="font-display text-2xl font-extrabold text-[#142033]">
                  School chapters turned into real thinking.
                </h3>
                <p className="text-sm text-[#586579] leading-relaxed">
                  Automatically set by Class (5–10) and Board (CBSE or
                  Maharashtra State Board). Every sheet moves through three
                  steps: The Twist, Spot the Catch, and Your Reason.
                </p>
              </div>

              <div className="rounded-2xl border border-[#142033]/10 bg-white divide-y divide-[#142033]/8">
                {[
                  { subject: 'Science', meta: 'The Twist · Spot the Catch · Your Reason', tag: 'Done' },
                  { subject: 'History', meta: 'Source checks & missing viewpoints', tag: 'Open' },
                  { subject: 'Geography', meta: 'Cause, climate & trade-off prompts', tag: 'Open' },
                  { subject: 'Extra Curricular', meta: 'AI claims, money sense & daily logic', tag: 'Open' },
                ].map((row) => (
                  <div
                    key={row.subject}
                    className="flex items-center justify-between gap-4 px-5 py-3.5"
                  >
                    <div>
                      <div className="font-display text-sm font-bold text-[#142033]">
                        {row.subject}
                      </div>
                      <div className="text-xs text-[#586579]">{row.meta}</div>
                    </div>
                    <span
                      className={`rounded-full px-3 py-0.5 text-[11px] font-semibold ${
                        row.tag === 'Done'
                          ? 'bg-[#087F80]/10 text-[#087F80]'
                          : 'bg-[#F7F6F1] text-[#586579]'
                      }`}
                    >
                      {row.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ROW 3: PARENT VIEW & TRY AT HOME */}
            <div
              id="parents"
              className="grid grid-cols-1 gap-8 py-10 lg:grid-cols-[0.9fr_1.1fr] items-center"
            >
              <div className="space-y-2.5">
                <div className="font-mono-tech text-[11px] font-bold text-[#087F80]">
                  03 · Parent View &amp; Try at Home
                </div>
                <h3 className="font-display text-2xl font-extrabold text-[#142033]">
                  Honest snapshots of eight thinking skills.
                </h3>
                <p className="text-sm text-[#586579] leading-relaxed">
                  Protected by a 4-digit Parent PIN or Fingerprint. Inspect
                  step-by-step replays of real moments, see what is observed vs.
                  coming up next, and get three calm home prompts each week.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {EIGHT_SKILLS_PREVIEW.map((skill) => (
                  <div
                    key={skill.code}
                    className="flex items-center justify-between gap-2 rounded-xl border border-[#142033]/10 bg-white px-3.5 py-2.5"
                  >
                    <span className="truncate text-xs font-semibold text-[#142033]">
                      <span className="font-mono-tech text-[#586579] mr-1.5">
                        {skill.code}
                      </span>
                      {skill.name}
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        skill.status === 'Observed'
                          ? 'bg-[#087F80]/10 text-[#087F80]'
                          : skill.status === 'Early signal'
                          ? 'bg-[#F5B942]/20 text-[#8A5A00]'
                          : 'bg-[#F7F6F1] text-[#586579]'
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
            04 · AGE PATHWAYS (CLASSES 5–7 & CLASSES 8–10)
            ================================================================= */}
        <section className="py-12 sm:py-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="rounded-3xl border border-[#142033]/10 bg-white p-8 space-y-3">
              <div className="font-mono-tech text-[10px] font-bold uppercase tracking-[0.16em] text-[#087F80]">
                Classes 5–7 · Foundation
              </div>
              <h3 className="font-display text-2xl font-extrabold text-[#142033]">
                Concrete clues &amp; pattern testing
              </h3>
              <p className="text-sm text-[#586579] leading-relaxed">
                Visual mysteries where younger learners practise testing more
                than one clue, noticing missing details, and explaining “why” in
                plain words.
              </p>
            </div>

            <div className="rounded-3xl border border-[#142033]/10 bg-white p-8 space-y-3">
              <div className="font-mono-tech text-[10px] font-bold uppercase tracking-[0.16em] text-[#087F80]">
                Classes 8–10 · Advanced
              </div>
              <h3 className="font-display text-2xl font-extrabold text-[#142033]">
                Ambiguity, trade-offs &amp; AI checks
              </h3>
              <p className="text-sm text-[#586579] leading-relaxed">
                Real-world dilemmas, auditing confident AI claims, spotting weak
                comparisons, and weighing competing constraints without a single
                formula.
              </p>
            </div>
          </div>
        </section>

        {/* =================================================================
            05 · SIMPLE FAMILY ACCESS (TRANSPARENT PRICING)
            ================================================================= */}
        <section id="access" className="cx-hairline-t py-16 sm:py-24">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1fr] items-start">
            <div className="space-y-3">
              <div className="font-mono-tech text-[10px] font-bold uppercase tracking-[0.16em] text-[#087F80]">
                Transparent Family Access
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#142033]">
                Start free for {TRIAL_DAYS} days. Stay only if you see the shift.
              </h2>
              <p className="text-sm text-[#586579] max-w-md leading-relaxed">
                One simple family plan covers up to three children with separate
                profiles, boards, and parent snapshots.
              </p>
            </div>

            <div className="rounded-3xl border border-[#142033]/12 bg-white p-7 sm:p-9 shadow-[var(--shadow-artifact)] space-y-6">
              <div className="flex items-baseline justify-between gap-4 border-b border-[#142033]/10 pb-5">
                <div>
                  <div className="font-display text-lg font-extrabold text-[#142033]">
                    Full Year Family Access
                  </div>
                  <div className="text-xs text-[#586579]">
                    After your {TRIAL_DAYS}-day free trial
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-display text-3xl sm:text-4xl font-extrabold tabular-nums text-[#142033]">
                    ₹{PRICE_INR}
                  </span>
                  <span className="text-xs font-semibold text-[#586579]">
                    /year
                  </span>
                </div>
              </div>

              <ul className="space-y-2.5 text-sm text-[#142033]">
                <li className="flex items-center gap-2.5">
                  <span className="text-[#087F80] font-bold">✓</span>
                  <span>Up to 3 child profiles (Classes 5–10)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-[#087F80] font-bold">✓</span>
                  <span>Daily Missions + CBSE &amp; Maharashtra Board Thinking Sheets</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-[#087F80] font-bold">✓</span>
                  <span>PIN-locked Parent View &amp; weekly Try at Home prompts</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-[#087F80] font-bold">✓</span>
                  <span>Manual renewal only — zero auto-debit surprises</span>
                </li>
              </ul>

              <button
                type="button"
                onClick={handleStart}
                className="cx-action-pill w-full bg-[#142033] py-3.5 text-sm text-white hover:bg-[#087F80] cursor-pointer"
              >
                Create Free Family Account →
              </button>
            </div>
          </div>
        </section>

        {/* =================================================================
            06 · CALM FAQ ACCORDION
            ================================================================= */}
        <section id="faq" className="cx-hairline-t py-16 sm:py-24">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.75fr_1.25fr]">
            <div className="space-y-2">
              <div className="font-mono-tech text-[10px] font-bold uppercase tracking-[0.16em] text-[#087F80]">
                Questions
              </div>
              <h2 className="font-display text-3xl font-extrabold text-[#142033]">
                Honest answers for parents.
              </h2>
            </div>

            <div className="divide-y divide-[#142033]/10 border-t border-b border-[#142033]/10">
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
                      <span className="font-mono-tech text-lg font-medium text-[#586579]">
                        {isOpen ? '−' : '+'}
                      </span>
                    </button>
                    {isOpen && (
                      <p className="pb-5 pr-8 text-sm text-[#586579] leading-relaxed">
                        {item.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =================================================================
            07 · CLOSING CTA
            ================================================================= */}
        <section className="cx-hairline-t py-16 sm:py-24 text-center space-y-6">
          <h2 className="mx-auto max-w-2xl font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-[#142033] leading-[1.08]">
            Develop the mind behind the marks.
          </h2>
          <p className="mx-auto max-w-lg text-sm sm:text-base text-[#586579]">
            Set up your child’s profile in under a minute and explore today’s
            mission together.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleStart}
              className="cx-action-pill bg-[#142033] px-8 py-4 text-sm text-white hover:bg-[#087F80] cursor-pointer"
            >
              Start {TRIAL_DAYS}-day free trial →
            </button>
          </div>
        </section>
      </main>

      {/* MINIMAL EDITORIAL FOOTER */}
      <footer className="border-t border-[#142033]/10 bg-[#EFECE3]/60 py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 sm:px-6 text-xs text-[#586579]">
          <div className="font-display font-bold text-[#142033]">
            CubitX · Thinking Missions &amp; Syllabus Thinking Sheets
          </div>
          <div>© 2026 CubitX · hello@cubitx.in</div>
        </div>
      </footer>
    </div>
  );
}