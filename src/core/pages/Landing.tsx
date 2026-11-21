import { useEffect, useState } from 'react';
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
    contextLine: 'Free 15-Minute Thinking Test · Classes 5–10',
    statusLabel: 'Free to try',
    statusTone: 'teal',
    title: 'See how your child handles clues, claims, and trade-offs',
    leftLabel: 'Duration',
    leftValue: '15 mins',
    rightLabel: 'Result',
    rightValue: 'Snapshot',
    transcript:
      'Three short interactive worlds—no marks, no timers—ending with a plain-English snapshot for parents.',
    footnote: 'Zero card required · Instant family snapshot',
  },
  {
    id: 'thinking-sheet',
    tabLabel: '02 · Sheets',
    contextLine: 'Class 6 · CBSE & Maharashtra Board · Science',
    statusLabel: 'Anti-copy',
    statusTone: 'amber',
    title: 'Chapter questions tailored per student so nobody can copy',
    leftLabel: 'Free tier',
    leftValue: `${FREE_THINKING_SHEET_LIMIT} questions`,
    rightLabel: 'Full plan',
    rightValue: `${PAID_THINKING_SHEET_MIN}+ / chapter`,
    transcript:
      '“Both plants got water, so we can’t blame soil until we check sunlight hours.”',
    footnote: 'Shuffled order, dynamic names & zero A/B/C labels',
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
    footnote: 'Step-by-step replay + Weekly Championship updates',
  },
  {
    id: 'try-at-home',
    tabLabel: '04 · Try at Home',
    contextLine: 'Open on Free Plan · The 10-Second Rule',
    statusLabel: 'Free forever',
    statusTone: 'teal',
    title: 'Everyday home questions that build reasoning at dinner',
    leftLabel: 'Weekly moments',
    leftValue: '3 prompts',
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
    q: 'What is included in the Free Plan?',
    a: `Every family gets the 15-Minute Thinking Test, ${FREE_DAILY_MISSIONS} daily missions every day, full access to Try at Home, ${FREE_THINKING_SHEET_LIMIT} thinking questions per chapter, Weekly Championship entry, and a restricted Parent View snapshot.`,
  },
  {
    q: 'What unlocks when I pay ₹49 for 7 days or ₹999/year?',
    a: `Full unlock opens all ${PAID_THINKING_SHEET_MIN}+ tailored Thinking Sheet questions per chapter (CBSE & Maharashtra State Board), the complete unblurred Parent View (verbatim child quotes, step-by-step replay, 8-area progress web), Monthly Championship Awards eligibility, and up to 3 child profiles.`,
  },
  {
    q: 'What if I join individually now and my child’s school joins CubitX later?',
    a: 'If your child’s school partners with CubitX later at a school rate, any remaining balance from your individual plan automatically carries forward for next year. Nothing is lost.',
  },
  {
    q: 'How do you stop classmates from copying Thinking Sheet answers?',
    a: 'Each student receives a tailored set—question order, character names, scenario values, and viewpoint positions are shuffled per child with zero A/B/C labels.',
  },
  {
    q: 'Can my child open Parent View by mistake?',
    a: 'No. Parent View is protected by a 4-digit Parent PIN with optional Fingerprint / Face ID unlock on supported devices.',
  },
];

