import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../core/store';
import { curriculumTierFrom } from '../tiers';
import {
  triggerDialTick,
  triggerSoftConfirm,
} from '../../core/lib/tactileFeedback';

interface ActRecord {
  actNumber: 1 | 2 | 3;
  title: string;
  habitTag: string;
  choiceSummary: string;
  note: string;
}

const AI_OPTIONS = [
  {
    id: 'small-sample',
    tag: 'SMALL SAMPLE',
    label: '8 kids at one lunch table is tiny.',
  },
  {
    id: 'missing-group',
    tag: 'NO CONTROL GROUP',
    label: 'Who skipped juice? There is no comparison group.',
  },
  {
    id: 'trust-bot',
    tag: 'FACE VALUE',
    label: '99% confident sounds convincing.',
  },
] as const;

const SHADOW_FACTORS = [
  { id: 'sun-angle', label: 'Sun angle in sky' },
  { id: 'time-of-day', label: 'Time of day' },
  { id: 'pole-fixed', label: 'Pole stayed still' },
  { id: 'cloud-cover', label: 'Cloud cover' },
] as const;

const BRIDGE_PIECES = [
  { id: 'truss', label: 'Triangle Truss', strength: 4, cost: 2 },
  { id: 'timber', label: 'Timber Deck', strength: 3, cost: 2 },
  { id: 'cable', label: 'Steel Stay', strength: 3, cost: 2 },
  { id: 'card', label: 'Flat Card', strength: 1, cost: 2 },
] as const;

