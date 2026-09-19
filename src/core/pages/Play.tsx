import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../store';
import { loadDayConfig } from '../../missions/curriculum';
import type { CurriculumTier, DayItem } from '../../missions/types';

const BRAND = {
  surface: '#05091a',
  surface2: '#0a1228',
  blue: '#7b8dff',
  blueBright: '#9aaaff',
  blueSoft: '#a8b6ff',
  ink: '#ffffff',
  inkDim: 'rgba(255,255,255,0.62)',
  inkFaint: 'rgba(255,255,255,0.38)',
  inkGhost: 'rgba(255,255,255,0.14)',
  emerald: '#34d399',
  red: '#f87171',
};

type Stage = 'intro' | 'working' | 'done';

function itemKey(tier: number, day: number, idx: number): string {
  return `t${tier}:d${day}:i${idx}`;
}

export default function Play() {
  const navigate = useNavigate();
  const { tier: tierParam, day: dayParam, idx: idxParam } = useParams();
  const completeItem = useApp((s) => s.completeItem);
  const saveResponse = useApp((s) => s.saveResponse);
  const isItemDone = useApp((s) => s.isItemDoneToday);

  const tier = Number(tierParam) as CurriculumTier;
  const day = Number(dayParam);
  const idx = Number(idxParam);

  const dayConfig = useMemo(() => loadDayConfig(tier, day), [tier, day]);
  const item = dayConfig?.items[idx];
  const requiredCount = dayConfig?.items.length ?? 0;

  const [stage, setStage] = useState<Stage>('intro');

  useEffect(() => {
    setStage('intro');
  }, [tier, day, idx]);

  if (!dayConfig || !item || Number.isNaN(tier) || Number.isNaN(day) || Number.isNaN(idx)) {
    return (
      <CenteredCard>
        <div className="text-[40px] mb-4">🔍</div>
        <div className="text-[18px] font-semibold">Item not found</div>
        <button
          onClick={() => navigate('/home')}
          className="mt-6 rounded-full px-6 py-3 text-[13px] font-bold"
          style={{ background: BRAND.ink, color: BRAND.surface }}
        >
          Back to Home
        </button>
      </CenteredCard>
    );
  }

  const key = itemKey(tier, day, idx);

  const onComplete = (response: {
    engine: string;
    text?: string;
    picked?: number;
    behaviours?: {
      testsBeforeGuess?: number;
      wentBackToTest?: boolean;
      secondsOnItem?: number;
    };
  }) => {
    saveResponse(key, response);
    completeItem(key, requiredCount);
    setStage('done');
  };

  const nextIdx = (() => {
    const n = dayConfig.items.length;
    for (let offset = 1; offset <= n; offset++) {
      const i = (idx + offset) % n;
      if (i === idx) continue;
      if (!isItemDone(itemKey(tier, day, i))) return i;
    }
    return -1;
  })();

  const goNext = () => {
    if (nextIdx === -1) {
      navigate('/home');
    } else {
      navigate(`/play/${tier}/${day}/${nextIdx}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-5 pb-24">
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate('/home')}
          aria-label="Back"
          className="w-10 h-10 rounded-full flex items-center justify-center text-[18px] transition"
          style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${BRAND.inkGhost}`, color: BRAND.inkDim }}
        >
          ←
        </button>
        <div className="flex-1">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: BRAND.blueSoft }}>
            Day {day} · Item {idx + 1} of {requiredCount}
          </div>
        </div>
      </div>

      <div className="mb-8 h-[3px] w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${((idx + (stage === 'done' ? 1 : 0)) / requiredCount) * 100}%`, background: BRAND.blue }}
        />
      </div>

      {stage === 'done' ? (
        <DoneState onNext={goNext} nextIdx={nextIdx} currentIdx={idx} total={requiredCount} />
      ) : item.engine === 'math' ? (
        <MathView item={item} stage={stage} setStage={setStage} onComplete={onComplete} />
      ) : item.engine === 'opinion' ? (
        <OpinionView item={item} stage={stage} setStage={setStage} onComplete={onComplete} />
      ) : item.engine === 'creative' ? (
        <CreativeView item={item} stage={stage} setStage={setStage} onComplete={onComplete} />
      ) : item.engine === 'watch' ? (
        <WatchView item={item} stage={stage} setStage={setStage} onComplete={onComplete} />
      ) : (
        <MissionPlaceholder onComplete={() => onComplete({ engine: item.engine })} />
      )}
    </div>
  );
}

