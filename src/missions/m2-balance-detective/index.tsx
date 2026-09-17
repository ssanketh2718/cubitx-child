import { useState } from 'react';
import {
  registry,
  RoundHeader,
  ProgressBar,
  FeedbackBanner,
  NextButton,
  type MissionContext,
} from '../../core/sdk';
import { ROUNDS } from './rounds';

function BalanceDetective({ ctx }: { ctx: MissionContext }) {
  const [round, setRound] = useState(0);
  const [locked, setLocked] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [roundStart, setRoundStart] = useState(Date.now());
  const [feedback, setFeedback] = useState<{
    show: boolean;
    kind: 'good' | 'bad';
    headline: string;
    detail?: string;
  }>({ show: false, kind: 'good', headline: '' });
  const [showNext, setShowNext] = useState(false);

  const r = ROUNDS[round];
  const isLastRound = round === ROUNDS.length - 1;

  const pick = (i: number) => {
    if (locked) return;
    setLocked(true);
    setPicked(i);

    const correct = i === r.correct;
    const seconds = Math.round((Date.now() - roundStart) / 1000);

    ctx.emit(
      'round_completed',
      {
        correct,
        testCount: 1,
        seconds,
        hintsUsed: 0,
        isNull: r.isNull,
      },
      round
    );

    setFeedback({
      show: true,
      kind: correct ? 'good' : 'bad',
      headline: correct ? 'Yes!' : 'Look at the answer:',
      detail: r.why,
    });

    setTimeout(() => setShowNext(true), 800);
  };

  const nextRound = () => {
    setFeedback({ show: false, kind: 'good', headline: '' });
    setShowNext(false);
    setLocked(false);
    setPicked(null);

    if (isLastRound) {
      ctx.onComplete();
      return;
    }

    setRound(round + 1);
    setRoundStart(Date.now());
  };

  return (
    <div>
      <RoundHeader left={`Puzzle ${round + 1} of ${ROUNDS.length}`} />
      <ProgressBar pct={(round / ROUNDS.length) * 100} />

      <div className="flex flex-col gap-3 mb-5">
        {r.givens.map((gv, gi) => (
          <div
            key={gi}
            className="relative flex items-center justify-center gap-3 rounded-2xl border border-white/[0.06] py-5 px-4"
            style={{
              background:
                'linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.01))',
              paddingBottom: 34,
            }}
          >
            <div className="flex-1 flex justify-center gap-1 text-4xl leading-none">
              {gv.left.map((s, i) => (
                <span key={i}>{s}</span>
              ))}
            </div>
            <div className="text-3xl font-bold text-blue-300">=</div>
            <div className="flex-1 flex justify-center gap-1 text-4xl leading-none">
              {gv.right.map((s, i) => (
                <span key={i}>{s}</span>
              ))}
            </div>
            <div
              className="absolute left-[14%] right-[14%] h-[3px] rounded"
              style={{
                bottom: 20,
                background:
                  'linear-gradient(90deg, transparent, #7b9dff 15%, #7b9dff 85%, transparent)',
                boxShadow: '0 0 14px rgba(123,157,255,0.4)',
              }}
            />
          </div>
        ))}
      </div>

      <div className="text-center text-xl font-bold mb-4 text-white">
        {r.q}
      </div>

      <div className="flex gap-3 justify-center flex-wrap">
        {r.opts.map((opt, i) => {
          const isSame = typeof opt === 'object';
          const em = isSame ? opt.em : opt;
          const lbl = isSame ? opt.lbl : '';
          const isCorrect = i === r.correct;
          const isPicked = i === picked;

          let borderColor = 'rgba(255,255,255,0.08)';
          let bg = 'rgba(255,255,255,0.02)';
          if (picked !== null) {
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
              onClick={() => pick(i)}
              disabled={locked}
              style={{ borderColor, background: bg }}
              className="flex flex-col items-center gap-1 min-w-[80px] px-4 py-4 rounded-3xl border-2 transition"
            >
              <span className="text-3xl leading-none">{em}</span>
              {lbl && (
                <span className="text-[10px] tracking-widest text-white/40 font-bold mt-1">
                  {lbl}
                </span>
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
  id: 'm2',
  name: 'Balance Detective',
  emoji: '⚖️',
  domain: 'transitive',
  domainName: 'Transitive Reasoning',
  sub: 'Which is heaviest?',
  measures: [
    { fn: 'firstTryAccuracy', weight: 0.5 },
    { fn: 'nullDetection', weight: 0.3 },
    { fn: 'transferRate', weight: 0.2 },
  ],
  tiers: ['advanced'],
  Component: BalanceDetective,
});