export default function BaselineDiscoveryMission() {
  const navigate = useNavigate();
  const user = useApp((s) => s.user);
  const saveResponse = useApp((s) => s.saveResponse);
  const completeItem = useApp((s) => s.completeItem);

  const curriculumTier = curriculumTierFrom(user?.tier ?? 'foundation');
  const startedAtRef = useRef<number>(Date.now());

  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0);

  const [aiPick, setAiPick] = useState<string>('');
  const [aiTwistShown, setAiTwistShown] = useState(false);
  const [aiRevisedPick, setAiRevisedPick] = useState<string>('');
  const [aiNote, setAiNote] = useState('');

  const [sunHour, setSunHour] = useState<number>(8);
  const [checkedFactors, setCheckedFactors] = useState<string[]>([]);
  const [shadowChoice, setShadowChoice] = useState<string>('');

  const [pickedPieces, setPickedPieces] = useState<string[]>([]);
  const [bridgeTested, setBridgeTested] = useState(false);
  const [bridgeNote, setBridgeNote] = useState('');

  const [records, setRecords] = useState<ActRecord[]>([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const budget = 6;
  const targetStrength = 9;
  const activePieces = BRIDGE_PIECES.filter((p) => pickedPieces.includes(p.id));
  const usedCost = activePieces.reduce((sum, p) => sum + p.cost, 0);
  const builtStrength = activePieces.reduce((sum, p) => sum + p.strength, 0);

  const normalized = (sunHour - 8) / 8;
  const sunX = 60 + normalized * 280;
  const sunY = 125 - Math.sin(normalized * Math.PI) * 85;
  const shadowScale = 1.65 - Math.sin(normalized * Math.PI) * 1.1;
  const shadowDir = normalized < 0.5 ? -1 : 1;
  const shadowLength = Math.max(24, shadowScale * 75) * shadowDir;

  const handleAiSelect = (id: string) => {
    triggerDialTick(true);
    if (!aiPick) {
      setAiPick(id);
      setAiTwistShown(true);
    } else {
      setAiRevisedPick(id);
    }
  };

  const finishActOne = async () => {
    triggerSoftConfirm(true);
    const finalId = aiRevisedPick || aiPick;
    const opt = AI_OPTIONS.find((o) => o.id === finalId);
    const revised = Boolean(aiRevisedPick && aiRevisedPick !== aiPick);

    await saveResponse(`t${curriculumTier}:d1:i0`, {
      engine: 'baseline-act1-ai-audit',
      text: aiNote.trim() || opt?.label,
      picked: AI_OPTIONS.findIndex((o) => o.id === finalId),
      behaviours: {
        testsBeforeGuess: aiTwistShown ? 2 : 1,
        wentBackToTest: revised,
        changedAnswerCount: revised ? 1 : 0,
        secondsOnItem: Math.round((Date.now() - startedAtRef.current) / 1000),
      },
    });
    await completeItem(`t${curriculumTier}:d1:i0`, 1);

    setRecords((prev) => [
      ...prev.filter((r) => r.actNumber !== 1),
      {
        actNumber: 1,
        title: 'StudyBot Claim',
        habitTag: 'Checking Claims',
        choiceSummary: opt?.label ?? 'Choice saved',
        note: aiNote.trim(),
      },
    ]);
    setStep(2);
  };

  const finishActTwo = async () => {
    triggerSoftConfirm(true);
    await saveResponse(`t${curriculumTier}:d1:i1`, {
      engine: 'baseline-act2-missing-info',
      text: shadowChoice || undefined,
      picked: checkedFactors.length,
      behaviours: {
        testsBeforeGuess: checkedFactors.length,
        wentBackToTest: checkedFactors.length >= 2,
      },
    });
    await completeItem(`t${curriculumTier}:d1:i1`, 1);

    setRecords((prev) => [
      ...prev.filter((r) => r.actNumber !== 2),
      {
        actNumber: 2,
        title: 'Sun & Shadow',
        habitTag: 'Checking Clues',
        choiceSummary: shadowChoice || `${checkedFactors.length} clues checked`,
        note: '',
      },
    ]);
    setStep(3);
  };

  const finishActThree = async () => {
    triggerSoftConfirm(true);
    await saveResponse(`t${curriculumTier}:d1:i2`, {
      engine: 'baseline-act3-tradeoffs',
      text:
        bridgeNote.trim() ||
        `${activePieces.map((p) => p.label).join(' + ')} (${builtStrength} strength, ${usedCost}/${budget} cost)`,
      picked: builtStrength,
      behaviours: {
        testsBeforeGuess: activePieces.length,
      },
    });
    await completeItem(`t${curriculumTier}:d1:i2`, 1);

    setRecords((prev) => [
      ...prev.filter((r) => r.actNumber !== 3),
      {
        actNumber: 3,
        title: 'Canyon Bridge',
        habitTag: 'Trade-Offs',
        choiceSummary: `${activePieces.map((p) => p.label).join(' + ')} · ${builtStrength} str · ${usedCost}/${budget} cost`,
        note: bridgeNote.trim(),
      },
    ]);
    setStep(4);
  };

  const formatHour = (h: number) => {
    if (h === 12) return '12:00 PM';
    return h < 12 ? `${h}:00 AM` : `${h - 12}:00 PM`;
  };

  return (
    <div className="min-h-screen cx-paper-canvas text-[#142033]">
      <header className="sticky top-0 z-30 border-b border-[#142033]/10 bg-[#F7F6F1]/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-2 px-4 py-3.5 sm:px-6">
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="rounded-full border border-[#142033]/15 bg-white px-4 py-1.5 text-xs font-bold text-[#142033] hover:border-[#087F80] cursor-pointer"
          >
            ← Back to Missions
          </button>

          <span className="font-mono-tech text-[11px] font-bold uppercase tracking-[0.18em] text-[#087F80]">
            {step === 0
              ? 'DISCOVERY LAB'
              : step === 4
              ? 'COMPLETED'
              : `STEP 0${step} OF 03`}
          </span>

          <button
            type="button"
            onClick={() => navigate('/home')}
            className="rounded-full border border-[#142033]/15 bg-white px-4 py-1.5 text-xs font-bold text-[#586579] hover:text-[#142033] cursor-pointer"
          >
            Home
          </button>
        </div>

        <div className="h-[3px] w-full bg-[#142033]/10">
          <div
            className="h-full bg-[#087F80] transition-all duration-500"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-8 px-4 py-8 pb-28 sm:px-6">
        {step === 0 && (
          <section className="rounded-[32px] bg-[#142033] cx-instrument-grid p-8 sm:p-11 text-white shadow-[var(--shadow-instrument)] space-y-6">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-[#55E2CE]/15 border border-[#55E2CE]/30 px-3.5 py-1 font-mono-tech text-[10px] font-bold uppercase tracking-widest text-[#55E2CE]">
                3 INTERACTIVE CHALLENGES
              </span>
              <span className="rounded-full border border-white/15 px-3.5 py-1 font-mono-tech text-[10px] font-bold uppercase tracking-widest text-white/75">
                NO TIMER · NO MARKS
              </span>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl font-extrabold leading-[1.06]">
              Test how you spot catches, clues, and trade-offs.
            </h1>

            <p className="max-w-xl text-sm sm:text-base text-white/75 leading-relaxed">
              Try the interactive tools, spot what changes, and share what makes
              sense in your own words.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {[
                { n: '01', name: 'Claim Check', tag: 'CLUES & CATCHES' },
                { n: '02', name: 'Sun & Shadow', tag: 'MISSING DETAILS' },
                { n: '03', name: 'Bridge Builder', tag: 'TRADE-OFFS' },
              ].map((m) => (
                <div
                  key={m.n}
                  className="rounded-2xl border border-white/12 bg-white/5 p-4"
                >
                  <div className="font-mono-tech text-[10px] font-bold text-[#55E2CE]">
                    {m.n} · {m.tag}
                  </div>
                  <div className="mt-1 font-display text-lg font-extrabold text-white">
                    {m.name}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  triggerDialTick(true);
                  setStep(1);
                }}
                className="cx-action-pill bg-[#55E2CE] px-8 py-4 text-xs font-extrabold uppercase tracking-wider text-[#142033] hover:bg-white cursor-pointer"
              >
                Start →
              </button>
            </div>
          </section>
        )}

        {step === 1 && (
          <section className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="font-mono-tech text-[11px] font-bold uppercase tracking-widest text-[#087F80]">
                  01 / CLAIM CHECK
                </div>
                <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#142033] mt-1">
                  Spot the catch in this claim.
                </h1>
              </div>
              <span className="rounded-full bg-[#142033] px-3.5 py-1 font-mono-tech text-[10px] font-bold text-[#F5B942]">
                99% CONFIDENT CLAIM
              </span>
            </div>

            <div className="rounded-[28px] bg-[#142033] cx-instrument-grid p-6 sm:p-8 text-white shadow-[var(--shadow-instrument)] space-y-2">
              <div className="font-mono-tech text-[10px] font-bold uppercase tracking-[0.2em] text-[#55E2CE]">
                POSTED CLAIM
              </div>
              <p className="font-display text-lg sm:text-xl font-bold leading-relaxed text-[#F7F6F1]">
                “Orange juice boosts test memory by 40%! At one lunch table, 7
                of 8 kids who drank it beat yesterday’s score.”
              </p>
            </div>

            <div className="grid gap-3">
              {AI_OPTIONS.map((opt) => {
                const active = (aiRevisedPick || aiPick) === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleAiSelect(opt.id)}
                    className={`flex items-center justify-between rounded-2xl border p-5 text-left transition cursor-pointer ${
                      active
                        ? 'border-[#087F80] bg-[#087F80]/10 text-[#142033]'
                        : 'border-[#142033]/12 bg-white hover:border-[#142033]'
                    }`}
                  >
                    <span className="font-display text-base font-extrabold">
                      {opt.label}
                    </span>
                    <span className="ml-3 shrink-0 rounded-full border border-[#142033]/15 bg-[#F7F6F1] px-3 py-1 font-mono-tech text-[10px] font-bold text-[#087F80]">
                      {opt.tag}
                    </span>
                  </button>
                );
              })}
            </div>

            {aiTwistShown && (
              <div className="border-l-4 border-[#F5B942] bg-white p-5 rounded-r-2xl space-y-1">
                <div className="font-mono-tech text-[10px] font-bold uppercase tracking-widest text-[#8A5A00]">
                  EXTRA DETAIL
                </div>
                <p className="text-sm font-semibold text-[#142033]">
                  Yesterday was a surprise quiz. Today’s test had 1 week’s
                  notice. Tap above if you want to switch your choice.
                </p>
              </div>
            )}

            <input
              type="text"
              maxLength={240}
              value={aiNote}
              onChange={(e) => setAiNote(e.target.value)}
              placeholder="Optional: write one line in your own words..."
              className="w-full rounded-2xl border border-[#142033]/15 bg-white px-5 py-4 text-sm text-[#142033] outline-none focus:border-[#087F80]"
            />

            <button
              type="button"
              disabled={!aiPick}
              onClick={() => void finishActOne()}
              className="cx-action-pill w-full bg-[#142033] py-4 text-xs font-extrabold uppercase tracking-wider text-white hover:bg-[#087F80] disabled:opacity-40 cursor-pointer"
            >
              Next →
            </button>
          </section>
        )}

        {step === 2 && (
          <section className="space-y-6">
            <div>
              <div className="font-mono-tech text-[11px] font-bold uppercase tracking-widest text-[#087F80]">
                02 / SUN &amp; SHADOW
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#142033] mt-1">
                Move the sun. Watch how the shadow shifts.
              </h1>
            </div>

            <div className="rounded-[28px] border border-[#142033]/12 bg-white p-5 sm:p-7 shadow-[var(--shadow-artifact)] space-y-4">
              <svg
                viewBox="0 0 400 185"
                className="w-full h-auto"
                role="img"
                aria-label="Interactive sun and pole shadow"
              >
                <path
                  d="M 60 125 Q 200 15 340 125"
                  fill="none"
                  stroke="#DCE2E7"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                <line
                  x1="20"
                  y1="145"
                  x2="380"
                  y2="145"
                  stroke="#142033"
                  strokeWidth="2.5"
                />
                <line
                  x1="200"
                  y1="145"
                  x2={200 + shadowLength}
                  y2="145"
                  stroke="#087F80"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                <line
                  x1="200"
                  y1="145"
                  x2="200"
                  y2="92"
                  stroke="#142033"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <circle cx={sunX} cy={sunY} r="14" fill="#F5B942" />
              </svg>

              <div className="flex items-center justify-between gap-4 border-t border-[#142033]/10 pt-4">
                <span className="font-mono-tech text-xs font-bold text-[#142033]">
                  {formatHour(sunHour)}
                </span>
                <input
                  type="range"
                  min={8}
                  max={16}
                  step={1}
                  aria-label="Time of day slider"
                  value={sunHour}
                  onChange={(e) => {
                    triggerDialTick(true);
                    setSunHour(Number(e.target.value));
                  }}
                  className="flex-1 accent-[#087F80] cursor-pointer"
                />
                <span className="font-mono-tech text-[11px] text-[#586579]">
                  08:00 — 16:00
                </span>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="font-mono-tech text-[10px] font-bold uppercase tracking-widest text-[#586579]">
                CLUES TO CHECK
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {SHADOW_FACTORS.map((f) => {
                  const active = checkedFactors.includes(f.id);
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        triggerDialTick(true);
                        setCheckedFactors((prev) =>
                          prev.includes(f.id)
                            ? prev.filter((x) => x !== f.id)
                            : [...prev, f.id]
                        );
                      }}
                      className={`rounded-2xl border px-4 py-3.5 text-left text-xs font-extrabold transition cursor-pointer ${
                        active
                          ? 'border-[#087F80] bg-[#087F80]/10 text-[#142033]'
                          : 'border-[#142033]/12 bg-white hover:border-[#142033]'
                      }`}
                    >
                      {active ? '✓ ' : '+ '}
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-2.5">
              {[
                'Sun angle shifts across the sky',
                'The pole shrank at noon',
              ].map((choice) => (
                <button
                  key={choice}
                  type="button"
                  onClick={() => {
                    triggerDialTick(true);
                    setShadowChoice(choice);
                  }}
                  className={`rounded-2xl border p-4 text-left text-xs font-extrabold transition cursor-pointer ${
                    shadowChoice === choice
                      ? 'border-[#087F80] bg-[#087F80]/10 text-[#142033]'
                      : 'border-[#142033]/12 bg-white hover:border-[#142033]'
                  }`}
                >
                  {choice}
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={checkedFactors.length === 0 && !shadowChoice}
              onClick={() => void finishActTwo()}
              className="cx-action-pill w-full bg-[#142033] py-4 text-xs font-extrabold uppercase tracking-wider text-white hover:bg-[#087F80] disabled:opacity-40 cursor-pointer"
            >
              Next →
            </button>
          </section>
        )}

        {step === 3 && (
          <section className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="font-mono-tech text-[11px] font-bold uppercase tracking-widest text-[#087F80]">
                  03 / BRIDGE BUILDER
                </div>
                <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#142033] mt-1">
                  Reach 9 strength inside a 6 budget.
                </h1>
              </div>
              <div className="flex gap-2 font-mono-tech text-xs font-bold">
                <span
                  className={`rounded-full px-3.5 py-1 ${
                    usedCost > budget
                      ? 'bg-[#F07868]/20 text-[#9E3324]'
                      : 'bg-white border border-[#142033]/15 text-[#142033]'
                  }`}
                >
                  COST {usedCost}/{budget}
                </span>
                <span className="rounded-full bg-[#087F80]/10 border border-[#087F80]/25 px-3.5 py-1 text-[#087F80]">
                  STRENGTH {builtStrength}/{targetStrength}
                </span>
              </div>
            </div>

            <div className="rounded-[28px] border border-[#142033]/12 bg-white p-5 sm:p-7 shadow-[var(--shadow-artifact)]">
              <svg
                viewBox="0 0 400 130"
                className="w-full h-auto"
                role="img"
                aria-label="Bridge strength preview"
              >
                <rect x="0" y="75" width="110" height="55" fill="#142033" />
                <rect x="290" y="75" width="110" height="55" fill="#142033" />
                <line
                  x1="110"
                  y1="78"
                  x2="290"
                  y2="78"
                  stroke="#DCE2E7"
                  strokeWidth="6"
                />
                {activePieces.map((piece, idx) => (
                  <line
                    key={piece.id}
                    x1={115 + idx * 14}
                    y1="78"
                    x2={285 - idx * 14}
                    y2={78 - Math.min(28, piece.strength * 5)}
                    stroke={
                      builtStrength >= targetStrength ? '#087F80' : '#F5B942'
                    }
                    strokeWidth="4.5"
                    strokeLinecap="round"
                  />
                ))}
              </svg>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {BRIDGE_PIECES.map((piece) => {
                const active = pickedPieces.includes(piece.id);
                return (
                  <button
                    key={piece.id}
                    type="button"
                    onClick={() => {
                      triggerDialTick(true);
                      setBridgeTested(false);
                      setPickedPieces((prev) =>
                        prev.includes(piece.id)
                          ? prev.filter((id) => id !== piece.id)
                          : [...prev, piece.id]
                      );
                    }}
                    className={`rounded-2xl border p-4 text-left transition cursor-pointer ${
                      active
                        ? 'border-[#087F80] bg-[#087F80]/10'
                        : 'border-[#142033]/12 bg-white hover:border-[#142033]'
                    }`}
                  >
                    <p className="font-display text-sm font-extrabold text-[#142033]">
                      {active ? '✓ ' : ''}
                      {piece.label}
                    </p>
                    <p className="mt-1 font-mono-tech text-[11px] text-[#586579]">
                      +{piece.strength} STR · {piece.cost} COST
                    </p>
                  </button>
                );
              })}
            </div>

            {usedCost > budget && (
              <p className="text-xs font-bold text-[#9E3324]">
                Over budget by {usedCost - budget}. Tap a piece above to remove it.
              </p>
            )}

            <button
              type="button"
              disabled={activePieces.length === 0 || usedCost > budget}
              onClick={() => {
                triggerDialTick(true);
                setBridgeTested(true);
              }}
              className="w-full rounded-full border border-[#142033] bg-white py-3.5 text-xs font-extrabold uppercase tracking-wider text-[#142033] hover:bg-[#142033] hover:text-white disabled:opacity-40 transition cursor-pointer"
            >
              Test Load
            </button>

            {bridgeTested && (
              <div className="rounded-2xl border border-[#087F80]/25 bg-white p-5 space-y-3.5">
                <p className="text-sm font-extrabold text-[#087F80]">
                  {builtStrength >= targetStrength
                    ? `Holds ${builtStrength} strength within ${usedCost} budget.`
                    : `Reached ${builtStrength}/${targetStrength} strength — try another mix or save.`}
                </p>
                <input
                  type="text"
                  maxLength={200}
                  value={bridgeNote}
                  onChange={(e) => setBridgeNote(e.target.value)}
                  placeholder="Optional: what did you trade off and why?"
                  className="w-full rounded-xl border border-[#142033]/15 bg-[#F7F6F1] px-4 py-3 text-xs text-[#142033]"
                />
                <button
                  type="button"
                  onClick={() => void finishActThree()}
                  className="cx-action-pill w-full bg-[#142033] py-4 text-xs font-extrabold uppercase tracking-wider text-white hover:bg-[#087F80] cursor-pointer"
                >
                  Save →
                </button>
              </div>
            )}
          </section>
        )}

        {step === 4 && (
          <section className="space-y-6">
            <div>
              <span className="font-mono-tech text-[10px] font-bold uppercase tracking-widest text-[#087F80]">
                SAVED
              </span>
              <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#142033] mt-1">
                What you explored
              </h1>
            </div>

            <div className="divide-y divide-[#142033]/12 border-y border-[#142033]/12">
              {records.map((r) => (
                <div
                  key={r.actNumber}
                  className="py-4 flex flex-wrap items-center justify-between gap-2"
                >
                  <div>
                    <p className="font-display text-base font-extrabold text-[#142033]">
                      0{r.actNumber} · {r.title}
                    </p>
                    <p className="text-xs text-[#586579]">{r.choiceSummary}</p>
                  </div>
                  <span className="rounded-full border border-[#087F80]/25 bg-[#087F80]/10 px-3 py-1 font-mono-tech text-[10px] font-bold text-[#087F80]">
                    {r.habitTag}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate('/home')}
                className="cx-action-pill w-full bg-[#142033] py-4 text-xs font-extrabold uppercase tracking-wider text-white hover:bg-[#087F80] cursor-pointer"
              >
                Back to Missions →
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}