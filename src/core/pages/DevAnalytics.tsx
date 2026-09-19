import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { extractSignals, type Signals } from '../analytics/signals';
import { SIGNAL_LABELS, THINKER_INFO, type SignalKey, type ThinkerType } from '../analytics/profile';
import { HABITS } from '../analytics/habits';

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
  amber: '#fbbf24',
};

const SIGNAL_KEYS: SignalKey[] = [
  'groundedness',
  'alternatives',
  'revision',
  'calibration',
  'reasoningChain',
  'expression',
];

const SAMPLE_VARIANTS = [
  'No.',
  'I would give the gift because she might just be shy.',
  'I would give the gift anyway. My sister sometimes says things to get attention. But maybe she is right. If mom really does not want it, I would feel bad. So I would give it and watch her face.',
  'I think the best choice is to ask my sister why. She usually knows but sometimes she lies for fun. But I would need to know if she is serious. If she says "I am serious" then I would believe her. If not, I would give the gift anyway.',
  'I would always give the gift. My mom never lies and my sister always lies. There is definitely only one right answer.',
  'Give it. Because I spent my own money and she is my mom. So she will like anything I give. So I give it.',
];

function classify(s: Signals, count: number): ThinkerType {
  if (count < 3) return 'developing';
  if (s.revision >= 55 && s.reasoningChain >= 55) return 'investigator';
  if (s.alternatives >= 55 && s.calibration >= 55) return 'weigher';
  if (s.groundedness >= 60 && s.alternatives < 40) return 'observer';
  if (s.calibration < 40 && s.alternatives < 40) return 'intuitor';
  if (s.expression >= 60 && s.reasoningChain < 40) return 'articulator';
  return 'developing';
}

function strengthOf(s: Signals): SignalKey {
  let best: SignalKey = 'reasoningChain';
  let max = -1;
  for (const k of SIGNAL_KEYS) {
    if (s[k] > max) {
      max = s[k];
      best = k;
    }
  }
  return best;
}

function weaknessOf(s: Signals): SignalKey {
  let worst: SignalKey = 'revision';
  let min = 101;
  for (const k of SIGNAL_KEYS) {
    if (s[k] < min) {
      min = s[k];
      worst = k;
    }
  }
  return worst;
}

