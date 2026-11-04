import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

function generateAttemptId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `attempt_${Date.now()}`;
}

export default function CrackTheMachine() {
  const navigate = useNavigate();
  const telemetryRef = useRef<MachineTelemetryService | null>(null);
  const startedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Active Sector (Level 1 or 2)
  const [currentLevelNumber, setCurrentLevelNumber] = useState<number>(1);
  const activeLevel: MachineLevelDefinition = MACHINE_LEVELS[currentLevelNumber] || MACHINE_LEVELS[1];

  // Machine Sandbox State
  const [currentInput, setCurrentInput] = useState<number>(activeLevel.initialObservations[0].input);
  const [currentOutput, setCurrentOutput] = useState<number | null>(activeLevel.initialObservations[0].output);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [trialHistory, setTrialHistory] = useState<readonly MachineObservation[]>([
    ...activeLevel.initialObservations,
  ]);
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [isSolved, setIsSolved] = useState<boolean>(false);

  // Hints
  const [hintLevel, setHintLevel] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);

  const hints = [
    `Test 1 shows: ${activeLevel.initialObservations[0].input} became ${activeLevel.initialObservations[0].output}. Both formulas fit this initial test!`,
    'Test a different number like 3, 5, or 7. Calculate which rule matches the output shown in the ledger.',
    'Look at the Evidence Ledger below. Find the formula that works for every single test.',
  ];

  // Reset state when switching sectors
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

  // 1-Tap Feed: Numbers 1 to 9
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
    setSelectedRuleId(ruleId);
    emit('candidate_rule_selected', { rule_id: ruleId });
  };

  const handleConfirmDeduction = () => {
    if (!selectedRuleId) return;

    const isCorrect = selectedRuleId === activeLevel.hiddenRule.id;

    emit('position_updated', {
      prior_position: null,
      final_position: selectedRuleId,
    });

    setIsSolved(true);

    emit('mission_completed', {
      completion_state: isCorrect ? 'one_candidate_remains' : 'evidence_insufficient',
    });
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
    <main className="-mt-6 -mx-4 px-4 pt-5 pb-28 min-h-screen bg-[#FAF9F5] text-[#111827] font-sans selection:bg-[#EDE9FE] selection:text-[#6D28D9]">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* ── TOP HUD ── */}
        <header className="flex items-center justify-between bg-white border border-[#E7E5E0] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleExit}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-800 font-bold transition cursor-pointer"
              title="Return to Home"
            >
              ←
            </button>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#5B21B6]">
                Discovery Terminal · Sector {currentLevelNumber}
              </p>
              <h1 className="text-base font-extrabold text-[#111827]">
                {activeLevel.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Sector Selector */}
            <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => handleSwitchLevel(1)}
                className={`px-2.5 py-1 text-xs font-black rounded-lg transition cursor-pointer ${
                  currentLevelNumber === 1
                    ? 'bg-white text-[#5B21B6] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                S1
              </button>
              <button
                type="button"
                onClick={() => handleSwitchLevel(2)}
                className={`px-2.5 py-1 text-xs font-black rounded-lg transition cursor-pointer ${
                  currentLevelNumber === 2
                    ? 'bg-white text-[#5B21B6] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                S2
              </button>
            </div>

            <button
              type="button"
              onClick={handleHint}
              className="rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-950 transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              aria-expanded={showHint}
            >
              <span>💡</span>
              <span>{showHint ? 'Hide Clue' : 'Clue'}</span>
            </button>
          </div>
        </header>

        {showHint && (
          <aside className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs font-medium text-amber-950 animate-fadeIn">
            <strong className="font-extrabold">Clue {Math.max(hintLevel, 1)}:</strong>{' '}
            {hints[Math.max(hintLevel - 1, 0)]}
          </aside>
        )}

        {/* ── THE INTERACTIVE MACHINE APPARATUS ── */}
        <section className="rounded-[32px] border border-[#E7E5E0] bg-white p-6 sm:p-8 shadow-sm border-b-4 border-b-[#DDD9D2]">
          
          <div className="mx-auto max-w-lg rounded-3xl border-2 border-[#E7E5E0] bg-[#FAF9F5] p-5 shadow-inner">
            <div className="flex items-center justify-between gap-3">
              
              {/* Input Hopper */}
              <div className="text-center">
                <span className="block mb-1.5 text-[10px] font-black uppercase tracking-wider text-slate-600">
                  Input
                </span>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-slate-300 bg-white text-3xl font-black text-[#111827] shadow-sm">
                  {currentInput}
                </div>
              </div>

              {/* Transformation Core */}
              <div className="flex flex-1 flex-col items-center">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-full bg-[#111827] text-2xl text-white shadow-md transition-transform duration-500 ${
                    isProcessing ? 'rotate-180 animate-spin' : ''
                  }`}
                  aria-label={isProcessing ? 'Transforming number' : 'Machine core idle'}
                >
                  ⚙
                </div>
                <span className="mt-2 text-[9px] font-black uppercase tracking-widest text-slate-600">
                  {isProcessing ? 'Working…' : 'Hidden Core'}
                </span>
              </div>

              {/* Output Hopper */}
              <div className="text-center">
                <span className="block mb-1.5 text-[10px] font-black uppercase tracking-wider text-slate-600">
                  Output
                </span>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-slate-300 bg-white text-3xl font-black text-[#5B21B6] shadow-sm">
                  {isProcessing ? '…' : currentOutput ?? '—'}
                </div>
              </div>

            </div>
          </div>

          {/* ── 1-TAP PLAY RACK (CLEAN 9-COLUMN GRID) ── */}
          {!isSolved ? (
            <div className="mt-6 pt-5 border-t border-slate-100 space-y-6">
              <div className="text-center">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#5B21B6]">
                  Feed Any Token to Test
                </span>
                <p className="text-xs font-semibold text-slate-600 mt-0.5">
                  Tap any number to run an experiment through the machine.
                </p>
              </div>

              {/* Numbers 1 to 9 */}
              <div className="grid grid-cols-9 gap-1.5 sm:gap-2 max-w-lg mx-auto">
                {activeLevel.allowedProbes.map((token) => {
                  const isActive = currentInput === token && !isProcessing;
                  return (
                    <button
                      key={token}
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleFeedToken(token)}
                      className={`h-12 sm:h-14 rounded-xl sm:rounded-2xl border-2 font-black text-base sm:text-xl transition cursor-pointer flex items-center justify-center active:translate-y-1 shadow-xs border-b-4 ${
                        isActive
                          ? 'border-[#6D28D9] bg-purple-50 text-[#5B21B6] border-b-[#5B21B6]'
                          : 'border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50 border-b-slate-400'
                      }`}
                    >
                      {token}
                    </button>
                  );
                })}
              </div>

              {/* ── CANDIDATE CARDS (HIGH CONTRAST) ── */}
              <div className="pt-2 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                    Which rule fits the machine?
                  </span>
                  <span className="text-[10px] font-bold text-slate-600">
                    Check your ledger and choose
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
                        className={`rounded-2xl border-2 p-4 text-left transition cursor-pointer border-b-4 ${
                          isSelected
                            ? 'border-[#6D28D9] bg-purple-50 border-b-[#5B21B6] shadow-xs'
                            : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-[#FAF9F5] border-b-slate-400 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-[#111827]">
                            {rule.label}
                          </span>
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                              isSelected
                                ? 'bg-purple-200 text-[#5B21B6]'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {isSelected ? 'Your Choice ●' : 'Candidate'}
                          </span>
                        </div>
                        <span className="mt-1 block text-[11px] font-semibold text-slate-600">
                          Formula: {rule.formulaDisplay}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Confirm Deduction Button */}
                {selectedRuleId && (
                  <div className="pt-3 text-center animate-fadeIn">
                    <button
                      type="button"
                      onClick={handleConfirmDeduction}
                      className="px-8 py-3 rounded-xl bg-[#111827] hover:bg-[#6D28D9] text-white text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-md"
                    >
                      Confirm My Deduction →
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ── DISCOVERY CONCLUDED SCREEN ── */
            <div className="mt-6 pt-5 border-t border-slate-100 space-y-6 text-center animate-fadeIn">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 text-[#5B21B6] flex items-center justify-center text-2xl mx-auto shadow-xs font-black">
                ✦
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#5B21B6]">
                  Deduction Established
                </span>
                <h2 className="text-2xl font-extrabold text-[#111827]">
                  You Cracked Sector {currentLevelNumber}!
                </h2>
              </div>

              <div className="mx-auto max-w-md rounded-2xl border border-slate-300 bg-[#FAF9F5] p-5 text-left shadow-xs">
                <span className="block text-[9px] font-black uppercase tracking-wider text-slate-600">
                  Confirmed Secret Rule
                </span>
                <p className="text-base font-black text-[#111827] mt-0.5">
                  {activeLevel.candidateRules.find((r) => r.id === selectedRuleId)?.label}
                </p>
                <p className="text-xs font-semibold text-slate-600 mt-1">
                  Proven across {trialHistory.length} tests in your Evidence Ledger.
                </p>
              </div>

              {/* Clean child-focused actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                {currentLevelNumber === 1 && (
                  <button
                    type="button"
                    onClick={() => handleSwitchLevel(2)}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-md"
                  >
                    Next Sector (Level 2) →
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsSolved(false)}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold uppercase tracking-wider transition cursor-pointer"
                >
                  Test More Numbers
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/home')}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#111827] hover:bg-[#6D28D9] text-white text-xs font-black uppercase tracking-wider transition cursor-pointer"
                >
                  Home Map ↗
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ── PERSISTENT EVIDENCE LEDGER ── */}
        <section className="rounded-2xl border border-[#E7E5E0] bg-white p-4 shadow-sm">
          <div className="mb-2.5 flex items-center justify-between">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-[#5B21B6]">
              Evidence Ledger
            </h2>
            <span className="text-[11px] font-bold text-slate-600">
              {trialHistory.length} observation{trialHistory.length === 1 ? '' : 's'} recorded
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {trialHistory.map((trial, idx) => (
              <div
                key={`${trial.input}-${trial.output}-${idx}`}
                className="rounded-xl border border-slate-300 bg-[#FAF9F5] p-2.5 text-center text-xs font-extrabold text-slate-800"
              >
                <span className="block text-[9px] font-bold text-slate-600">
                  Test {idx + 1}
                </span>
                {trial.input} <span className="text-[#5B21B6]">→</span> {trial.output}
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}