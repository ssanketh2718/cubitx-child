import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../../../core/store';
import { curriculumTierFrom } from '../../../missions/tiers';
import { isDevMode } from '../../../core/auth/devMode';
import { PAYMENT_LINK, PRICE_INR } from '../../../core/config';
import {
  triggerDialTick,
  triggerSoftConfirm,
} from '../../../core/lib/tactileFeedback';
import { evaluateSocraticMove } from '../../../core/analytics/socraticEngine';
import day01Tier1, {
  FREE_MISSIONS_PER_DAY,
} from '../../../missions/tier1/day-01/config';

const FACT_CARD_STYLES = [
  {
    bg: 'bg-[#E9F7F6]',
    border: 'border-[#087F80]/30',
    tagColor: 'text-[#087F80]',
    dot: 'bg-[#087F80]',
  },
  {
    bg: 'bg-[#FFF6E0]',
    border: 'border-[#F5B942]/45',
    tagColor: 'text-[#9A6300]',
    dot: 'bg-[#F5B942]',
  },
  {
    bg: 'bg-[#EEF2FF]',
    border: 'border-[#5267E8]/30',
    tagColor: 'text-[#3B4CCA]',
    dot: 'bg-[#5267E8]',
  },
] as const;

export default function BaselineDiscoveryMission() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useApp((s) => s.user);
  const responses = useApp((s) => s.responses);
  const saveResponse = useApp((s) => s.saveResponse);
  const completeItem = useApp((s) => s.completeItem);

  const curriculumTier = curriculumTierFrom(user?.tier ?? 'foundation');
  const missions = day01Tier1.items;

  const isPaid =
    isDevMode() ||
    (typeof window !== 'undefined' &&
      localStorage.getItem('cubitx-plan') === 'paid');

  // Resolve starting mission: explicit ?m=idx query param OR first uncompleted mission
  const initialIdx = useMemo(() => {
    const param = searchParams.get('m');
    if (param !== null) {
      const parsed = Number(param);
      if (Number.isInteger(parsed) && parsed >= 0 && parsed < missions.length) {
        return parsed;
      }
    }
    for (let i = 0; i < missions.length; i++) {
      const key = `t${curriculumTier}:d1:i${i}`;
      if (!responses[key]) return i;
    }
    return 0;
  }, [searchParams, missions.length, curriculumTier, responses]);

  const [missionIdx, setMissionIdx] = useState<number>(initialIdx);
  const [finishedAll, setFinishedAll] = useState(false);

  const [firstPickId, setFirstPickId] = useState<string>('');
  const [finalPickId, setFinalPickId] = useState<string>('');
  const [noteText, setNoteText] = useState('');
  const [socraticQuestion, setSocraticQuestion] = useState('');
  const [hintLevel, setHintLevel] = useState<0 | 1 | 2 | 3>(0);

  const startedAtRef = useRef<number>(Date.now());
  const firstTapMsRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const param = searchParams.get('m');
    if (param !== null) {
      const parsed = Number(param);
      if (
        Number.isInteger(parsed) &&
        parsed >= 0 &&
        parsed < missions.length &&
        parsed !== missionIdx
      ) {
        setMissionIdx(parsed);
      }
    }
  }, [searchParams, missions.length, missionIdx]);

  const current = missions[missionIdx];
  const isLockedByPlan = !isPaid && missionIdx >= FREE_MISSIONS_PER_DAY;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    startedAtRef.current = Date.now();
    firstTapMsRef.current = undefined;
    setSocraticQuestion('');
    setHintLevel(0);

    const itemKey = `t${curriculumTier}:d1:i${missionIdx}`;
    const existing = useApp.getState().responses[itemKey];
    if (
      existing &&
      typeof existing.picked === 'number' &&
      current.options[existing.picked]
    ) {
      const savedOptId = current.options[existing.picked].id;
      setFirstPickId(savedOptId);
      setFinalPickId(savedOptId);
      setNoteText(existing.text ?? '');
    } else {
      setFirstPickId('');
      setFinalPickId('');
      setNoteText('');
    }
  }, [missionIdx, curriculumTier, current]);

  const switchMission = (nextIdx: number) => {
    setMissionIdx(nextIdx);
    setSearchParams({ m: String(nextIdx) }, { replace: true });
  };

  const recordFirstTap = () => {
    if (firstTapMsRef.current === undefined) {
      firstTapMsRef.current = Date.now() - startedAtRef.current;
    }
  };

  const optionSocraticMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const opt of current.options) {
      if (opt.socraticCounter) {
        map[opt.id] = opt.socraticCounter;
      }
    }
    return map;
  }, [current]);

  const handleOptionTap = (optId: string) => {
    recordFirstTap();
    triggerDialTick(true);

    if (!firstPickId) {
      setFirstPickId(optId);
      setFinalPickId(optId);
    } else {
      setFinalPickId(optId);
    }

    const socratic = evaluateSocraticMove({
      selectedOptionId: optId,
      optionSocraticMap,
      freeText: noteText,
    });
    setSocraticQuestion(socratic.triggered ? socratic.prompt : '');
  };

  const handleNoteChange = (val: string) => {
    recordFirstTap();
    setNoteText(val);
    const activeId = finalPickId || firstPickId;
    const socratic = evaluateSocraticMove({
      selectedOptionId: activeId,
      optionSocraticMap,
      freeText: val,
    });
    setSocraticQuestion(socratic.triggered ? socratic.prompt : '');
  };

  const handleSaveAndNext = async () => {
    triggerSoftConfirm(true);
    const chosenId = finalPickId || firstPickId;
    const firstOpt = current.options.find((o) => o.id === firstPickId);
    const finalOpt = current.options.find((o) => o.id === chosenId);
    const revised = Boolean(finalPickId && finalPickId !== firstPickId);
    const isCorrect = finalOpt?.isCorrect === true;
    const decoyCaught =
      current.challengeCard?.strength === 'decoy' ? isCorrect : undefined;

    const itemKey = `t${curriculumTier}:d1:i${missionIdx}`;

    await saveResponse(itemKey, {
      engine: `day1-mission-${missionIdx + 1}`,
      text: noteText.trim() || finalOpt?.label,
      picked: current.options.findIndex((o) => o.id === chosenId),
      question: current.question,
      sceneKeywords: current.sceneKeywords,
      causalKeywords: current.causalKeywords,
      decorativeKeywords: current.decorativeKeywords,
      mechanismKeywords: current.mechanismKeywords,
      isCorrect,
      decoyCaught,
      challengeStrength: current.challengeCard?.strength,
      revisedFromText: revised ? firstOpt?.label : undefined,
      behaviours: {
        testsBeforeGuess: current.clues.length,
        wentBackToTest: revised,
        changedAnswerCount: revised ? 1 : 0,
        hintsUsed: hintLevel,
        timeToFirstTapMs: firstTapMsRef.current,
        secondsOnItem: Math.round((Date.now() - startedAtRef.current) / 1000),
      },
    });

    await completeItem(itemKey, missions.length);

    if (missionIdx + 1 < missions.length) {
      switchMission(missionIdx + 1);
    } else {
      setFinishedAll(true);
    }
  };

  if (finishedAll) {
    return (
      <div className="min-h-screen cx-paper-canvas text-[#142033] flex items-center justify-center p-4">
        <div className="max-w-lg w-full rounded-[32px] bg-white border border-[#142033]/12 p-8 shadow-[var(--shadow-artifact)] text-center space-y-5">
          <h1 className="font-display text-3xl font-extrabold text-[#142033]">
            Great work today!
          </h1>
          <p className="text-sm text-[#586579]">
            All 5 answers are saved to your Brain Map.
          </p>
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="cx-action-pill w-full bg-[#142033] py-4 text-xs font-extrabold uppercase tracking-wider text-white hover:bg-[#087F80] cursor-pointer"
          >
            Back to Home →
          </button>
        </div>
      </div>
    );
  }

  const activePickId = finalPickId || firstPickId;

  return (
    <div className="min-h-screen cx-paper-canvas text-[#142033]">
      {/* TOP BAR */}
      <header className="sticky top-0 z-30 border-b border-[#142033]/10 bg-[#F7F6F1]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-4 py-3">
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="rounded-full border border-[#142033]/15 bg-white px-3.5 py-1.5 text-xs font-bold text-[#142033] hover:border-[#087F80] cursor-pointer"
          >
            ← Back
          </button>

          <div className="flex items-center gap-1.5">
            {missions.map((m, idx) => {
              const done = Boolean(responses[`t${curriculumTier}:d1:i${idx}`]);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => switchMission(idx)}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${
                    idx === missionIdx
                      ? 'w-8 bg-[#087F80]'
                      : done
                      ? 'w-4 bg-[#142033]'
                      : 'w-4 bg-[#142033]/15'
                  }`}
                  aria-label={`Mission ${idx + 1}`}
                />
              );
            })}
          </div>

          <button
            type="button"
            onClick={() =>
              setHintLevel((h) => (h < 3 ? ((h + 1) as 1 | 2 | 3) : 3))
            }
            className="rounded-full border border-[#087F80]/30 bg-[#087F80]/10 px-3.5 py-1.5 text-xs font-extrabold text-[#087F80] hover:bg-[#087F80] hover:text-white transition cursor-pointer"
          >
            {hintLevel === 0 ? '? Help' : `Help ${hintLevel}/3`}
          </button>
        </div>
      </header>

      {/* SINGLE-FRAME CONSOLE */}
      <main className="mx-auto max-w-3xl px-4 py-5 pb-16">
        {isLockedByPlan ? (
          <div className="rounded-[28px] bg-white border border-[#142033]/12 p-8 text-center shadow-[var(--shadow-artifact)] space-y-4">
            <h2 className="font-display text-2xl font-extrabold text-[#142033]">
              Unlock all 5 daily missions for the full year
            </h2>
            <p className="text-sm text-[#586579] max-w-md mx-auto">
              You finished today’s 2 free missions. Unlock all 5 daily missions
              and full chapter question banks (from ₹{PRICE_INR}/yr — one-time annual payment).
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() =>
                  window.open(PAYMENT_LINK, '_blank', 'noopener,noreferrer')
                }
                className="cx-action-pill bg-[#142033] px-6 py-3.5 text-xs font-extrabold text-white hover:bg-[#087F80] cursor-pointer"
              >
                Unlock Full Year · ₹{PRICE_INR}/yr →
              </button>
              <button
                type="button"
                onClick={() => navigate('/home')}
                className="rounded-full border border-[#142033]/15 bg-[#F7F6F1] px-5 py-3.5 text-xs font-bold text-[#142033] cursor-pointer"
              >
                Back to Home
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-[28px] bg-white border border-[#142033]/12 p-5 sm:p-7 shadow-[var(--shadow-artifact)] space-y-5">
            {/* 1. STORY STATEMENT */}
            <div className="rounded-2xl bg-[#142033] p-5 text-white">
              <p className="font-display text-lg sm:text-xl font-extrabold leading-snug">
                {current.hookPrompt}
              </p>
            </div>

            {/* 2. COLOR-CODED DETAIL CARDS WITH SUBJECT HEADER ONLY (NO SECTION HEADERS) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {current.clues.map((clue, idx) => {
                const style = FACT_CARD_STYLES[idx % FACT_CARD_STYLES.length];
                return (
                  <div
                    key={clue.id}
                    className={`rounded-2xl border ${style.border} ${style.bg} p-4 text-left space-y-1.5`}
                  >
                    <div
                      className={`flex items-center gap-1.5 text-xs font-extrabold ${style.tagColor}`}
                    >
                      <span className={`h-2 w-2 rounded-full shrink-0 ${style.dot}`} />
                      <span>{clue.label}</span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-[#142033] leading-snug">
                      {clue.detail}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* 3. QUESTION & OPTIONS WITH INLINE FOLLOW-UP DIRECTLY BELOW SELECTED OPTION */}
            <div className="space-y-2.5">
              <h2 className="font-display text-base sm:text-lg font-extrabold text-[#142033]">
                {current.question}
              </h2>
              <div className="grid gap-2.5">
                {current.options.map((opt) => {
                  const isSelected = activePickId === opt.id;
                  const inlineCounter =
                    isSelected && (opt.socraticCounter || socraticQuestion)
                      ? opt.socraticCounter || socraticQuestion
                      : '';
                  const showNewDetailRightHere =
                    isSelected &&
                    !inlineCounter &&
                    Boolean(current.challengeCard);

                  return (
                    <div key={opt.id} className="space-y-1.5">
                      <button
                        type="button"
                        onClick={() => handleOptionTap(opt.id)}
                        className={`w-full flex items-center justify-between rounded-2xl border px-4 py-3.5 text-left text-sm font-extrabold transition cursor-pointer ${
                          isSelected
                            ? inlineCounter
                              ? 'border-[#E07A5F] bg-[#FFF5F2] text-[#142033]'
                              : 'border-[#087F80] bg-[#E9F7F6] text-[#142033]'
                            : 'border-[#142033]/12 bg-white hover:border-[#142033]'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isSelected && (
                          <span
                            className={`text-xs font-extrabold ${
                              inlineCounter
                                ? 'text-[#C2412D]'
                                : 'text-[#087F80]'
                            }`}
                          >
                            ✓
                          </span>
                        )}
                      </button>

                      {/* QUICK INLINE EXTRA INFO DIRECTLY BELOW OPTION (NO WRAPPER LABEL) */}
                      {inlineCounter && (
                        <div className="ml-3 border-l-4 border-[#E07A5F] bg-[#FFF5F2] px-4 py-3 rounded-r-xl">
                          <p className="text-xs sm:text-sm font-bold text-[#142033]">
                            {inlineCounter}
                          </p>
                        </div>
                      )}

                      {showNewDetailRightHere && current.challengeCard && (
                        <div className="ml-3 border-l-4 border-[#F5B942] bg-[#FFF9E6] px-4 py-3 rounded-r-xl">
                          <p className="text-xs sm:text-sm font-bold text-[#142033]">
                            {current.challengeCard.prompt}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. PROGRESSIVE HINT */}
            {hintLevel > 0 && (
              <div className="rounded-xl bg-[#EEF2FF] border border-[#5267E8]/25 p-3.5 text-xs sm:text-sm font-semibold text-[#142033]">
                {current.hints[hintLevel - 1]}
              </div>
            )}

            {/* 5. 1-LINE OWN-WORDS BOX + SAVE BUTTON */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <input
                type="text"
                maxLength={200}
                value={noteText}
                onChange={(e) => handleNoteChange(e.target.value)}
                placeholder="Why? Write 1 short line in your own words..."
                className="flex-1 rounded-xl border border-[#142033]/15 bg-[#F7F6F1] px-4 py-3 text-xs sm:text-sm text-[#142033] outline-none focus:border-[#087F80]"
              />
              <button
                type="button"
                disabled={!firstPickId}
                onClick={() => void handleSaveAndNext()}
                className="cx-action-pill bg-[#142033] px-6 py-3.5 text-xs font-extrabold uppercase tracking-wider text-white hover:bg-[#087F80] disabled:opacity-40 cursor-pointer shrink-0"
              >
                {missionIdx + 1 < missions.length
                  ? 'Save & Next →'
                  : 'Finish Day 1 →'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}