function MathView({
  item, stage, setStage, onComplete,
}: {
  item: Extract<DayItem, { engine: 'math' }>;
  stage: Stage;
  setStage: (s: Stage) => void;
  onComplete: (r: {
    engine: string;
    picked?: number;
    behaviours?: {
      testsBeforeGuess?: number;
      wentBackToTest?: boolean;
      secondsOnItem?: number;
    };
  }) => void;
}) {
  const [tested, setTested] = useState<{ in: number; out: number }[]>([]);
  const [phase, setPhase] = useState<'test' | 'guess' | 'reveal'>('test');
  const [picked, setPicked] = useState<number | null>(null);
  const [wentBack, setWentBack] = useState(false);

  const startedAt = useRef<number>(Date.now());
  const testsBeforeGuess = useRef<number>(0);

  const inputs = item.tests.map((t) => t.in);
  const testedIn = new Set(tested.map((t) => t.in));
  const MIN_TESTS = 3;
  const canGuess = tested.length >= MIN_TESTS;
  const isCorrect = picked === item.answerIdx;

  const testInput = (n: number) => {
    if (testedIn.has(n)) return;
    const pair = item.tests.find((t) => t.in === n);
    if (!pair) return;
    setTested((prev) => [...prev, pair]);
    if (stage === 'intro') setStage('working');
  };

  const goToGuess = () => {
    testsBeforeGuess.current = tested.length;
    setPhase('guess');
  };

  const goBackToTest = () => {
    setWentBack(true);
    setPhase('test');
  };

  const finish = () => {
    onComplete({
      engine: 'math',
      picked: picked ?? undefined,
      behaviours: {
        testsBeforeGuess: testsBeforeGuess.current,
        wentBackToTest: wentBack,
        secondsOnItem: Math.round((Date.now() - startedAt.current) / 1000),
      },
    });
  };

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span className="text-[24px] leading-none">🔢</span>
        <span className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: BRAND.blueSoft }}>
          Number Machine
        </span>
      </div>

      <h1 className="text-[22px] md:text-[26px] font-semibold leading-[1.25] mb-3">
        {item.title}
      </h1>

      <p className="text-[14.5px] leading-[1.7] mb-7" style={{ color: BRAND.inkDim }}>
        {item.description}
      </p>

      {phase === 'test' && (
        <>
          <div className="mb-6">
            <div className="text-[11px] font-bold uppercase tracking-[0.14em] mb-2.5" style={{ color: BRAND.inkFaint }}>
              Tap a number to feed the machine
            </div>
            <div className="grid grid-cols-5 gap-2">
              {inputs.map((n) => {
                const already = testedIn.has(n);
                return (
                  <button
                    key={n}
                    onClick={() => testInput(n)}
                    disabled={already}
                    className="rounded-xl py-3.5 text-[16px] font-bold transition tabular-nums"
                    style={{
                      background: already ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${BRAND.inkGhost}`,
                      color: already ? BRAND.inkFaint : BRAND.ink,
                      opacity: already ? 0.35 : 1,
                      cursor: already ? 'default' : 'pointer',
                    }}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          </div>

          {tested.length > 0 && (
            <div className="mb-6">
              <div className="text-[11px] font-bold uppercase tracking-[0.14em] mb-2.5" style={{ color: BRAND.inkFaint }}>
                What the machine gave back
              </div>
              <div className="grid gap-1.5">
                {tested.map((t, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl px-4 py-3"
                    style={{ background: BRAND.surface2, border: `1px solid ${BRAND.inkGhost}` }}
                  >
                    <span className="text-[15px] font-bold tabular-nums" style={{ color: BRAND.inkDim }}>
                      {t.in}
                    </span>
                    <span style={{ color: BRAND.inkFaint }}>→</span>
                    <span className="text-[18px] font-bold tabular-nums" style={{ color: BRAND.blueBright }}>
                      {t.out}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={goToGuess}
            disabled={!canGuess}
            className="w-full rounded-full py-4 text-[15px] font-bold transition disabled:opacity-30"
            style={{ background: BRAND.ink, color: BRAND.surface }}
          >
            {canGuess
              ? 'I think I know the rule →'
              : `Test ${MIN_TESTS - tested.length} more to guess`}
          </button>
        </>
      )}

      {phase === 'guess' && (
        <>
          <div className="mb-6">
            <div className="text-[11px] font-bold uppercase tracking-[0.14em] mb-2.5" style={{ color: BRAND.inkFaint }}>
              Your tests so far
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tested.map((t, i) => (
                <span
                  key={i}
                  className="rounded-lg px-2.5 py-1.5 text-[12.5px] tabular-nums"
                  style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${BRAND.inkGhost}`, color: BRAND.inkDim }}
                >
                  {t.in} → <span style={{ color: BRAND.blueBright, fontWeight: 700 }}>{t.out}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="text-[12px] font-semibold mb-3" style={{ color: BRAND.inkDim }}>
            Which rule does the machine follow?
          </div>

          <div className="grid gap-2.5 mb-6">
            {item.ruleOptions.map((opt, i) => {
              const selected = picked === i;
              return (
                <button
                  key={i}
                  onClick={() => setPicked(i)}
                  className="flex items-center gap-3 rounded-2xl p-4 text-left transition-all"
                  style={{
                    background: selected ? `${BRAND.blue}18` : 'rgba(255,255,255,0.025)',
                    border: `1px solid ${selected ? BRAND.blue : BRAND.inkGhost}`,
                  }}
                >
                  <span
                    className="w-4 h-4 rounded-full flex-shrink-0 transition-all"
                    style={{
                      border: `2px solid ${selected ? BRAND.blue : BRAND.inkGhost}`,
                      background: selected ? BRAND.blue : 'transparent',
                    }}
                  />
                  <span className="text-[14.5px] font-semibold" style={{ color: BRAND.ink }}>
                    {opt}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex gap-2">
            <button
              onClick={goBackToTest}
              className="rounded-full px-5 py-4 text-[14px] font-bold transition"
              style={{ background: 'rgba(255,255,255,0.05)', color: BRAND.inkDim, border: `1px solid ${BRAND.inkGhost}` }}
            >
              Test more
            </button>
            <button
              onClick={() => picked !== null && setPhase('reveal')}
              disabled={picked === null}
              className="flex-1 rounded-full py-4 text-[15px] font-bold transition disabled:opacity-30"
              style={{ background: BRAND.ink, color: BRAND.surface }}
            >
              Submit
            </button>
          </div>
        </>
      )}

      {phase === 'reveal' && (
        <>
          <div
            className="rounded-2xl p-6 mb-6"
            style={{
              background: isCorrect ? 'rgba(52,211,153,0.08)' : 'rgba(123,141,255,0.08)',
              border: `1px solid ${isCorrect ? 'rgba(52,211,153,0.35)' : 'rgba(123,141,255,0.35)'}`,
            }}
          >
            <div className="text-[42px] mb-3">{isCorrect ? '🎯' : '💭'}</div>
            <div className="text-[18px] font-semibold mb-2">
              {isCorrect ? 'You found the rule.' : 'Look again — here is the answer.'}
            </div>
            <div className="text-[14px] leading-[1.7]" style={{ color: BRAND.inkDim }}>
              {item.explanation}
            </div>
          </div>

          <button
            onClick={finish}
            className="w-full rounded-full py-4 text-[15px] font-bold transition-transform hover:-translate-y-0.5"
            style={{ background: BRAND.ink, color: BRAND.surface }}
          >
            Continue →
          </button>
        </>
      )}
    </div>
  );
}

function OpinionView({
  item, stage, setStage, onComplete,
}: {
  item: Extract<DayItem, { engine: 'opinion' }>;
  stage: Stage;
  setStage: (s: Stage) => void;
  onComplete: (r: { engine: string; text?: string; picked?: number }) => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const [reason, setReason] = useState('');
  const canSubmit = picked !== null && reason.trim().length >= 20;

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span className="text-[24px] leading-none">🗣️</span>
        <span className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: BRAND.blueSoft }}>
          Your Opinion
        </span>
      </div>

      <h1 className="text-[22px] md:text-[26px] font-semibold leading-[1.3] mb-6">
        {item.question}
      </h1>

      <div className="grid gap-2.5 mb-6">
        {item.options.map((opt, i) => {
          const selected = picked === i;
          return (
            <button
              key={i}
              onClick={() => { setPicked(i); if (stage === 'intro') setStage('working'); }}
              className="flex items-start gap-3 rounded-2xl p-4 text-left transition-all"
              style={{
                background: selected ? `${BRAND.blue}18` : 'rgba(255,255,255,0.025)',
                border: `1px solid ${selected ? BRAND.blue : BRAND.inkGhost}`,
              }}
            >
              <span className="text-[22px] leading-none mt-[2px]">{opt.em}</span>
              <div className="flex-1">
                <div className="text-[14.5px] font-semibold" style={{ color: BRAND.ink }}>
                  {opt.label}
                </div>
                {opt.hint && (
                  <div className="text-[12.5px] mt-1" style={{ color: BRAND.inkFaint }}>
                    {opt.hint}
                  </div>
                )}
              </div>
              <span
                className="w-4 h-4 rounded-full mt-[6px] transition-all"
                style={{
                  border: `2px solid ${selected ? BRAND.blue : BRAND.inkGhost}`,
                  background: selected ? BRAND.blue : 'transparent',
                }}
              />
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <div>
          <div className="text-[12px] font-semibold mb-2" style={{ color: BRAND.inkDim }}>
            Now — why did you pick that?
          </div>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="I picked this because..."
            rows={4}
            className="w-full rounded-2xl p-4 text-[14px] outline-none resize-none"
            style={{
              background: 'rgba(0,0,0,0.25)',
              border: `1px solid ${BRAND.inkGhost}`,
              color: BRAND.ink,
            }}
          />
          <div className="mt-2 flex justify-between text-[11px]" style={{ color: BRAND.inkFaint }}>
            <span>{reason.trim().split(/\s+/).filter(Boolean).length} words</span>
            <span>{reason.trim().length < 20 ? 'At least 20 characters' : '✓ Ready'}</span>
          </div>
        </div>
      )}

      <button
        onClick={() => canSubmit && picked !== null && onComplete({ engine: 'opinion', text: reason.trim(), picked })}
        disabled={!canSubmit}
        className="mt-8 w-full rounded-full py-4 text-[15px] font-bold transition disabled:opacity-30"
        style={{ background: BRAND.ink, color: BRAND.surface }}
      >
        Submit
      </button>
    </div>
  );
}

function CreativeView({
  item, stage, setStage, onComplete,
}: {
  item: Extract<DayItem, { engine: 'creative' }>;
  stage: Stage;
  setStage: (s: Stage) => void;
  onComplete: (r: { engine: string; text?: string }) => void;
}) {
  const [text, setText] = useState('');
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const canSubmit = wordCount >= 20;

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span className="text-[24px] leading-none">✨</span>
        <span className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: BRAND.blueSoft }}>
          Create
        </span>
      </div>

      <h1 className="text-[22px] md:text-[26px] font-semibold leading-[1.3] mb-5">
        {item.prompt}
      </h1>

      {item.hint && (
        <p className="text-[14px] leading-[1.75] mb-6" style={{ color: BRAND.inkDim }}>
          {item.hint}
        </p>
      )}

      <textarea
        value={text}
        onChange={(e) => { setText(e.target.value); if (stage === 'intro' && e.target.value.length > 0) setStage('working'); }}
        placeholder="Start writing..."
        rows={8}
        className="w-full rounded-2xl p-5 text-[15px] leading-[1.7] outline-none resize-none"
        style={{
          background: 'rgba(0,0,0,0.25)',
          border: `1px solid ${BRAND.inkGhost}`,
          color: BRAND.ink,
        }}
      />

      <div className="mt-2 flex justify-between text-[11px]" style={{ color: BRAND.inkFaint }}>
        <span>{wordCount} words</span>
        <span>{wordCount < 20 ? `${20 - wordCount} more to go` : '✓ Ready'}</span>
      </div>

      <button
        onClick={() => canSubmit && onComplete({ engine: 'creative', text: text.trim() })}
        disabled={!canSubmit}
        className="mt-8 w-full rounded-full py-4 text-[15px] font-bold transition disabled:opacity-30"
        style={{ background: BRAND.ink, color: BRAND.surface }}
      >
        Submit
      </button>
    </div>
  );
}

function WatchView({
  item, stage, setStage, onComplete,
}: {
  item: Extract<DayItem, { engine: 'watch' }>;
  stage: Stage;
  setStage: (s: Stage) => void;
  onComplete: (r: { engine: string; text?: string }) => void;
}) {
  const [text, setText] = useState('');
  const [watched, setWatched] = useState(false);
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const canSubmit = watched && wordCount >= 15;

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span className="text-[24px] leading-none">🎬</span>
        <span className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: BRAND.blueSoft }}>
          Watch & Think
        </span>
      </div>

      <h1 className="text-[22px] md:text-[26px] font-semibold leading-[1.3] mb-6">
        {item.title}
      </h1>

      <div
        className="rounded-2xl p-6 mb-6 flex items-center gap-4"
        style={{ background: BRAND.surface2, border: `1px solid ${BRAND.inkGhost}` }}
      >
        <div className="text-[36px]">▶️</div>
        <div className="flex-1">
          <div className="text-[13.5px] font-semibold">Open in a new tab</div>
          <div className="text-[12px] mt-0.5" style={{ color: BRAND.inkFaint }}>
            Watch with a parent if you can
          </div>
        </div>
        <a
          href={item.video}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => { setWatched(true); if (stage === 'intro') setStage('working'); }}
          className="rounded-full px-5 py-2.5 text-[13px] font-bold transition"
          style={{ background: BRAND.ink, color: BRAND.surface }}
        >
          Watch →
        </a>
      </div>

      <div className="text-[12px] font-semibold mb-2" style={{ color: BRAND.inkDim }}>
        {item.reflect}
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Your answer..."
        rows={5}
        disabled={!watched}
        className="w-full rounded-2xl p-5 text-[15px] leading-[1.7] outline-none resize-none disabled:opacity-40"
        style={{
          background: 'rgba(0,0,0,0.25)',
          border: `1px solid ${BRAND.inkGhost}`,
          color: BRAND.ink,
        }}
      />

      <div className="mt-2 flex justify-between text-[11px]" style={{ color: BRAND.inkFaint }}>
        <span>{wordCount} words</span>
        <span>
          {!watched ? 'Watch the video first' : wordCount < 15 ? `${15 - wordCount} more` : '✓ Ready'}
        </span>
      </div>

      <button
        onClick={() => canSubmit && onComplete({ engine: 'watch', text: text.trim() })}
        disabled={!canSubmit}
        className="mt-8 w-full rounded-full py-4 text-[15px] font-bold transition disabled:opacity-30"
        style={{ background: BRAND.ink, color: BRAND.surface }}
      >
        Submit
      </button>
    </div>
  );
}