export default function DevAnalytics() {
  const navigate = useNavigate();
  const [variants, setVariants] = useState<string[]>(SAMPLE_VARIANTS);
  const [analyzed, setAnalyzed] = useState(false);

  const results = variants.map((t) => {
    const signals = extractSignals(t);
    return {
      text: t,
      signals,
      type: classify(signals, 10),
      strength: strengthOf(signals),
      weakness: weaknessOf(signals),
      words: t.trim().split(/\s+/).filter(Boolean).length,
    };
  });

  const setVariant = (i: number, v: string) => {
    setVariants((prev) => prev.map((x, idx) => (idx === i ? v : x)));
  };

  const resetSamples = () => {
    setVariants(SAMPLE_VARIANTS);
    setAnalyzed(true);
  };

  const clearAll = () => {
    setVariants(Array(6).fill(''));
    setAnalyzed(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-5 pb-16">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/home')}
          className="mb-4 flex items-center gap-1.5 text-[12.5px] font-semibold transition hover:text-white"
          style={{ color: BRAND.inkFaint }}
        >
          ← Back to Home
        </button>
        <div
          className="text-[10px] font-bold uppercase mb-2"
          style={{ color: BRAND.amber, letterSpacing: '0.2em' }}
        >
          🧪 Dev Only
        </div>
        <h1 className="text-[28px] font-semibold tracking-tight">Analytics Test Lab</h1>
        <p className="text-[14px] mt-2 leading-[1.65] max-w-2xl" style={{ color: BRAND.inkDim }}>
          Paste 6 different answers to the same question. Watch how each signal is
          extracted and what thinker type each answer would produce. Never seen by parents.
        </p>
      </div>

      {/* Action row */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setAnalyzed(true)}
          className="rounded-full px-5 py-2.5 text-[13px] font-bold transition"
          style={{ background: BRAND.ink, color: BRAND.surface }}
        >
          Analyze
        </button>
        <button
          onClick={resetSamples}
          className="rounded-full px-5 py-2.5 text-[13px] font-bold transition"
          style={{ background: 'rgba(255,255,255,0.05)', color: BRAND.inkDim, border: `1px solid ${BRAND.inkGhost}` }}
        >
          Load 6 samples
        </button>
        <button
          onClick={clearAll}
          className="rounded-full px-5 py-2.5 text-[13px] font-bold transition"
          style={{ background: 'rgba(255,255,255,0.05)', color: BRAND.inkDim, border: `1px solid ${BRAND.inkGhost}` }}
        >
          Clear all
        </button>
      </div>

      {/* Inputs */}
      <div className="grid gap-3 mb-8">
        {variants.map((v, i) => (
          <div
            key={i}
            className="rounded-2xl p-4"
            style={{ background: BRAND.surface2, border: `1px solid ${BRAND.inkGhost}` }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] font-bold uppercase" style={{ color: BRAND.blueSoft, letterSpacing: '0.14em' }}>
                Variant {i + 1}
              </div>
              <div className="text-[11px] tabular-nums" style={{ color: BRAND.inkFaint }}>
                {v.trim().split(/\s+/).filter(Boolean).length} words
              </div>
            </div>
            <textarea
              value={v}
              onChange={(e) => setVariant(i, e.target.value)}
              placeholder="Paste one answer here..."
              rows={3}
              className="w-full rounded-xl p-3 text-[13.5px] leading-[1.6] outline-none resize-y"
              style={{
                background: 'rgba(0,0,0,0.25)',
                border: `1px solid ${BRAND.inkGhost}`,
                color: BRAND.ink,
              }}
            />
          </div>
        ))}
      </div>

      {/* Results */}
      {analyzed && (
        <>
          {/* Signals table */}
          <div className="rounded-2xl p-5 mb-6" style={{ background: BRAND.surface2, border: `1px solid ${BRAND.inkGhost}` }}>
            <div className="text-[15px] font-semibold mb-4">Signals per variant</div>

            <div className="overflow-x-auto">
              <table className="w-full text-[12.5px]">
                <thead>
                  <tr>
                    <th className="text-left pb-2 pr-3" style={{ color: BRAND.inkFaint, fontWeight: 600 }}>Signal</th>
                    {variants.map((_, i) => (
                      <th key={i} className="text-center pb-2 px-2 tabular-nums" style={{ color: BRAND.inkFaint, fontWeight: 600 }}>
                        V{i + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SIGNAL_KEYS.map((k) => (
                    <tr key={k} style={{ borderTop: `1px solid ${BRAND.inkGhost}` }}>
                      <td className="py-2.5 pr-3" style={{ color: BRAND.inkDim }}>
                        {SIGNAL_LABELS[k]}
                      </td>
                      {results.map((r, i) => {
                        const v = r.signals[k];
                        const color = v >= 60 ? BRAND.emerald : v >= 35 ? BRAND.blue : 'rgba(255,255,255,0.3)';
                        return (
                          <td key={i} className="text-center py-2.5 px-2">
                            <span
                              className="inline-block min-w-[36px] rounded-md px-2 py-1 tabular-nums font-bold"
                              style={{ background: `${color}22`, color }}
                            >
                              {v}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Per-variant analysis */}
          <div className="grid gap-4 md:grid-cols-2">
            {results.map((r, i) => (
              <div
                key={i}
                className="rounded-2xl p-5"
                style={{ background: BRAND.surface2, border: `1px solid ${BRAND.inkGhost}` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[11px] font-bold uppercase" style={{ color: BRAND.blueSoft, letterSpacing: '0.14em' }}>
                    Variant {i + 1}
                  </div>
                  <div className="text-[11px] tabular-nums" style={{ color: BRAND.inkFaint }}>
                    {r.words} words
                  </div>
                </div>

                <div
                  className="rounded-lg px-3 py-2 mb-4 text-[13px] leading-[1.55] italic"
                  style={{ background: 'rgba(0,0,0,0.2)', color: BRAND.inkDim }}
                >
                  {r.text.length > 200 ? r.text.slice(0, 200) + '…' : r.text || '(empty)'}
                </div>

                <div className="mb-3">
                  <div className="text-[10.5px] font-bold uppercase mb-1" style={{ color: BRAND.inkFaint, letterSpacing: '0.12em' }}>
                    Thinker type
                  </div>
                  <div className="text-[15px] font-semibold" style={{ color: BRAND.blueBright }}>
                    {THINKER_INFO[r.type].label}
                  </div>
                  <div className="text-[12px] mt-1 leading-[1.6]" style={{ color: BRAND.inkDim }}>
                    {THINKER_INFO[r.type].blurb}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div
                    className="rounded-lg p-2.5"
                    style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)' }}
                  >
                    <div className="text-[9.5px] font-bold uppercase" style={{ color: BRAND.emerald, letterSpacing: '0.12em' }}>
                      Strength
                    </div>
                    <div className="text-[12px] mt-1 font-semibold">{SIGNAL_LABELS[r.strength]}</div>
                  </div>
                  <div
                    className="rounded-lg p-2.5"
                    style={{ background: 'rgba(123,141,255,0.08)', border: '1px solid rgba(123,141,255,0.25)' }}
                  >
                    <div className="text-[9.5px] font-bold uppercase" style={{ color: BRAND.blueBright, letterSpacing: '0.12em' }}>
                      Weakness
                    </div>
                    <div className="text-[12px] mt-1 font-semibold">{SIGNAL_LABELS[r.weakness]}</div>
                  </div>
                </div>

                <div className="text-[11.5px] leading-[1.6]" style={{ color: BRAND.inkFaint }}>
                  <span className="font-semibold" style={{ color: BRAND.inkDim }}>Habit they'd get: </span>
                  {HABITS[r.weakness].title}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