export default function Landing() {
  const navigate = useNavigate();

  const [frameIdx, setFrameIdx] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);

  const [sandboxTab, setSandboxTab] = useState<'mission' | 'sheet'>('mission');
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
            className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#586579]"
          >
            <a href="#sandbox" className="hover:text-[#142033] transition">
              Try live
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
              className="px-3 py-2 text-xs font-semibold text-[#586579] hover:text-[#142033] transition cursor-pointer"
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={handleStart}
              className="cx-action-pill bg-[#142033] px-4 py-2 text-xs text-white hover:bg-[#087F80] cursor-pointer"
            >
              15-Min Test →
            </button>
          </div>
        </div>
      </header>

      <main id="top" className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* =================================================================
            01 · HERO — 15-MINUTE THINKING TEST + LIVE MOVING SCREEN
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

            <h1 className="font-display text-4xl font-extrabold leading-[1.04] tracking-tight text-[#142033] sm:text-5xl lg:text-[58px]">
              Eyes on how they think, not just the final answer.
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-[#586579] sm:text-lg">
              Start with our free <strong>15-Minute Thinking Test</strong>. Build
              real reasoning with daily missions, board-matched Thinking Sheets,
              and Weekly Championships—without marks, timers, or streak guilt.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleStart}
                className="cx-action-pill bg-[#142033] px-7 py-3.5 text-sm text-white hover:bg-[#087F80] cursor-pointer"
              >
                <span>Take Free 15-Min Thinking Test</span>
                <span aria-hidden="true">→</span>
              </button>

              <a
                href="#sandbox"
                className="rounded-full border border-[#142033]/15 bg-white px-6 py-3.5 text-sm font-semibold text-[#142033] hover:border-[#142033]/40 transition"
              >
                Try a live mission ↓
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 text-xs font-medium text-[#586579]">
              <span>Free tier ({FREE_DAILY_MISSIONS} daily missions + Try at Home)</span>
              <span>·</span>
              <span>Full unlock ₹{TRIAL_PRICE_INR} for {TRIAL_DAYS} days</span>
            </div>
          </div>

          {/* CADENCE-STYLE LIVE MOVING SCREEN */}
          <div
            onMouseEnter={() => setHeroPaused(true)}
            onMouseLeave={() => setHeroPaused(false)}
            className="cx-soft-float"
          >
            <div className="rounded-[28px] border border-[#142033]/12 bg-white p-5 sm:p-7 shadow-[var(--shadow-device)] space-y-5">
              <div className="flex items-center justify-between gap-3 border-b border-[#142033]/8 pb-4">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F7F6F1] font-display text-xs font-extrabold text-[#142033]">
                    CX
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
            02 · LIVE INTERACTIVE SANDBOX
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
                  Thinking Sheet Demo · Anti-Copy
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[#142033]">
                  Tailored per student—no copying across classmates.
                </h3>
                <p className="text-sm text-[#586579] leading-relaxed">
                  Automatically matched to Class (5–10) and Board across
                  Science, History, Geography, and Extra Curricular. Free gives{' '}
                  {FREE_THINKING_SHEET_LIMIT} questions; Paid unlocks{' '}
                  {PAID_THINKING_SHEET_MIN}+ per chapter.
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
            03 · HOW CUBITX WORKS + CHAMPIONSHIPS (HAIRLINE ROWS)
            ================================================================= */}
        <section id="how-it-works" className="cx-hairline-t py-16 sm:py-24 space-y-14">
          <div className="max-w-2xl space-y-2">
            <div className="font-mono-tech text-[10px] font-bold uppercase tracking-[0.16em] text-[#087F80]">
              How It Works
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#142033]">
              Built for real family rhythms and genuine curiosity.
            </h2>
          </div>

          <div className="divide-y divide-[#142033]/10 border-t border-b border-[#142033]/10">
            <div className="grid grid-cols-1 gap-8 py-10 lg:grid-cols-[0.9fr_1.1fr] items-center">
              <div className="space-y-2.5">
                <div className="font-mono-tech text-[11px] font-bold text-[#087F80]">
                  01 · Daily Missions &amp; Weekly Championship
                </div>
                <h3 className="font-display text-2xl font-extrabold text-[#142033]">
                  Pick today’s date, or join the Weekly Championship.
                </h3>
                <p className="text-sm text-[#586579] leading-relaxed">
                  Solve {FREE_DAILY_MISSIONS} daily missions free, enter the
                  in-app Weekly Championship for kids and schools, and earn
                  Monthly Championship Awards and certificates for sharp
                  reasoning.
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

            <div className="grid grid-cols-1 gap-8 py-10 lg:grid-cols-[0.9fr_1.1fr] items-center">
              <div className="space-y-2.5">
                <div className="font-mono-tech text-[11px] font-bold text-[#087F80]">
                  02 · Thinking Sheets (CBSE &amp; Maharashtra Board)
                </div>
                <h3 className="font-display text-2xl font-extrabold text-[#142033]">
                  School chapters turned into real thinking.
                </h3>
                <p className="text-sm text-[#586579] leading-relaxed">
                  Tailored per student across Science, History, Geography, and
                  Extra Curricular. Every question moves through The Twist, Spot
                  the Catch, and Your Reason.
                </p>
              </div>

              <div className="rounded-2xl border border-[#142033]/10 bg-white divide-y divide-[#142033]/8">
                {[
                  { subject: 'Science', meta: 'The Twist · Spot the Catch · Your Reason', tag: '4 Free / 12+ Paid' },
                  { subject: 'History', meta: 'Source checks & missing viewpoints', tag: '4 Free / 12+ Paid' },
                  { subject: 'Geography', meta: 'Cause, climate & trade-off prompts', tag: '4 Free / 12+ Paid' },
                  { subject: 'Extra Curricular', meta: 'AI claims, money sense & daily logic', tag: '4 Free / 12+ Paid' },
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
                    <span className="shrink-0 rounded-full bg-[#F7F6F1] px-3 py-0.5 font-mono-tech text-[10px] font-semibold text-[#586579]">
                      {row.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 py-10 lg:grid-cols-[0.9fr_1.1fr] items-center">
              <div className="space-y-2.5">
                <div className="font-mono-tech text-[11px] font-bold text-[#087F80]">
                  03 · Parent View &amp; Try at Home
                </div>
                <h3 className="font-display text-2xl font-extrabold text-[#142033]">
                  Honest snapshots of eight thinking skills.
                </h3>
                <p className="text-sm text-[#586579] leading-relaxed">
                  Try at Home is completely open on the Free plan. Unlock the
                  full PIN-protected Parent View for step-by-step replays,
                  verbatim child quotes, and 8-area growth maps.
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
            04 · PARTNER WITH US (FOR SCHOOLS)
            ================================================================= */}
        <section id="schools" className="py-12 sm:py-16">
          <div className="rounded-[28px] border border-[#142033]/12 bg-white p-7 sm:p-10 shadow-[var(--shadow-artifact)] grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr] items-center">
            <div className="space-y-3">
              <div className="font-mono-tech text-[10px] font-bold uppercase tracking-[0.16em] text-[#087F80]">
                Partner With Us · For Schools
              </div>
              <h2 className="font-display text-3xl font-extrabold text-[#142033]">
                Bring CubitX to your classrooms (Classes 5–10).
              </h2>
              <p className="text-sm text-[#586579] leading-relaxed">
                Partner schools receive class-wide Teacher Dashboards, guided
                School-Level Activities, Weekly Championship participation, and
                Monthly Championship Awards—with zero extra grading work for
                teachers.
              </p>
              <p className="text-xs font-medium text-[#087F80]">
                Already joined as an individual parent? If your child’s school
                partners with CubitX later, your remaining balance carries
                forward to next year automatically.
              </p>
            </div>

            <div className="rounded-2xl border border-[#142033]/10 bg-[#F7F6F1] p-6 space-y-4">
              <ul className="space-y-2 text-xs sm:text-sm font-medium text-[#142033]">
                <li className="flex items-center gap-2">
                  <span className="text-[#087F80] font-bold">✓</span>
                  <span>Class-wide Teacher Dashboard (zero student ranking)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#087F80] font-bold">✓</span>
                  <span>Ready-to-run School-Level Activity kits</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#087F80] font-bold">✓</span>
                  <span>Weekly Championship &amp; Monthly Championship Awards</span>
                </li>
              </ul>

              <div className="flex flex-wrap gap-2.5 pt-1">
                <a
                  href="mailto:hello@cubitx.in?subject=CubitX%20School%20Partnership%20Inquiry"
                  className="cx-action-pill bg-[#142033] px-5 py-3 text-xs text-white hover:bg-[#087F80]"
                >
                  Partner with us →
                </a>
                <button
                  type="button"
                  onClick={() => navigate('/teacher')}
                  className="rounded-full border border-[#142033]/15 bg-white px-5 py-3 text-xs font-bold text-[#142033] hover:border-[#142033] transition cursor-pointer"
                >
                  Teacher Sign In
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            05 · TRANSPARENT PLANS (FREE / ₹49 7-DAY / ₹999 YEAR)
            ================================================================= */}
        <section id="access" className="cx-hairline-t py-16 sm:py-24 space-y-10">
          <div className="max-w-2xl space-y-2">
            <div className="font-mono-tech text-[10px] font-bold uppercase tracking-[0.16em] text-[#087F80]">
              Transparent Family Plans
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#142033]">
              Start free. Unlock full insights for ₹{TRIAL_PRICE_INR}.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {/* FREE PLAN */}
            <div className="rounded-3xl border border-[#142033]/12 bg-white p-7 flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <div className="font-mono-tech text-[10px] font-bold uppercase tracking-widest text-[#586579]">
                  Free Forever
                </div>
                <div className="font-display text-3xl font-extrabold text-[#142033]">
                  ₹0
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-[#586579]">
                  <li>✓ Free 15-Minute Thinking Test</li>
                  <li>✓ {FREE_DAILY_MISSIONS} daily missions every day</li>
                  <li>✓ Try at Home (full access)</li>
                  <li>✓ {FREE_THINKING_SHEET_LIMIT} Thinking Sheet questions / chapter</li>
                  <li>✓ Restricted Parent View snapshot</li>
                </ul>
              </div>
              <button
                type="button"
                onClick={handleStart}
                className="w-full rounded-full border border-[#142033]/20 py-3 text-xs font-extrabold text-[#142033] hover:border-[#142033] transition cursor-pointer"
              >
                Start Free →
              </button>
            </div>

            {/* ₹49 / 7 DAYS */}
            <div className="rounded-3xl border-2 border-[#087F80] bg-white p-7 shadow-[var(--shadow-artifact)] flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono-tech text-[10px] font-bold uppercase tracking-widest text-[#087F80]">
                    Full Unlock Trial
                  </span>
                  <span className="rounded-full bg-[#087F80]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#087F80]">
                    Most popular start
                  </span>
                </div>
                <div>
                  <span className="font-display text-3xl font-extrabold tabular-nums text-[#142033]">
                    ₹{TRIAL_PRICE_INR}
                  </span>
                  <span className="text-xs font-semibold text-[#586579]">
                    {' '}
                    / {TRIAL_DAYS} days
                  </span>
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-[#142033]">
                  <li>✓ Full unblurred Parent View + Replay</li>
                  <li>✓ {PAID_THINKING_SHEET_MIN}+ tailored Thinking Sheet questions / chapter</li>
                  <li>✓ Weekly Championship + Monthly Awards</li>
                  <li>✓ Up to 3 child profiles</li>
                  <li>✓ No auto-debit after {TRIAL_DAYS} days</li>
                </ul>
              </div>
              <button
                type="button"
                onClick={handleStart}
                className="cx-action-pill w-full bg-[#142033] py-3.5 text-xs text-white hover:bg-[#087F80] cursor-pointer"
              >
                Try {TRIAL_DAYS} Days for ₹{TRIAL_PRICE_INR} →
              </button>
            </div>

            {/* ₹999 / YEAR */}
            <div className="rounded-3xl border border-[#142033]/12 bg-white p-7 flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <div className="font-mono-tech text-[10px] font-bold uppercase tracking-widest text-[#586579]">
                  Full Year Family Plan
                </div>
                <div>
                  <span className="font-display text-3xl font-extrabold tabular-nums text-[#142033]">
                    ₹{PRICE_INR}
                  </span>
                  <span className="text-xs font-semibold text-[#586579]">
                    {' '}
                    / year
                  </span>
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-[#586579]">
                  <li>✓ Everything unlocked for 12 months</li>
                  <li>✓ Up to 3 child profiles (Classes 5–10)</li>
                  <li>✓ CBSE &amp; Maharashtra State Board sheets</li>
                  <li>✓ School credit carry-forward guarantee</li>
                  <li>✓ Manual renewal only</li>
                </ul>
              </div>
              <button
                type="button"
                onClick={handleStart}
                className="w-full rounded-full border border-[#142033]/20 py-3 text-xs font-extrabold text-[#142033] hover:bg-[#142033] hover:text-white transition cursor-pointer"
              >
                Get Full Year →
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
      </main>

      <footer className="border-t border-[#142033]/10 bg-[#EFECE3]/60 py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 sm:px-6 text-xs text-[#586579]">
          <div className="font-display font-bold text-[#142033]">
            CubitX · Develop the mind behind the marks.
          </div>
          <div>© 2026 CubitX · hello@cubitx.in</div>
        </div>
      </footer>
    </div>
  );
}