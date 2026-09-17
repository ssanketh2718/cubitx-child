import { useState, useRef } from 'react';
import {
  registry,
  ProgressBar,
  NextButton,
  type MissionContext,
} from '../../core/sdk';
import { QUESTIONS } from './data';

type Phase = 'scenario' | 'response' | 'submitted';

function BigQuestion({ ctx }: { ctx: MissionContext }) {
  const [qIndex, setQIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('scenario');
  const [text, setText] = useState('');
  const [submittedAt, setSubmittedAt] = useState<number | null>(null);
  const responseStart = useRef(0);

  const q = QUESTIONS[qIndex];
  const isLast = qIndex === QUESTIONS.length - 1;

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (trimmed.length < 15) return;

    const timeSeconds = Math.round((Date.now() - responseStart.current) / 1000);
    setSubmittedAt(timeSeconds);

    ctx.emit('text_submitted', {
      text: trimmed,
      wordCount: trimmed.split(/\s+/).filter(Boolean).length,
      prompt: q.prompt,
      timeSeconds,
      questionId: q.id,
    }, qIndex);

    ctx.emit('round_completed', {
      correct: true,
      testCount: 1,
      seconds: timeSeconds,
      hintsUsed: 0,
      isNull: false,
    }, qIndex);

    setPhase('submitted');
  };

  const handleNext = () => {
    if (isLast) {
      ctx.onComplete();
    } else {
      setQIndex(i => i + 1);
      setText('');
      setPhase('scenario');
      setSubmittedAt(null);
    }
  };

  if (phase === 'scenario') {
    return (
      <div className="max-w-md mx-auto">
        <ProgressBar pct={(qIndex / QUESTIONS.length) * 100} />

        <div className="text-center mb-6">
          <div className="text-[64px] leading-none mb-3">{q.scenarioEmoji}</div>
          <div className="text-[13px] tracking-[2.5px] text-gold font-black uppercase mb-3">Think carefully</div>
          <div className="text-[18px] font-bold leading-snug text-white/95 px-2">{q.scenario}</div>
        </div>

        <div className="flex flex-col gap-2.5 mb-6">
          {q.options.map((opt, i) => (
            <div key={i} className="rounded-2xl border border-white/15 bg-white/[0.04] px-5 py-4 flex items-start gap-3.5">
              <span className="text-3xl flex-shrink-0 leading-none">{opt.em}</span>
              <div className="flex-1">
                <div className="text-[15.5px] font-black mb-1">{opt.label}</div>
                <div className="text-[13px] text-white/55 font-semibold leading-snug">{opt.hint}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center text-[16px] font-black text-gold mb-6 px-2">{q.ask}</div>

        <div className="text-center">
          <button
            onClick={() => { responseStart.current = Date.now(); setPhase('response'); }}
            className="rounded-full px-14 py-4 font-black text-[16px] tracking-wider bg-gradient-to-br from-gold to-gold2 text-amber-950 shadow-[0_12px_34px_rgba(255,157,46,0.5)] active:scale-95 transition"
          >
            WRITE MY ANSWER
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'response') {
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    const canSubmit = text.trim().length >= 15;

    return (
      <div className="max-w-md mx-auto">
        <ProgressBar pct={(qIndex / QUESTIONS.length) * 100} />

        <div className="text-center mb-5">
          <div className="text-[44px] leading-none mb-2">{q.scenarioEmoji}</div>
          <div className="text-[14px] text-white/60 font-bold italic px-2">{q.scenario}</div>
        </div>

        <div className="rounded-2xl border-2 border-gold/40 bg-gold/[0.05] px-5 py-4 mb-5 text-center">
          <div className="text-[15px] font-black text-gold">{q.ask}</div>
        </div>

        <div className="rounded-2xl border border-white/15 bg-black/30 p-3 mb-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={q.placeholder}
            rows={7}
            className="w-full bg-transparent text-white text-[15.5px] font-semibold leading-relaxed outline-none resize-none placeholder:text-white/30 px-2 py-1.5"
          />
        </div>

        <div className="flex items-center justify-between mb-5 px-1">
          <div className="text-[11.5px] text-white/40 font-bold">
            {wordCount} word{wordCount === 1 ? '' : 's'}
          </div>
          <div className={`text-[11.5px] font-bold ${canSubmit ? 'text-green-400' : 'text-white/40'}`}>
            {canSubmit ? '✓ Ready' : 'Write at least 15 characters'}
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`rounded-full px-14 py-4 font-black text-[16px] tracking-wider transition ${
              canSubmit
                ? 'bg-gradient-to-br from-mint to-emerald-500 text-emerald-950 shadow-[0_12px_34px_rgba(78,230,176,0.5)] active:scale-95'
                : 'bg-white/10 text-white/30 cursor-not-allowed'
            }`}
          >
            SEND TO MY TEACHER
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'submitted') {
    return (
      <div className="max-w-md mx-auto text-center">
        <div className="text-[80px] leading-none mb-4">🎉</div>
        <div className="text-[24px] font-black mb-3 bg-gradient-to-r from-white to-gold bg-clip-text text-transparent">
          Sent to your teacher!
        </div>
        <div className="text-[14.5px] text-white/60 font-bold leading-relaxed mb-7 px-4">
          There is no single right answer.<br />
          What matters is how you reasoned through it.
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-left mb-7">
          <div className="text-[10.5px] tracking-[2px] text-gold font-black mb-3">YOUR ANSWER</div>
          <div className="text-[14px] leading-relaxed text-white/80 font-semibold whitespace-pre-wrap">{text}</div>
          <div className="text-[11px] text-white/40 font-bold mt-3">
            Written in {submittedAt}s · {text.trim().split(/\s+/).filter(Boolean).length} words
          </div>
        </div>

        <NextButton show={true} onClick={handleNext}>
          {isLast ? 'Finish' : 'Next Question'}
        </NextButton>
      </div>
    );
  }

  return null;
}

registry.register({
  id: 'm5',
  name: 'The Big Question',
  emoji: '💭',
  domain: 'articulation',
  domainName: 'Articulation of Reasoning',
  sub: 'Write your thinking',
  measures: [
    { fn: 'argumentQuality', weight: 1.0 },
  ],
  tiers: ['advanced'],
  Component: BigQuestion,
});

