// src/core/analytics/signals.ts

export interface Signals {
  groundedness: number;
  alternatives: number;
  revision: number;
  calibration: number;
  reasoningChain: number;
  expression: number;
}

export const EMPTY_SIGNALS: Signals = {
  groundedness: 0,
  alternatives: 0,
  revision: 0,
  calibration: 0,
  reasoningChain: 0,
  expression: 0,
};

const RE_ALT =
  /\b(or|maybe|perhaps|might|could|alternatively|instead|another|other|either|on the other hand|what if)\b/gi;
const RE_REV =
  /\b(if|then|unless|would change|might change|would reconsider|depends|i'd change|i would change)\b/gi;
const RE_HEDGE =
  /\b(maybe|perhaps|probably|might|could|i think|seems|sort of|kind of|possibly)\b/gi;
const RE_ABS =
  /\b(always|never|definitely|obviously|everyone|no one|nobody|of course|certainly|without a doubt)\b/gi;
const RE_CAUSE =
  /\b(because|since|so|therefore|as a result|which means|that's why|thats why|hence|thus)\b/gi;
const RE_SPECIFIC =
  /\b(\d+|first|second|third|yesterday|today|tomorrow|morning|evening|monday|tuesday|wednesday|thursday|friday|saturday|sunday|my (mom|dad|mother|father|sister|brother|friend|teacher|class))\b/gi;
const RE_VAGUE =
  /\b(stuff|things?|something|anything|whatever|somehow|somewhere)\b/gi;

function count(text: string, re: RegExp): number {
  const m = text.match(re);
  return m ? m.length : 0;
}

function words(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function sentences(text: string): number {
  return Math.max(1, (text.match(/[.!?]+/g) || []).length);
}

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(n)));
}

export function extractSignals(text: string): Signals {
  if (!text || text.trim().length < 5) return { ...EMPTY_SIGNALS };

  const t = text.toLowerCase();
  const w = words(text);
  const s = sentences(text);

  const alts = count(t, RE_ALT);
  const rev = count(t, RE_REV);
  const hedge = count(t, RE_HEDGE);
  const abs = count(t, RE_ABS);
  const cause = count(t, RE_CAUSE);
  const spec = count(t, RE_SPECIFIC);
  const vague = count(t, RE_VAGUE);

  const groundedness = clamp(
    (spec + 1) / (spec + 1 + vague + 1) * 60 + Math.min(spec * 8, 40)
  );
  const alternatives = clamp(alts * 18);
  const revision = clamp(rev * 22);
  const calibration = clamp(50 + (hedge - abs) * 15);
  const reasoningChain = clamp(cause * 20);

  const lengthScore =
    w < 5 ? w * 8 : w < 30 ? 60 + (w - 5) : Math.max(30, 100 - (w - 30) / 2);
  const sentenceDiversity = s >= 2 ? 15 : 0;
  const expression = clamp(lengthScore + sentenceDiversity);

  return {
    groundedness,
    alternatives,
    revision,
    calibration,
    reasoningChain,
    expression,
  };
}
