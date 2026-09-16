import { useEffect, useMemo, useState } from 'react';
import {
  registry,
  RoundHeader,
  ProgressBar,
  FeedbackBanner,
  NextButton,
  type MissionContext,
} from '../../core/sdk';
import { ROUNDS, NP, buildOptions } from './rounds';

function PatternDetective({ ctx }: { ctx: MissionContext }) {
  const [round, setRound] = useState(0);
  const [locked, setLocked] = useState(true);
  const [revealed, setRevealed] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [roundStart, setRoundStart] = useState(Date.now());
  const [feedback, setFeedback] = useState<{
    show: boolean;
    kind: 'good' | 'bad';
    headline: string;
    detail?: string;
  }>({ show: false, kind: 'good', headline: '' });
  const [showNext, setShowNext] = useState(false);

  const r = ROUNDS[round];
  const options = useMemo(() => buildOptions(r), [r]);
  const isLastRound = round === ROUNDS.length - 1;

  useEffect(() => {
    setLocked(true);
    setRevealed(0);
    setPicked(null);
    setRoundStart(Date.now());

    let i = 0;
    const interval = setInterval(() => {
      i++;
      setRevealed(i);
      if (i >= r.seq.length) {
        clearInterval(interval);
        setTimeout(() => setLocked(false), 250);
      }
    }, 220);

    return () => clearInterval(interval);
  }, [round, r.seq.length]);

  const pick = (value: string) => {
    if (locked) return;
    setLocked(true);
    setPicked(value);

    const correct = r.isPattern ? r.next : NP;
    const isCorrect = value === correct;

    const seconds = Math.round((Date.now() - roundStart) / 1000);
    ctx.emit(
      'round_completed',
      {
        correct: isCorrect,
        testCount: 1,
        seconds,
        hintsUsed: 0,
        isNull: !r.isPattern,
      },
      round
    );

    setFeedback({
      show: true,
      kind: isCorrect ? 'good' : 'bad',
      headline: isCorrect
        ? r.isPattern
          ? 'Yes!'
          : 'You spotted it!'
        : r.isPattern
        ? 'Look again:'
        : 'This one was random:',
      detail: r.why,
    });

    setTimeout(() => setShowNext(true), 900);
  };

  const nextRound = () => {
    setFeedback({ show: false, kind: 'good', headline: '' });
    setShowNext(false);

    if (isLastRound) {
      ctx.onComplete();
      return;
    }

    setRound(round + 1);
  };

  const correctValue = r.isPattern ? r.next : NP;

  return (
    <div>
      <RoundHeader left={`Puzzle ${round + 1} of ${ROUNDS.length}`} />
      <ProgressBar pct={(round / ROUNDS.length) * 100} />

      <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-5 text-center mb-4">
        <div className="flex flex-wrap justify-center items-center gap-1.5 mb-4">
          {r.seq.map((item, i) => {
            const isVisible = i < revealed;
            return (
              <div
                key={i}
                className="w-[42px] h-[42px] flex items-center justify-center text-2xl rounded-xl border border-white/[0.08] transition-all"
                style={{
                  background:
                    'linear-gradient(160deg, rgba(255,255,255,.05), rgba(255,255,255,.01))',
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'scale(1)' : 'scale(0.3)',
                  transition: 'opacity 0.3s, transform 0.35s cubic-bezier(.3,1.7,.5,1)',
                }}
              >
                {item}
              </div>
            );
          })}
        </div>

        {revealed >= r.seq.length && (
          <div className="flex items-center justify-center gap-3 animate-fade">
            <span className="text-2xl font-bold text-blue-300">→</span>
            <span
              className="inline-flex items-center justify-center w-14 h-14 text-3xl font-bold rounded-xl border-2"
              style={{
                color: picked
                  ? r.isPattern
                    ? '#5ee08a'
                    : '#7b9dff'
                  : '#7b9dff',
                borderColor: picked
                  ? r.isPattern
                    ? 'rgba(94,224,138,0.6)'
                    : 'rgba(123,157,255,0.6)'
                  : 'rgba(123,157,255,0.6)',
                background: picked
                  ? r.isPattern
                    ? 'rgba(94,224,138,0.12)'
                    : 'rgba(123,157,255,0.1)'
                  : 'rgba(123,157,255,0.08)',
              }}
            >
              {picked ? (r.isPattern ? r.next : '🤷') : '?'}
            </span>
          </div>
        )}
      </div>

      <div className="text-center text-lg font-bold mb-4 text-white">
        What comes next?
      </div>

      <div className="flex gap-2 justify-center flex-wrap">
        {options.map((opt, i) => {
          const isNone = opt === NP;
          const isCorrect = opt === correctValue;
          const isPicked = opt === picked;

          let borderColor = isNone
            ? 'rgba(123,157,255,0.4)'
            : 'rgba(255,255,255,0.08)';
          let bg = isNone
            ? 'rgba(123,157,255,0.06)'
            : 'rgba(255,255,255,0.02)';

          if (picked) {
            if (isCorrect) {
              borderColor = 'rgba(94,224,138,0.6)';
              bg = 'rgba(94,224,138,0.12)';
            } else if (isPicked) {
              borderColor = 'rgba(255,107,107,0.6)';
              bg = 'rgba(255,107,107,0.1)';
            }
          }

          return (
            <button
              key={i}
              onClick={() => pick(opt)}
              disabled={locked}
              style={{ borderColor, background: bg }}
              className={`flex flex-col items-center gap-1 px-3 py-3 rounded-2xl border-2 font-bold transition ${
                isNone ? 'min-w-[110px]' : 'min-w-[66px]'
              }`}
            >
              {isNone ? (
                <>
                  <span className="text-2xl leading-none">🤔</span>
                  <span className="text-[9.5px] tracking-widest text-blue-300 font-bold mt-1">
                    NO PATTERN
                  </span>
                </>
              ) : (
                <span className="text-3xl leading-none">{opt}</span>
              )}
            </button>
          );
        })}
      </div>

      <FeedbackBanner
        show={feedback.show}
        kind={feedback.kind}
        headline={feedback.headline}
        detail={feedback.detail}
      />

      <NextButton show={showNext} onClick={nextRound}>
        {isLastRound ? 'Finish Mission' : 'Next Puzzle'}
      </NextButton>
    </div>
  );
}

registry.register({
  id: 'm3',
  name: 'Pattern Detective',
  emoji: '🔮',
  domain: 'pattern',
  domainName: 'Pattern Detection',
  sub: 'Real pattern or noise?',
  measures: [
    { fn: 'nullDetection', weight: 0.5 },
    { fn: 'firstTryAccuracy', weight: 0.3 },
    { fn: 'transferRate', weight: 0.2 },
  ],
  Component: PatternDetective,
});
