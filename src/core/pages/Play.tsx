import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../store';
import { loadDayConfig } from '../../missions/curriculum';
import type { CurriculumTier, DayItem } from '../../missions/types';

const BRAND = {
  surface: '#05091a',
  surface2: '#0a1228',
  surface3: '#0f1a38',
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

export default function Play() {
  const navigate = useNavigate();
  const { tier: tierParam, day: dayParam, idx: idxParam } = useParams();
  const completeItem = useApp((s) => s.completeItem);

  const tier = Number(tierParam) as CurriculumTier;
  const day = Number(dayParam);
  const idx = Number(idxParam);

  const dayConfig = useMemo(() => loadDayConfig(tier, day), [tier, day]);
  const item = dayConfig?.items[idx];
  const requiredCount = dayConfig?.items.length ?? 0;

  const [stage, setStage] = useState<Stage>('intro');

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

  const onComplete = () => {
    completeItem(itemKey(item, idx), requiredCount);
    setStage('done');
  };

  const finish = () => navigate('/home');

  return (
    <div className="max-w-2xl mx-auto px-5 pb-24">
      {/* Header */}
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

      {/* Progress bar */}
      <div className="mb-8 h-[3px] w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${((idx + (stage === 'done' ? 1 : 0)) / requiredCount) * 100}%`, background: BRAND.blue }}
        />
      </div>

      {stage === 'done' ? (
        <DoneState onNext={finish} />
      ) : item.engine === 'opinion' ? (
        <OpinionView item={item} stage={stage} setStage={setStage} onComplete={onComplete} />
      ) : item.engine === 'creative' ? (
        <CreativeView item={item} stage={stage} setStage={setStage} onComplete={onComplete} />
      ) : item.engine === 'watch' ? (
        <WatchView item={item} stage={stage} setStage={setStage} onComplete={onComplete} />
      ) : (
        <MissionPlaceholder onComplete={onComplete} />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   OPINION — scenario, tap an option, then say why
   ═══════════════════════════════════════════════════════════ */

function OpinionView({
  item, stage, setStage, onComplete,
}: {
  item: Extract<DayItem, { engine: 'opinion' }>;
  stage: Stage;
  setStage: (s: Stage) => void;
  onComplete: () => void;
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

      <h1 className="text-[26px] md:text-[30px] font-semibold leading-[1.15] tracking-[-0.02em] mb-6">
        {item.question}
      </h1>

      {item.scenario && (
        <p className="text-[15px] leading-[1.75] mb-6" style={{ color: BRAND.inkDim }}>
          {item.scenario}
        </p>
      )}

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
        onClick={() => canSubmit && onComplete()}
        disabled={!canSubmit}
        className="mt-8 w-full rounded-full py-4 text-[15px] font-bold transition disabled:opacity-30"
        style={{ background: BRAND.ink, color: BRAND.surface }}
      >
        Submit
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CREATIVE — open prompt, no wrong answer
   ═══════════════════════════════════════════════════════════ */

function CreativeView({
  item, stage, setStage, onComplete,
}: {
  item: Extract<DayItem, { engine: 'creative' }>;
  stage: Stage;
  setStage: (s: Stage) => void;
  onComplete: () => void;
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

      <h1 className="text-[26px] md:text-[30px] font-semibold leading-[1.15] tracking-[-0.02em] mb-5">
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
        onClick={() => canSubmit && onComplete()}
        disabled={!canSubmit}
        className="mt-8 w-full rounded-full py-4 text-[15px] font-bold transition disabled:opacity-30"
        style={{ background: BRAND.ink, color: BRAND.surface }}
      >
        Submit
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   WATCH — link out to video, then reflect
   (No iframe. Complies with constitution: no third-party embeds.)
   ═══════════════════════════════════════════════════════════ */

function WatchView({
  item, stage, setStage, onComplete,
}: {
  item: Extract<DayItem, { engine: 'watch' }>;
  stage: Stage;
  setStage: (s: Stage) => void;
  onComplete: () => void;
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

      <h1 className="text-[26px] md:text-[30px] font-semibold leading-[1.15] tracking-[-0.02em] mb-6">
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
        onClick={() => canSubmit && onComplete()}
        disabled={!canSubmit}
        className="mt-8 w-full rounded-full py-4 text-[15px] font-bold transition disabled:opacity-30"
        style={{ background: BRAND.ink, color: BRAND.surface }}
      >
        Submit
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PLACEHOLDER for m1–m5 while engines are wired
   ═══════════════════════════════════════════════════════════ */

function MissionPlaceholder({ onComplete }: { onComplete: () => void }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span className="text-[24px] leading-none">🧩</span>
        <span className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: BRAND.blueSoft }}>
          Mission
        </span>
      </div>

      <h1 className="text-[26px] md:text-[30px] font-semibold leading-[1.15] tracking-[-0.02em] mb-6">
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

/* ═══════════════════════════════════════════════════════════
   DONE state
   ═══════════════════════════════════════════════════════════ */

function DoneState({ onNext }: { onNext: () => void }) {
  return (
    <div className="text-center py-12">
      <div className="text-[64px] mb-4">✨</div>
      <div className="text-[22px] font-semibold mb-3">Nice thinking.</div>
      <div className="text-[14px] leading-[1.7] mb-8" style={{ color: BRAND.inkDim }}>
        Your answer is saved. Your parent can see how you think — not just what you got right.
      </div>
      <button
        onClick={onNext}
        className="rounded-full px-8 py-3.5 text-[14px] font-bold"
        style={{ background: BRAND.ink, color: BRAND.surface }}
      >
        Back to today →
      </button>
    </div>
  );
}

function CenteredCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-md mx-auto text-center py-20 px-5">{children}</div>
  );
}

/* ─── key for item ──────────────────────────────────────── */
function itemKey(item: DayItem, idx: number): string {
  switch (item.engine) {
    case 'm1':
    case 'm2':
    case 'm3':
    case 'm4':
    case 'm5':
      return `${item.engine}:${item.puzzle}`;
    case 'opinion':
      return `opinion:${item.question.slice(0, 40)}`;
    case 'creative':
      return `creative:${item.prompt.slice(0, 40)}`;
    case 'watch':
      return `watch:${item.video}`;
  }
  return `item:${idx}`;
}