function MissionPlaceholder({ onComplete }: { onComplete: () => void }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span className="text-[24px] leading-none">🧩</span>
        <span className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: BRAND.blueSoft }}>
          Mission
        </span>
      </div>

      <h1 className="text-[22px] md:text-[26px] font-semibold leading-[1.3] mb-6">
        This mission is being upgraded.
      </h1>

      <p className="text-[15px] leading-[1.75] mb-8" style={{ color: BRAND.inkDim }}>
        A new version of this puzzle is on its way. You can mark it done and keep going.
      </p>

      <button
        onClick={onComplete}
        className="w-full rounded-full py-4 text-[15px] font-bold"
        style={{ background: BRAND.ink, color: BRAND.surface }}
      >
        Mark done
      </button>
    </div>
  );
}

function DoneState({
  onNext, nextIdx, currentIdx, total,
}: {
  onNext: () => void;
  nextIdx: number;
  currentIdx: number;
  total: number;
}) {
  const allDone = nextIdx === -1;
  const remaining = total - currentIdx - 1;

  return (
    <div className="text-center py-12">
      <div className="text-[64px] mb-4">✨</div>
      <div className="text-[22px] font-semibold mb-3">Nice thinking.</div>
      <div className="text-[14px] leading-[1.7] mb-8 max-w-sm mx-auto" style={{ color: BRAND.inkDim }}>
        {allDone
          ? "That's everything for today. Come back tomorrow — a new day unlocks at midnight."
          : remaining > 0
          ? `${remaining} more to go today. Keep the streak alive.`
          : 'One more left.'}
      </div>

      <button
        onClick={onNext}
        className="rounded-full px-8 py-4 text-[15px] font-bold transition-transform hover:-translate-y-0.5"
        style={{ background: BRAND.ink, color: BRAND.surface }}
      >
        {allDone ? 'All done for today →' : 'Next item →'}
      </button>
    </div>
  );
}

function CenteredCard({ children }: { children: React.ReactNode }) {
  return <div className="max-w-md mx-auto text-center py-20 px-5">{children}</div>;
}