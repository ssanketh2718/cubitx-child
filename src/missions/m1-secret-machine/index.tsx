import { useState, useEffect } from 'react';
import {
  registry,
  RoundHeader,
  ProgressBar,
  FeedbackBanner,
  NextButton,
  type MissionContext,
} from '../../core/sdk';
import { LEVELS } from './levels';

function SecretMachine({ ctx }: { ctx: MissionContext }) {
  const [level, setLevel] = useState(0);
  const [input, setInput] = useState('');
  const [tests, setTests] = useState<{ n: number; out: number }[]>([]);
  const [hypotheses, setHypotheses] = useState<string[]>([]);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [output, setOutput] = useState<number | null>(null);
  const [hintText, setHintText] = useState('');
  const [levelStart, setLevelStart] = useState(Date.now());
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState<{
    show: boolean;
    kind: 'good' | 'bad';
    headline: string;
    detail?: string;
  }>({ show: false, kind: 'good', headline: '' });
  const [showNext, setShowNext] = useState(false);

  useEffect(() => {
    setLevelStart(Date.now());
  }, [level]);

  const L = LEVELS[level];
  const isLastLevel = level === LEVELS.length - 1;

  const pressKey = (k: string) => {
    if (locked) return;
    if (k === 'del') return setInput(input.slice(0, -1));
    if (k === 'go') return submitTest();
    if (input.length >= 2) return;
    if (input === '' && k === '0') return;
    setInput(input + k);
  };

  const submitTest = () => {
    const n = parseInt(input, 10);
    if (isNaN(n)) return;
    if (n < L.range[0] || n > L.range[1]) {
      setFeedback({
        show: true,
        kind: 'bad',
        headline: `Try a number between ${L.range[0]} and ${L.range[1]}.`,
      });
      setTimeout(() => setFeedback((f) => ({ ...f, show: false })), 1800);
      return;
    }
    if (tests.some((t) => t.n === n)) {
      setFeedback({
        show: true,
        kind: 'bad',
        headline: `${n} already tested. Try another.`,
      });
      setTimeout(() => setFeedback((f) => ({ ...f, show: false })), 1800);
      return;
    }

    const out = L.rule(n);
    setTests([...tests, { n, out }]);
    setOutput(out);
    setInput('');
    ctx.emit('test_submitted', { value: n, result: out }, level);
  };

  const showHint = () => {
    setHintsUsed(hintsUsed + 1);
    setHintText(L.hint);
    ctx.emit('hint_used', { afterTests: tests.length }, level);
  };

  const formGuess = () => {
    if (locked) return;
    const text = window.prompt('What do you think the rule is?');
    if (!text) return;
    setHypotheses([...hypotheses, text]);
    ctx.emit('hypothesis_formed', { text, afterTests: tests.length }, level);
    setTimeout(openChallenge, 300);
  };

  const openChallenge = () => {
    const tested = new Set(tests.map((t) => t.n));
    const pool: number[] = [];
    for (let i = L.range[0]; i <= L.range[1]; i++) {
      if (!tested.has(i)) pool.push(i);
    }
    const challengeN = pool.length
      ? pool[Math.floor(Math.random() * pool.length)]
      : L.range[0];

    const predictionStr = window.prompt(
      `Don't test. What would I do with ${challengeN}?`
    );
    if (!predictionStr) return;
    const predicted = parseInt(predictionStr, 10);
    const actual = L.rule(challengeN);

    ctx.emit(
      'prediction_made',
      { value: challengeN, predicted, actual, correct: predicted === actual },
      level
    );

    if (predicted === actual) {
      completeLevel();
    } else {
      setFeedback({
        show: true,
        kind: 'bad',
        headline: `The machine would say ${actual}.`,
        detail: 'Keep testing to find the rule!',
      });
      setTimeout(() => setFeedback((f) => ({ ...f, show: false })), 2200);
    }
  };

  const completeLevel = () => {
    setLocked(true);
    const seconds = Math.round((Date.now() - levelStart) / 1000);
    ctx.emit(
      'round_completed',
      {
        correct: true,
        testCount: tests.length,
        seconds,
        hintsUsed,
        isNull: false,
      },
      level
    );

    setFeedback({
      show: true,
      kind: 'good',
      headline: 'You cracked it!',
      detail: `The rule was: ${L.desc}`,
    });

    setTimeout(() => setShowNext(true), 300);
  };

  const nextLevel = () => {
    setFeedback({ show: false, kind: 'good', headline: '' });
    setShowNext(false);

    if (isLastLevel) {
      ctx.onComplete();
      return;
    }

    setLevel(level + 1);
    setTests([]);
    setHypotheses([]);
    setHintsUsed(0);
    setInput('');
    setOutput(null);
    setHintText('');
    setLocked(false);
  };

  return (
    <div>
      <RoundHeader
        left={`Machine ${level + 1} of ${LEVELS.length}`}
        right={`Tested ${tests.length}`}
      />
      <ProgressBar pct={(level / LEVELS.length) * 100} />

      <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 text-center mb-4">
        <div className="text-[11px] tracking-[0.08em] text-white/40 font-bold uppercase mb-2">
          MACHINE SAYS
        </div>
        <div
          className="text-6xl font-bold leading-none tabular-nums transition-colors"
          style={{ color: output !== null ? '#7b9dff' : '#1e2e5c' }}
        >
          {output !== null ? output : '?'}
        </div>
        <div className="text-[11px] tracking-[0.08em] text-white/40 font-bold uppercase mt-5 mb-2">
          YOU PUT IN
        </div>
        <div
          className="text-4xl font-bold leading-none tabular-nums"
          style={{ color: input ? '#fff' : '#1e2e5c' }}
        >
          {input || '–'}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((k) => (
          <button
            key={k}
            onClick={() => pressKey(k)}
            className="py-3.5 text-2xl font-bold rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] text-white transition"
          >
            {k}
          </button>
        ))}
        <button
          onClick={() => pressKey('del')}
          className="py-3.5 text-lg font-bold rounded-xl border border-white/[0.06] bg-white/[0.02] text-white/70 hover:bg-white/[0.05] transition"
        >
          ⌫
        </button>
        <button
          onClick={() => pressKey('0')}
          className="py-3.5 text-2xl font-bold rounded-xl border border-white/[0.06] bg-white/[0.02] text-white hover:bg-white/[0.05] transition"
        >
          0
        </button>
        <button
          onClick={() => pressKey('go')}
          className="py-3.5 text-sm font-bold rounded-xl bg-white text-navy-900 hover:bg-white/90 transition"
        >
          TEST
        </button>
      </div>

      <div className="flex gap-2 mb-3">
        <button
          onClick={formGuess}
          disabled={locked}
          className="flex-1 py-3 rounded-xl border border-white/[0.06] bg-white/[0.02] text-white text-[13px] font-semibold hover:bg-white/[0.05] transition disabled:opacity-40"
        >
          I have a guess
        </button>
        <button
          onClick={showHint}
          disabled={locked}
          className="flex-1 py-3 rounded-xl border border-white/[0.06] bg-white/[0.02] text-white text-[13px] font-semibold hover:bg-white/[0.05] transition disabled:opacity-40"
        >
          Hint
        </button>
      </div>

      {hintText && (
        <div className="mt-3 p-3 rounded-xl bg-blue-500/[0.08] border border-blue-400/20 text-blue-200 text-[13px] font-medium">
          {hintText}
        </div>
      )}

      <FeedbackBanner
        show={feedback.show}
        kind={feedback.kind}
        headline={feedback.headline}
        detail={feedback.detail}
      />

      <NextButton show={showNext} onClick={nextLevel}>
        {isLastLevel ? 'Finish Mission' : 'Next Machine'}
      </NextButton>

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 mt-4">
        <div className="text-[11px] tracking-[0.08em] text-white/40 font-bold uppercase mb-3">
          Tests
        </div>
        <div className="flex flex-wrap gap-2">
          {tests.length === 0 && (
            <span className="text-white/25 text-[13px] font-medium italic">
              Nothing yet.
            </span>
          )}
          {tests.map((t, i) => (
            <span
              key={i}
              className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white text-[13px] font-semibold tabular-nums"
            >
              {t.n} → <span className="text-blue-300">{t.out}</span>
            </span>
          ))}
        </div>
      </div>

      {hypotheses.length > 0 && (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 mt-3">
          <div className="text-[11px] tracking-[0.08em] text-white/40 font-bold uppercase mb-2">
            Your guesses
          </div>
          {hypotheses.map((h, i) => (
            <div key={i} className="text-[13px] text-white/70 font-medium italic mb-1">
              "{h}"
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

registry.register({
  id: 'm1',
  name: 'Secret Machine',
  emoji: '🔢',
  domain: 'hypothesis',
  domainName: 'Hypothesis Testing',
  sub: 'Find the hidden rule',
  measures: [
    { fn: 'systematicity', weight: 0.4 },
    { fn: 'hypothesisRate', weight: 0.25 },
    { fn: 'revisionRate', weight: 0.15 },
    { fn: 'efficiency', weight: 0.2 },
  ],
  idealTests: (r) => LEVELS[r]?.idealTests ?? 4,
  maxTests: () => 15,
  tiers: ['advanced'],
  Component: SecretMachine,
});
