import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useApp } from '../../../core/store';
import { curriculumTierFrom } from '../../../missions/tiers';
import { loadDayConfig } from '../../../missions/curriculum';
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
import MissionLiveScene from './MissionLiveScene';

export default function BaselineDiscoveryMission() {
  const navigate = useNavigate();
  const params = useParams<{ day?: string; idx?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const user = useApp((s) => s.user);
  const responses = useApp((s) => s.responses);
  const saveResponse = useApp((s) => s.saveResponse);
  const completeItem = useApp((s) => s.completeItem);

  const curriculumTier = curriculumTierFrom(user?.tier ?? 'foundation');

  const resolvedDay = useMemo(() => {
    const fromRoute = Number(params.day);
    if (Number.isInteger(fromRoute) && fromRoute >= 1) return fromRoute;
    const fromQuery = Number(searchParams.get('d'));
    if (Number.isInteger(fromQuery) && fromQuery >= 1) return fromQuery;
    return 1;
  }, [params.day, searchParams]);

  const dayConfig = useMemo(
    () => loadDayConfig(curriculumTier, resolvedDay) ?? day01Tier1,
    [curriculumTier, resolvedDay]
  );

  const missions = dayConfig.items;

  const isPaid =
    isDevMode() ||
    (typeof window !== 'undefined' &&
      localStorage.getItem('cubitx-plan') === 'paid');

  const initialIdx = useMemo(() => {
    const raw = params.idx ?? searchParams.get('m');
    if (raw !== null && raw !== undefined) {
      const parsed = Number(raw);
      if (Number.isInteger(parsed) && parsed >= 0 && parsed < missions.length) {
        return parsed;
      }
    }
    for (let i = 0; i < missions.length; i++) {
      const key = `t${curriculumTier}:d${resolvedDay}:i${i}`;
      if (!responses[key]) return i;
    }
    return 0;
  }, [params.idx, searchParams, missions.length, curriculumTier, resolvedDay, responses]);

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

  const current = missions[missionIdx] ?? missions[0];
  const isLockedByPlan = !isPaid && missionIdx >= FREE_MISSIONS_PER_DAY;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    startedAtRef.current = Date.now();
    firstTapMsRef.current = undefined;
    setSocraticQuestion('');
    setHintLevel(0);

    const itemKey = `t${curriculumTier}:d${resolvedDay}:i${missionIdx}`;
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
  }, [missionIdx, curriculumTier, resolvedDay, current]);

  const switchMission = (nextIdx: number) => {
    setMissionIdx(nextIdx);
    const nextParams: Record<string, string> = { m: String(nextIdx) };
    if (resolvedDay > 1) nextParams.d = String(resolvedDay);
    setSearchParams(nextParams, { replace: true });
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

    const itemKey = `t${curriculumTier}:d${resolvedDay}:i${missionIdx}`;

    await saveResponse(itemKey, {
      engine: `day${resolvedDay}-mission-${missionIdx + 1}`,
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
          <h1 className="font-sans text-2xl sm:text-3xl font-extrabold text-[#142033]">
            Day {resolvedDay} done!
          </h1>
          <p className="text-sm text-[#586579]">
            All {missions.length} answers are saved.
          </p>
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="cx-action-pill w-full bg-[#142033] py-4 text-xs font-extrabold uppercase tracking-wider text-white hover:bg-[#24344D] cursor-pointer"
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
            className="rounded-full border border-[#142033]/15 bg-white px-3.5 py-1.5 text-xs font-bold text-[#142033] hover:border-[#142033] cursor-pointer"
          >
            ← Back
          </button>

          <div className="flex items-center gap-1.5">
            {missions.map((m, idx) => {
              const done = Boolean(
                responses[`t${curriculumTier}:d${resolvedDay}:i${idx}`]
              );
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => switchMission(idx)}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${
                    idx === missionIdx
                      ? 'w-8 bg-[#142033]'
                      : done
                      ? 'w-4 bg-[#142033]/55'
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
            className="rounded-full border border-[#142033]/20 bg-white px-3.5 py-1.5 text-xs font-extrabold text-[#142033] hover:bg-[#142033] hover:text-white transition cursor-pointer"
          >
            {hintLevel === 0 ? '? Help' : `Help ${hintLevel}/3`}
          </button>
        </div>
      </header>

      {/* SINGLE-FRAME CONSOLE */}
      <main className="mx-auto max-w-3xl px-4 py-5 pb-16">
        {isLockedByPlan ? (
          <div className="rounded-[28px] bg-white border border-[#142033]/12 p-8 text-center shadow-[var(--shadow-artifact)] space-y-4">
            <h2 className="font-sans text-2xl font-extrabold text-[#142033]">
              Open all 5 daily missions for the full year
            </h2>
            <p className="text-sm text-[#586579] max-w-md mx-auto">
              You finished today’s 2 free missions. Open all 5 daily missions
              and full chapter questions for ₹{PRICE_INR}/year (one-time payment).
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() =>
                  window.open(PAYMENT_LINK, '_blank', 'noopener,noreferrer')
                }
                className="cx-action-pill bg-[#142033] px-6 py-3.5 text-xs font-extrabold text-white hover:bg-[#24344D] cursor-pointer"
              >
                Open Full Year · ₹{PRICE_INR}/yr →
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
            {/* 1. LIVE INTERACTIVE ANIMATED SCENE */}
            <MissionLiveScene key={current.id} missionId={current.id} />

            {/* 2. STORY STATEMENT — CLEAN SANS SPACING */}
            <div className="rounded-2xl border border-[#142033]/12 bg-[#F7F6F1] px-5 py-4">
              <p className="font-sans text-base sm:text-[18px] font-bold tracking-normal leading-[1.6] text-[#142033]">
                {current.hookPrompt}
              </p>
            </div>

            {/* 3. UNIFORM DETAIL CARDS — BIGGER TITLE ABOVE SMALLER EXPLANATION */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {current.clues.map((clue) => (
                <div
                  key={clue.id}
                  className="rounded-2xl border border-[#142033]/12 bg-[#F7F6F1] p-4 text-left space-y-1.5"
                >
                  <div className="font-sans text-sm sm:text-base font-extrabold tracking-normal text-[#142033] leading-snug">
                    {clue.label}
                  </div>
                  <p className="font-sans text-xs sm:text-sm font-medium tracking-normal text-[#586579] leading-relaxed">
                    {clue.detail}
                  </p>
                </div>
              ))}
            </div>

            {/* 4. QUESTION & OPTIONS — UNIFORM BASE COLOR, SOLID INK HIGHLIGHT WHEN SELECTED, NO TICKS */}
            <div className="space-y-2.5">
              <h2 className="font-sans text-base sm:text-lg font-extrabold tracking-normal text-[#142033] leading-snug">
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
                        className={`w-full rounded-2xl border px-4 py-3.5 text-left font-sans text-sm font-bold tracking-normal leading-snug transition cursor-pointer ${
                          isSelected
                            ? 'border-[#142033] bg-[#142033] text-white'
                            : 'border-[#142033]/14 bg-white text-[#142033] hover:border-[#142033]/45'
                        }`}
                      >
                        {opt.label}
                      </button>

                      {/* QUICK INLINE FOLLOW-UP DIRECTLY BELOW SELECTED OPTION */}
                      {inlineCounter && (
                        <div className="ml-3 border-l-4 border-[#142033]/40 bg-[#F7F6F1] px-4 py-3 rounded-r-xl">
                          <p className="font-sans text-xs sm:text-sm font-semibold tracking-normal text-[#142033] leading-relaxed">
                            {inlineCounter}
                          </p>
                        </div>
                      )}

                      {showNewDetailRightHere && current.challengeCard && (
                        <div className="ml-3 border-l-4 border-[#142033]/40 bg-[#F7F6F1] px-4 py-3 rounded-r-xl">
                          <p className="font-sans text-xs sm:text-sm font-semibold tracking-normal text-[#142033] leading-relaxed">
                            {current.challengeCard.prompt}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5. PROGRESSIVE HINT */}
            {hintLevel > 0 && (
              <div className="rounded-xl bg-[#F7F6F1] border border-[#142033]/15 p-3.5 font-sans text-xs sm:text-sm font-semibold tracking-normal text-[#142033] leading-relaxed">
                {current.hints[hintLevel - 1]}
              </div>
            )}

            {/* 6. 1-LINE OWN-WORDS BOX + SAVE BUTTON */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <input
                type="text"
                maxLength={200}
                value={noteText}
                onChange={(e) => handleNoteChange(e.target.value)}
                placeholder="Why? Write 1 short line in your own words..."
                className="flex-1 rounded-xl border border-[#142033]/15 bg-[#F7F6F1] px-4 py-3 font-sans text-xs sm:text-sm tracking-normal text-[#142033] outline-none focus:border-[#142033]"
              />
              <button
                type="button"
                disabled={!firstPickId}
                onClick={() => void handleSaveAndNext()}
                className="cx-action-pill bg-[#142033] px-6 py-3.5 text-xs font-extrabold uppercase tracking-wider text-white hover:bg-[#24344D] disabled:opacity-40 cursor-pointer shrink-0"
              >
                {missionIdx + 1 < missions.length
                  ? 'Save & Next →'
                  : `Finish Day ${resolvedDay} →`}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}