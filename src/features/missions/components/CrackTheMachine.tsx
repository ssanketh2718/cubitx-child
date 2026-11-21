import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  MACHINE_LEVELS,
  runProbe,
  type MachineLevelDefinition,
  type MachineObservation,
} from '../engines/machineEngine';
import {
  createMachineTelemetry,
  type MachineTelemetryService,
} from '../../../core/telemetry/machineTelemetry';
import { useApp } from '../../../core/store';
import { curriculumTierFrom } from '../../../missions/tiers';

function generateAttemptId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `attempt_${Date.now()}`;
}

export default function CrackTheMachine() {
  const navigate = useNavigate();
  const { tier: routeTier, day: routeDay } = useParams<{
    tier?: string;
    day?: string;
  }>();

  const storeUser = useApp((s) => s.user);
  const completeItem = useApp((s) => s.completeItem);
  const saveResponse = useApp((s) => s.saveResponse);
  const isItemDoneToday = useApp((s) => s.isItemDoneToday);

  const tierNum =
    routeTier === '2' ? 2 : curriculumTierFrom(storeUser?.tier ?? 'foundation');
  const dayNum = Number(routeDay) || 1;
  const missionItemKey = `t${tierNum}:d${dayNum}:i0`;

  const telemetryRef = useRef<MachineTelemetryService | null>(null);
  const startedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [currentLevelNumber, setCurrentLevelNumber] = useState<number>(1);
  const activeLevel: MachineLevelDefinition =
    MACHINE_LEVELS[currentLevelNumber] || MACHINE_LEVELS[1];

  const [currentInput, setCurrentInput] = useState<number>(
    activeLevel.initialObservations[0].input
  );
  const [currentOutput, setCurrentOutput] = useState<number | null>(
    activeLevel.initialObservations[0].output
  );
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [trialHistory, setTrialHistory] = useState<readonly MachineObservation[]>([
    ...activeLevel.initialObservations,
  ]);
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [ruleChangeCount, setRuleChangeCount] = useState<number>(0);
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [savedToJourney, setSavedToJourney] = useState<boolean>(() =>
    isItemDoneToday(missionItemKey)
  );

  const [hintLevel, setHintLevel] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);

  const hints = [
    `Test 1 shows: ${activeLevel.initialObservations[0].input} became ${activeLevel.initialObservations[0].output}. Both formulas fit this initial test!`,
    'Test a different number like 3, 5, or 7. Calculate which rule matches the output shown in the ledger.',
    'Look at the Evidence Ledger below. Find the formula that works for every single test.',
  ];

  const handleSwitchLevel = (newLevelNum: number) => {
    if (newLevelNum === currentLevelNumber) return;
    const target = MACHINE_LEVELS[newLevelNum];
    if (!target) return;

    setCurrentLevelNumber(newLevelNum);
    setCurrentInput(target.initialObservations[0].input);
    setCurrentOutput(target.initialObservations[0].output);
    setIsProcessing(false);
    setTrialHistory([...target.initialObservations]);
    setSelectedRuleId(null);
    setRuleChangeCount(0);
    setIsSolved(false);
    setShowHint(false);
    setHintLevel(0);

    telemetryRef.current?.emit('mission_started', {
      level_id: target.levelId,
    });
  };

  useEffect(() => {
    if (!telemetryRef.current) {
      telemetryRef.current = createMachineTelemetry({
        attemptId: generateAttemptId(),
        missionVersion: activeLevel.missionVersion,
        mechanicVersion: '1.6.0',
      });
    }

    if (!startedRef.current) {
      startedRef.current = true;
      telemetryRef.current.emit('mission_started', {
        level_id: activeLevel.levelId,
      });
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [activeLevel]);

  const emit = (
    name: Parameters<MachineTelemetryService['emit']>[0],
    payload: Parameters<MachineTelemetryService['emit']>[1] = {}
  ) => {
    try {
      telemetryRef.current?.emit(name, payload);
    } catch (err) {
      console.error('[CUBITX TELEMETRY AUDIT FAULT]', err);
    }
  };

  const handleFeedToken = (token: number) => {
    if (isProcessing) return;

    setIsProcessing(true);
    setCurrentInput(token);
    setCurrentOutput(null);

    emit('input_activated', { input: token });
    emit('probe_selected', { probe: token });

    timerRef.current = setTimeout(() => {
      try {
        const result = runProbe(activeLevel, token, trialHistory);
        setCurrentOutput(result.observation.output);
        setTrialHistory((curr) => [...curr, result.observation]);

        emit('output_shown', {
          input: result.observation.input,
          output: result.observation.output,
        });
        emit('probe_result_shown', {
          input: result.observation.input,
          output: result.observation.output,
          discriminated: result.discriminated,
        });
      } catch (err) {
        console.error('[CUBITX ENGINE FAULT]', err);
      } finally {
        setIsProcessing(false);
        timerRef.current = null;
      }
    }, 400);
  };

  const handlePickCandidate = (ruleId: string) => {
    if (selectedRuleId && selectedRuleId !== ruleId) {
      setRuleChangeCount((c) => c + 1);
    }
    setSelectedRuleId(ruleId);
    emit('candidate_rule_selected', { rule_id: ruleId });
  };

  const handleConfirmDeduction = async () => {
    if (!selectedRuleId) return;

    const pickedRule = activeLevel.candidateRules.find(
      (r) => r.id === selectedRuleId
    );
    const isCorrect = selectedRuleId === activeLevel.hiddenRule.id;
    const extraTestsCount = Math.max(
      0,
      trialHistory.length - activeLevel.initialObservations.length
    );

    emit('position_updated', {
      prior_position: null,
      final_position: selectedRuleId,
    });

    setIsSolved(true);

    emit('mission_completed', {
      completion_state: isCorrect
        ? 'one_candidate_remains'
        : 'evidence_insufficient',
    });

    const probeSummary = trialHistory
      .map((t) => `${t.input}→${t.output}`)
      .join(', ');

    await saveResponse(missionItemKey, {
      engine: 'm1-secret-machine',
      text: `Chose "${pickedRule?.label ?? selectedRuleId}" (${pickedRule?.formulaDisplay ?? ''}) after ${trialHistory.length} tests [${probeSummary}]`,
      picked: activeLevel.candidateRules.findIndex((r) => r.id === selectedRuleId),
      behaviours: {
        testsBeforeGuess: extraTestsCount > 0 ? extraTestsCount : 1,
        wentBackToTest: extraTestsCount >= 1 || ruleChangeCount > 0,
        changedAnswerCount: ruleChangeCount,
        hintsUsed: hintLevel,
      },
    });

    // Day 1 has 3 items; completing Mission 1 marks t{tier}:d1:i0 done and updates counts.
    await completeItem(missionItemKey, 3);
    setSavedToJourney(true);
  };

  const handleHint = () => {
    if (!showHint && hintLevel < hints.length) {
      const nextLevel = hintLevel + 1;
      setHintLevel(nextLevel);
      emit('hint_used', { hint_level: nextLevel });
    }
    setShowHint((v) => !v);
  };

  const handleExit = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    emit('mission_exited', { screen: isSolved ? 'finish' : 'sandbox' });
    navigate('/home');
  };

  return (
    <main className="min-h-screen bg-[#F7F6F1] px-4 pt-5 pb-28 text-[#142033] font-sans">
      <div className="max-w-2xl mx-auto space-y-5">
        {/* TOP HUD */}
        <header className="flex items-center justify-between bg-white border border-[#DCE2E7] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleExit}
              className="w-9 h-9 rounded-xl bg-[#F7F6F1] hover:bg-[#E6F4F4] border border-[#DCE2E7] flex items-center justify-center text-[#142033] font-bold transition cursor-pointer"
              title="Return to Missions"
            >
              ←
            </button>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#087F80]">
                  Discovery Terminal · Sector {currentLevelNumber}
                </p>
                {savedToJourney && (
                  <span className="rounded-full bg-[#E6F4F4] px-2 py-0.5 text-[10px] font-bold text-[#087F80]">
                    ✓ Completed
                  </span>
                )}
              </div>
              <h1 className="text-base font-extrabold text-[#142033]">
                {activeLevel.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#F7F6F1] rounded-xl p-1 border border-[#DCE2E7]">
              <button
                type="button"
                onClick={() => handleSwitchLevel(1)}
                className={`px-2.5 py-1 text-xs font-extrabold rounded-lg transition cursor-pointer ${
                  currentLevelNumber === 1
                    ? 'bg-[#087F80] text-white shadow-xs'
                    : 'text-[#586579] hover:text-[#142033]'
                }`}
              >
                S1
              </button>
              <button
                type="button"
                onClick={() => handleSwitchLevel(2)}
                className={`px-2.5 py-1 text-xs font-extrabold rounded-lg transition cursor-pointer ${
                  currentLevelNumber === 2
                    ? 'bg-[#087F80] text-white shadow-xs'
                    : 'text-[#586579] hover:text-[#142033]'
                }`}
              >
                S2
              </button>
            </div>

            <button
              type="button"
              onClick={handleHint}
              className="rounded-xl border border-[#F5B942]/60 bg-[#FFFDF7] hover:bg-[#FEF6E4] px-3 py-1.5 text-xs font-bold text-[#946200] transition flex items-center gap-1.5 cursor-pointer"
              aria-expanded={showHint}
            >
              <span>{showHint ? 'Hide Clue' : 'Clue'}</span>
            </button>
          </div>
        </header>

        {showHint && (
          <aside className="rounded-2xl border border-[#F5B942]/60 bg-[#FFFDF7] p-4 text-xs font-medium text-[#142033]">
            <strong className="font-extrabold text-[#946200]">
              Clue {Math.max(hintLevel, 1)}:
            </strong>{' '}
            {hints[Math.max(hintLevel - 1, 0)]}
          </aside>
        )}

        {/* MACHINE APPARATUS */}
        <section className="rounded-3xl border border-[#DCE2E7] bg-white p-6 sm:p-8 shadow-sm">
          <div className="mx-auto max-w-lg rounded-3xl border border-[#DCE2E7] bg-[#F7F6F1] p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="text-center">
                <span className="block mb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#586579]">
                  Input
                </span>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#DCE2E7] bg-white text-3xl font-extrabold text-[#142033] shadow-2xs">
                  {currentInput}
                </div>
              </div>

              <div className="flex flex-1 flex-col items-center">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-full bg-[#142033] text-xl text-white transition-transform duration-500 ${
                    isProcessing ? 'rotate-180 animate-spin' : ''
                  }`}
                  aria-label={
                    isProcessing ? 'Transforming number' : 'Machine core idle'
                  }
                >
                  ⚙
                </div>
                <span className="mt-2 text-[9px] font-extrabold uppercase tracking-widest text-[#586579]">
                  {isProcessing ? 'Working…' : 'Hidden Rule'}
                </span>
              </div>

              <div className="text-center">
                <span className="block mb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#586579]">
                  Output
                </span>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#DCE2E7] bg-white text-3xl font-extrabold text-[#087F80] shadow-2xs">
                  {isProcessing ? '…' : currentOutput ?? '—'}
                </div>
              </div>
            </div>
          </div>

          {!isSolved ? (
            <div className="mt-6 pt-5 border-t border-[#DCE2E7] space-y-6">
              <div className="text-center">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#087F80]">
                  Feed Any Number to Test
                </span>
                <p className="text-xs font-medium text-[#586579] mt-0.5">
                  Tap numbers to run experiments and see how the output responds.
                </p>
              </div>

              <div className="grid grid-cols-9 gap-1.5 sm:gap-2 max-w-lg mx-auto">
                {activeLevel.allowedProbes.map((token) => {
                  const isActive = currentInput === token && !isProcessing;
                  return (
                    <button
                      key={token}
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleFeedToken(token)}
                      className={`h-12 sm:h-14 rounded-xl sm:rounded-2xl border font-extrabold text-base sm:text-xl transition cursor-pointer flex items-center justify-center ${
                        isActive
                          ? 'border-[#087F80] bg-[#E6F4F4] text-[#087F80]'
                          : 'border-[#DCE2E7] bg-white text-[#142033] hover:border-[#087F80] hover:bg-[#F7F6F1]'
                      }`}
                    >
                      {token}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#586579]">
                    Which rule fits your tests?
                  </span>
                  <span className="text-[11px] font-medium text-[#586579]">
                    Check the ledger below and pick one
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {activeLevel.candidateRules.map((rule) => {
                    const isSelected = selectedRuleId === rule.id;
                    return (
                      <button
                        key={rule.id}
                        type="button"
                        onClick={() => handlePickCandidate(rule.id)}
                        className={`rounded-2xl border p-4 text-left transition cursor-pointer ${
                          isSelected
                            ? 'border-[#087F80] bg-[#E6F4F4] shadow-2xs'
                            : 'border-[#DCE2E7] bg-white hover:border-[#087F80]/50 hover:bg-[#F7F6F1] text-[#142033]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-extrabold text-[#142033]">
                            {rule.label}
                          </span>
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                              isSelected
                                ? 'bg-[#087F80] text-white'
                                : 'bg-[#F7F6F1] text-[#586579] border border-[#DCE2E7]'
                            }`}
                          >
                            {isSelected ? 'Selected' : 'Option'}
                          </span>
                        </div>
                        <span className="mt-1 block text-xs font-medium text-[#586579]">
                          Rule: {rule.formulaDisplay}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {selectedRuleId && (
                  <div className="pt-3 text-center">
                    <button
                      type="button"
                      onClick={() => void handleConfirmDeduction()}
                      className="px-8 py-3 rounded-xl bg-[#087F80] hover:bg-[#0A9697] text-white text-xs font-extrabold uppercase tracking-wider transition cursor-pointer shadow-xs"
                    >
                      Save Deduction & Mark Complete →
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-6 pt-5 border-t border-[#DCE2E7] space-y-5 text-center">
              <div className="space-y-1">
                <span className="inline-block rounded-full bg-[#E6F4F4] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#087F80]">
                  ✓ Completed & Saved to Journey
                </span>
                <h2 className="pt-2 text-2xl font-extrabold text-[#142033]">
                  Sector {currentLevelNumber} Deduction Saved
                </h2>
              </div>

              <div className="mx-auto max-w-md rounded-2xl border border-[#DCE2E7] bg-[#F7F6F1] p-5 text-left">
                <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[#586579]">
                  Rule You Selected
                </span>
                <p className="text-base font-extrabold text-[#142033] mt-0.5">
                  {
                    activeLevel.candidateRules.find(
                      (r) => r.id === selectedRuleId
                    )?.label
                  }
                </p>
                <p className="text-xs font-medium text-[#586579] mt-1">
                  Recorded across {trialHistory.length} observations in your
                  ledger.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
                {currentLevelNumber === 1 && (
                  <button
                    type="button"
                    onClick={() => handleSwitchLevel(2)}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#087F80] hover:bg-[#0A9697] text-white text-xs font-extrabold uppercase tracking-wider transition cursor-pointer"
                  >
                    Try Sector 2 →
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsSolved(false)}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-[#DCE2E7] bg-white hover:bg-[#F7F6F1] text-[#142033] text-xs font-extrabold uppercase tracking-wider transition cursor-pointer"
                >
                  Test More Numbers
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/home')}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#142033] hover:bg-[#24344D] text-white text-xs font-extrabold uppercase tracking-wider transition cursor-pointer"
                >
                  Back to Missions ↗
                </button>
              </div>
            </div>
          )}
        </section>

        {/* PERSISTENT EVIDENCE LEDGER */}
        <section className="rounded-2xl border border-[#DCE2E7] bg-white p-4 shadow-xs">
          <div className="mb-2.5 flex items-center justify-between">
            <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-[#087F80]">
              Your Test Ledger
            </h2>
            <span className="text-[11px] font-semibold text-[#586579]">
              {trialHistory.length} test
              {trialHistory.length === 1 ? '' : 's'} logged
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {trialHistory.map((trial, idx) => (
              <div
                key={`${trial.input}-${trial.output}-${idx}`}
                className="rounded-xl border border-[#DCE2E7] bg-[#F7F6F1] p-2.5 text-center text-xs font-extrabold text-[#142033]"
              >
                <span className="block text-[9px] font-bold text-[#586579]">
                  Run {idx + 1}
                </span>
                {trial.input} <span className="text-[#087F80]">→</span>{' '}
                {trial.output}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}