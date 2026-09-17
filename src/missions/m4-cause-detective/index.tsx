import { useState, useRef, useEffect } from 'react';
import {
  registry,
  ProgressBar,
  NextButton,
  type MissionContext,
} from '../../core/sdk';
import { PUZZLES } from './data';

/* =========================================================
   MISSION 4 · CAUSE DETECTIVE
   Hidden skill: correlation vs causation
   ========================================================= */

type Phase = 'claim' | 'table' | 'hint' | 'lesson';

function CauseDetective({ ctx }: { ctx: MissionContext }) {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('claim');
  const [claimAnswer, setClaimAnswer] = useState<'yes' | 'no' | null>(null);
  const [analysisAttempts, setAnalysisAttempts] = useState(0);
  const [wrongOptions, setWrongOptions] = useState<string[]>([]);
  const [usedGiveUp, setUsedGiveUp] = useState(false);
  const [completedCorrectly, setCompletedCorrectly] = useState(false);
  const [hintText, setHintText] = useState('');
  const [pickedIndex, setPickedIndex] = useState<number | null>(null);

  const instinctTimeMs = useRef(0);
  const roundStart = useRef(Date.now());
  const roundLogged = useRef(false);

  const puzzle = PUZZLES[puzzleIndex];
  const isLastPuzzle = puzzleIndex === PUZZLES.length - 1;

  // Reset per puzzle
  useEffect(() => {
    setClaimAnswer(null);
    setAnalysisAttempts(0);
    setWrongOptions([]);
    setUsedGiveUp(false);
    setCompletedCorrectly(false);
    setHintText('');
    setPickedIndex(null);
    setPhase('claim');
    instinctTimeMs.current = 0;
    roundStart.current = Date.now();
    roundLogged.current = false;
  }, [puzzleIndex]);

  const recordRound = (viaCorrect: boolean, viaGiveUp: boolean) => {
    if (roundLogged.current) return;
    roundLogged.current = true;

    const seconds = Math.round((Date.now() - roundStart.current) / 1000);

    ctx.emit(
      'round_completed',
      {
        correct: viaCorrect,
        testCount: analysisAttempts + (viaGiveUp ? 0 : 1),
        seconds,
        hintsUsed: viaGiveUp ? 1 : 0,
        isNull: false,
      },
      puzzleIndex
    );

    console.log('[CauseDetective]', {
      puzzleId: puzzle.id,
      puzzleName: puzzle.name,
      firstInstinct: claimAnswer || 'yes',
      instinctTimeMs: instinctTimeMs.current,
      analysisAttempts: analysisAttempts + (viaGiveUp ? 0 : 1),
      wrongOptions,
      usedGiveUp: viaGiveUp,
      completedCorrectly: viaCorrect,
      seconds,
    });
  };

  const handleClaimAnswer = (answer: 'yes' | 'no') => {
    setClaimAnswer(answer);
    instinctTimeMs.current = Date.now() - roundStart.current;
    setPhase('table');
  };

  const handleAnalysis = (index: number) => {
    if (completedCorrectly) return;
    const option = puzzle.analysisOptions[index];

    if (option.correct) {
      setPickedIndex(index);
      setCompletedCorrectly(true);
      recordRound(true, false);
      setTimeout(() => setPhase('lesson'), 700);
    } else {
      setPickedIndex(index);
      const newWrong = [...wrongOptions, option.label];
      setWrongOptions(newWrong);
      setAnalysisAttempts(a => a + 1);
      setTimeout(() => {
        setHintText(option.wrongHint || 'Look again.');
        setPhase('hint');
      }, 500);
    }
  };

  const handleGiveUp = () => {
    setUsedGiveUp(true);
    recordRound(false, true);
    setPhase('lesson');
  };

  const handleNextPuzzle = () => {
    if (isLastPuzzle) {
      ctx.onComplete();
    } else {
      setPuzzleIndex(i => i + 1);
    }
  };

  /* ---------- CELL RENDERER ---------- */
  const renderCell = (val: string) => {
    const map: Record<string, { icon: string; text: string; cls: string }> = {
      yes:   { icon: '✅', text: 'Yes',   cls: 'text-green-400' },
      no:    { icon: '❌', text: 'No',    cls: 'text-red-400' },
      angry: { icon: '😠', text: 'Angry', cls: 'text-red-400' },
      calm:  { icon: '😊', text: 'Calm',  cls: 'text-green-400' },
      win:   { icon: '✅', text: 'Won',   cls: 'text-green-400' },
      loss:  { icon: '❌', text: 'Lost',  cls: 'text-red-400' },
    };
    const m = map[val];
    if (m) {
      return (
        <div className={`flex items-center justify-center gap-1 text-[12.5px] font-bold ${m.cls}`}>
          <span>{m.icon}</span>
          <span>{m.text}</span>
        </div>
      );
    }
    return <div className="text-center text-[12.5px] font-bold text-white/70">{val}</div>;
  };

  /* ---------- PHASE: CLAIM ---------- */
  if (phase === 'claim') {
    return (
      <div className="max-w-md mx-auto">
        <ProgressBar pct={(puzzleIndex / PUZZLES.length) * 100} />

        <div className="text-center mb-2">
          <div className="text-[60px] leading-none mb-2">{puzzle.kid}</div>
          <div className="text-[12px] tracking-[2.5px] text-white/50 font-bold uppercase mb-4">
            {puzzle.name}
          </div>
        </div>

        <div className="rounded-2xl border-2 border-gold/40 bg-white/[0.06] px-6 py-5 text-center mb-6">
          <div className="text-[18px] font-bold leading-snug">
            "{puzzle.claim}"
          </div>
        </div>

        <div className="text-center text-[15px] text-white/70 font-bold mb-4">
          {puzzle.question}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleClaimAnswer('yes')}
            className="rounded-2xl py-7 flex flex-col items-center gap-2 font-black text-lg tracking-wide bg-gradient-to-br from-green-400 to-emerald-600 text-emerald-950 shadow-[0_10px_28px_rgba(78,230,176,0.4)] active:scale-95 transition"
          >
            <span className="text-3xl">✅</span>
            <span>YES</span>
          </button>
          <button
            onClick={() => handleClaimAnswer('no')}
            className="rounded-2xl py-7 flex flex-col items-center gap-2 font-black text-lg tracking-wide bg-gradient-to-br from-red-400 to-red-600 text-white shadow-[0_10px_28px_rgba(231,76,60,0.4)] active:scale-95 transition"
          >
            <span className="text-3xl">❌</span>
            <span>NO</span>
          </button>
        </div>
      </div>
    );
  }

  /* ---------- PHASE: TABLE ---------- */
  if (phase === 'table') {
    return (
      <div className="max-w-xl mx-auto">
        <div className="text-center text-[13px] tracking-[2px] text-gold font-black uppercase mb-3">
          📋 {puzzle.tableTitle}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 mb-6 overflow-hidden">
          <div
            className="grid gap-1.5 px-2 py-2 text-[10px] tracking-wider uppercase text-white/50 font-black"
            style={{ gridTemplateColumns: '42px 1fr 1fr 1fr' }}
          >
            {puzzle.tableHead.map((h, i) => (
              <div
                key={i}
                className="text-center leading-tight min-h-[28px] flex items-center justify-center"
              >
                {h}
              </div>
            ))}
          </div>

          {puzzle.tableRows.map((row, ri) => (
            <div
              key={ri}
              className={`grid gap-1.5 px-2 py-2.5 rounded-lg items-center ${
                ri % 2 === 0 ? 'bg-white/[0.02]' : ''
              }`}
              style={{ gridTemplateColumns: '42px 1fr 1fr 1fr' }}
            >
              <div className="text-center text-[11px] font-black text-white/50">
                {row[0]}
              </div>
              {row.slice(1).map((val, ci) => (
                <div key={ci}>{renderCell(val)}</div>
              ))}
            </div>
          ))}
        </div>

        <div className="text-center text-[16px] font-black mb-4">
          {puzzle.analysisQuestion}
        </div>

        <div className="flex flex-col gap-2.5 mb-4">
          {puzzle.analysisOptions.map((opt, i) => {
            const isWrong = pickedIndex === i && !opt.correct;
            const isRight = pickedIndex === i && opt.correct;
            return (
              <button
                key={i}
                onClick={() => handleAnalysis(i)}
                disabled={completedCorrectly}
                className={`rounded-2xl border-2 px-5 py-4 text-left font-bold text-[15px] flex items-center gap-3 transition active:translate-x-1 ${
                  isRight
                    ? 'border-green-400/70 bg-green-400/15 shadow-[0_0_30px_rgba(78,230,176,0.4)]'
                    : isWrong
                    ? 'border-red-400/60 bg-red-400/15'
                    : 'border-white/15 bg-white/[0.05] hover:border-gold/50 hover:bg-gold/[0.08]'
                }`}
              >
                <span className="text-2xl flex-shrink-0">{opt.em}</span>
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        <div className="text-center">
          <button
            onClick={handleGiveUp}
            className="text-[11px] tracking-wider uppercase font-black text-white/40 underline hover:text-white/70"
          >
            Show me the answer
          </button>
        </div>
      </div>
    );
  }

  /* ---------- PHASE: HINT ---------- */
  if (phase === 'hint') {
    return (
      <div className="max-w-md mx-auto text-center">
        <div className="text-6xl mb-4">💭</div>
        <div className="text-2xl font-black mb-4">Look again.</div>
        <div className="text-[15px] text-white/70 font-bold leading-relaxed mb-8 px-2">
          {hintText}
        </div>
        <button
          onClick={() => {
            setPickedIndex(null);
            setPhase('table');
          }}
          className="rounded-full px-12 py-4 font-black text-[15px] tracking-wider bg-gradient-to-br from-mint to-emerald-500 text-emerald-950 shadow-[0_12px_34px_rgba(78,230,176,0.5)] active:scale-95 transition"
        >
          LOOK AGAIN
        </button>
      </div>
    );
  }

  /* ---------- PHASE: LESSON ---------- */
  if (phase === 'lesson') {
    const showGaveUpTitle = usedGiveUp && !completedCorrectly;
    return (
      <div className="max-w-md mx-auto text-center">
        <div className="text-7xl mb-4">
          {showGaveUpTitle ? '🔍' : puzzle.lessonIcon}
        </div>
        <div className="text-2xl font-black mb-6 bg-gradient-to-r from-white to-gold bg-clip-text text-transparent">
          {showGaveUpTitle ? 'Here is the answer.' : puzzle.lessonTitle}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 mb-8 text-left flex flex-col gap-3">
          {puzzle.lessonLines.map((line, i) => (
            <div key={i} className="flex items-start gap-3 text-[15px] font-bold leading-snug">
              <span className="text-xl flex-shrink-0">{line.bullet}</span>
              <span>{line.text}</span>
            </div>
          ))}
        </div>

        <NextButton show={true} onClick={handleNextPuzzle}>
          {isLastPuzzle ? 'Finish' : 'Next'}
        </NextButton>
      </div>
    );
  }

  return null;
}

registry.register({
  id: 'm4',
  name: 'Cause Detective',
  emoji: '🎯',
  domain: 'causality',
  domainName: 'Cause & Effect',
  sub: 'What really caused it?',
  measures: [
    { fn: 'firstTryAccuracy', weight: 0.5 },
    { fn: 'transferRate', weight: 0.3 },
    { fn: 'systematicity', weight: 0.2 },
  ],
  tiers: ['advanced'],
  Component: CauseDetective,
});



