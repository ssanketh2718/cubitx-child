import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { detectParameters } from '../analytics/parameters';
import { detectBehaviours } from '../analytics/behavioural';
import { computeFullScore, LEVEL_LABELS, type Level } from '../analytics/scoring';
import { DIMENSION_LABELS, DIMENSION_ICONS } from '../analytics/habits';
import { normalise } from '../analytics/markers';

const BRAND = {
  surface: '#05091a',
  surface2: '#0a1228',
  blue: '#7b8dff',
  blueBright: '#9aaaff',
  ink: '#ffffff',
  inkDim: 'rgba(255,255,255,0.62)',
  inkFaint: 'rgba(255,255,255,0.38)',
  inkGhost: 'rgba(255,255,255,0.14)',
  emerald: '#34d399',
  amber: '#fbbf24',
  red: '#f87171',
};

export default function DevAnalysis() {
  const navigate = useNavigate();
  const [answer, setAnswer] = useState('');
  const [question, setQuestion] = useState('');
  const [scene, setScene] = useState('');
  const [result, setResult] = useState<any>(null);
  const [err, setErr] = useState('');

  const run = () => {
    if (answer.trim().length < 2) {
      setErr("Enter the child's answer.");
      return;
    }
    if (question.trim().length < 3) {
      setErr('Enter the question — the engine needs it to check relevance.');
      return;
    }
    if (scene.trim().length < 3) {
      setErr('Enter at least one scene keyword — the engine needs it to detect specifics.');
      return;
    }
    setErr('');

    const sceneKeywords = scene
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const params = detectParameters({
      answer,
      question,
      sceneKeywords,
    });

    const behaviours = detectBehaviours({
      timeToFirstTapMs: 5000,
      totalTimeMs: 30000,
      backtrackCount: 0,
      changedAnswerCount: 0,
      hintsUsed: 0,
    });

    const score = computeFullScore({ parameters: params, behaviours });
    setResult({ params, score, normalised: normalise(answer) });
  };

  return (
    <div className="max-w-4xl mx-auto px-5 pb-16">
      <button
        onClick={() => navigate('/home')}
        className="mb-5 flex items-center gap-1.5 text-[12.5px] font-semibold transition hover:text-white"
        style={{ color: BRAND.inkFaint }}
      >
        ← Back to Home
      </button>

      <div
        className="text-[10px] font-bold uppercase tracking-[0.22em] mb-2"
        style={{ color: BRAND.amber }}
      >
        🧪 Dev Only — Analysis Test Lab
      </div>
      <h1 className="text-[28px] font-semibold tracking-tight mb-2">
        Does the engine judge right?
      </h1>
      <p className="text-[14px] leading-[1.7] mb-6 max-w-2xl" style={{ color: BRAND.inkDim }}>
        All three fields are required. The engine uses the question and scene keywords
        to check relevance. An off-topic answer must score 0.
      </p>

      <div className="rounded-2xl p-5 mb-5" style={{ background: BRAND.surface2, border: `1px solid ${BRAND.inkGhost}` }}>
        <div className="text-[12px] font-semibold mb-2" style={{ color: BRAND.inkDim }}>
          Question
        </div>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. Why does the metal spoon cool the chai?"
          className="w-full rounded-xl px-4 py-3 text-[14px] mb-3 outline-none"
          style={{ background: 'rgba(0,0,0,0.25)', border: `1px solid ${BRAND.inkGhost}`, color: BRAND.ink }}
        />

        <div className="text-[12px] font-semibold mb-2" style={{ color: BRAND.inkDim }}>
          Scene keywords (comma-separated)
        </div>
        <input
          value={scene}
          onChange={(e) => setScene(e.target.value)}
          placeholder="e.g. metal, spoon, chai, colder, heat, plastic"
          className="w-full rounded-xl px-4 py-3 text-[14px] mb-3 outline-none"
          style={{ background: 'rgba(0,0,0,0.25)', border: `1px solid ${BRAND.inkGhost}`, color: BRAND.ink }}
        />

        <div className="text-[12px] font-semibold mb-2" style={{ color: BRAND.inkDim }}>
          Child's answer
        </div>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={4}
          placeholder="Type or paste the child's answer here..."
          className="w-full rounded-xl p-4 text-[14px] outline-none resize-none"
          style={{ background: 'rgba(0,0,0,0.25)', border: `1px solid ${BRAND.inkGhost}`, color: BRAND.ink }}
        />

        {err && (
          <div className="mt-3 rounded-xl px-3 py-2 text-[12.5px]" style={{ background: 'rgba(248,113,113,0.12)', color: BRAND.red }}>
            {err}
          </div>
        )}

        <button
          onClick={run}
          className="mt-4 rounded-full px-6 py-3 text-[13px] font-bold transition"
          style={{ background: BRAND.ink, color: BRAND.surface }}
        >
          Analyze →
        </button>
      </div>

      {result && (
        <>
          <div className="rounded-2xl p-5 mb-5" style={{ background: `${BRAND.blue}10`, border: `1px solid ${BRAND.blue}33` }}>
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] mb-2" style={{ color: BRAND.blueBright }}>
              Composite score
            </div>
            <div className="flex items-baseline gap-3">
              <div className="text-[42px] font-bold leading-none" style={{ color: BRAND.blueBright }}>
                {result.score.composite}
              </div>
              <div className="text-[14px]" style={{ color: BRAND.inkDim }}>
                / 100
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-5 mb-5" style={{ background: BRAND.surface2, border: `1px solid ${BRAND.inkGhost}` }}>
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] mb-2" style={{ color: BRAND.inkFaint }}>
              Normalised text (what the engine sees)
            </div>
            <div className="text-[13px] leading-[1.6] font-mono" style={{ color: BRAND.inkDim }}>
              {result.normalised}
            </div>
          </div>

          <div className="rounded-2xl p-5 mb-5" style={{ background: BRAND.surface2, border: `1px solid ${BRAND.inkGhost}` }}>
            <div className="text-[14px] font-semibold mb-4">Dimension scores</div>
            <div className="grid gap-3">
              {result.score.dimensions.map((d: any) => {
                const key = d.dimension as keyof typeof DIMENSION_LABELS;
                const barColor = d.level >= 4 ? BRAND.emerald : d.level >= 2 ? BRAND.blue : 'rgba(255,255,255,0.15)';
                return (
                  <div key={d.dimension}>
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="text-[16px]">{DIMENSION_ICONS[key]}</span>
                      <span className="text-[13px] font-semibold flex-1">{DIMENSION_LABELS[key]}</span>
                      <span className="text-[12px] tabular-nums font-bold" style={{ color: BRAND.blueBright }}>
                        {d.score}
                      </span>
                      <span className="text-[11px]" style={{ color: BRAND.inkFaint }}>
                        {LEVEL_LABELS[d.level as Level]}
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(d.score, 2)}%`, background: barColor }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl p-5 mb-5" style={{ background: BRAND.surface2, border: `1px solid ${BRAND.inkGhost}` }}>
            <div className="text-[14px] font-semibold mb-4">Parameters detected</div>
            <div className="grid gap-3">
              {Object.entries(result.params).map(([dim, list]: any) => (
                <div key={dim}>
                  <div className="text-[11px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: BRAND.inkFaint }}>
                    {dim}
                  </div>
                  <div className="grid gap-1.5">
                    {list.map((p: any) => (
                      <div
                        key={p.code}
                        className="flex items-center gap-3 rounded-lg px-3 py-2"
                        style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${BRAND.inkGhost}` }}
                      >
                        <span className="text-[11px] font-bold tabular-nums w-8" style={{ color: BRAND.inkFaint }}>
                          {p.code}
                        </span>
                        <div className="flex gap-0.5">
                          {[0, 1, 2, 3, 4, 5].map((i) => (
                            <span
                              key={i}
                              className="w-2 h-2 rounded-full"
                              style={{ background: i <= p.level ? BRAND.blueBright : 'rgba(255,255,255,0.08)' }}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] tabular-nums w-8 text-right" style={{ color: BRAND.inkFaint }}>
                          {p.level}/5
                        </span>
                        {p.evidence && (
                          <span className="text-[11.5px] truncate flex-1" style={{ color: BRAND.inkDim }} title={p.evidence}>
                            {p.evidence}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {result.score.totalEvidence.length > 0 && (
            <div className="rounded-2xl p-5 mb-5" style={{ background: BRAND.surface2, border: `1px solid ${BRAND.inkGhost}` }}>
              <div className="text-[14px] font-semibold mb-3">Evidence surfaced for parent</div>
              <div className="grid gap-2">
                {result.score.totalEvidence.map((e: string, i: number) => (
                  <div
                    key={i}
                    className="rounded-lg px-3 py-2 text-[13px] italic"
                    style={{ background: 'rgba(0,0,0,0.2)', color: BRAND.inkDim }}
                  >
                    “{e}”
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
