// src/core/analytics/profile.ts
import type { SavedResponse } from '../store';
import { extractSignals, EMPTY_SIGNALS, type Signals } from './signals';

export type SignalKey = keyof Signals;

export const SIGNAL_LABELS: Record<SignalKey, string> = {
  groundedness: 'Grounding in specifics',
  alternatives: 'Considering alternatives',
  revision: 'Openness to revising',
  calibration: 'Balancing certainty',
  reasoningChain: 'Chaining reasoning',
  expression: 'Putting it into words',
};

export const SIGNAL_DESCRIPTIONS: Record<SignalKey, string> = {
  groundedness: 'Ties ideas to concrete details, examples, or facts',
  alternatives: 'Considers more than one possibility',
  revision: 'Willing to change their mind given new evidence',
  calibration: 'Uses "maybe" / "probably" appropriately — not "always" / "never"',
  reasoningChain: 'Connects claim to evidence to conclusion',
  expression: 'Explains their thinking in clear sentences',
};

export type ThinkerType =
  | 'investigator'
  | 'weigher'
  | 'observer'
  | 'intuitor'
  | 'articulator'
  | 'developing';

export const THINKER_INFO: Record<
  ThinkerType,
  { label: string; blurb: string }
> = {
  investigator: {
    label: 'The Investigator',
    blurb:
      'Tests ideas, looks for evidence, and changes their mind when reality disagrees. A habit most adults have to relearn.',
  },
  weigher: {
    label: 'The Weigher',
    blurb:
      'Considers more than one possibility before deciding. Careful, thoughtful — sometimes needs a nudge to commit.',
  },
  observer: {
    label: 'The Observer',
    blurb:
      'Notices details others miss and grounds their answers in what they actually see. Strong on facts, developing on alternatives.',
  },
  intuitor: {
    label: 'The Intuitor',
    blurb:
      'Fast, confident, decisive. Moves quickly — the next step is slowing down enough to check whether the first idea is right.',
  },
  articulator: {
    label: 'The Articulator',
    blurb:
      'Explains their thinking clearly. The next step is grounding those words in evidence and reasons.',
  },
  developing: {
    label: 'Developing',
    blurb:
      "Still gathering enough answers to see the pattern. Keep going — the picture sharpens over the next week.",
  },
};

export interface ThinkingProfile {
  weekCount: number;
  lastWeekCount: number;
  signals: Signals;
  lastWeekSignals: Signals;
  trend: Signals;
  type: ThinkerType;
  strength: SignalKey;
  weakness: SignalKey;
}

function daysAgo(iso: string): number {
  const then = new Date(iso);
  then.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.floor((now.getTime() - then.getTime()) / 86400000);
}

function avgSignals(list: SavedResponse[]): Signals {
  if (list.length === 0) return { ...EMPTY_SIGNALS };
  const sums: Signals = { ...EMPTY_SIGNALS };
  for (const r of list) {
    const s = extractSignals(r.text ?? '');
    for (const k of Object.keys(sums) as SignalKey[]) sums[k] += s[k];
  }
  for (const k of Object.keys(sums) as SignalKey[]) {
    sums[k] = Math.round(sums[k] / list.length);
  }
  return sums;
}

function classify(s: Signals, count: number): ThinkerType {
  if (count < 3) return 'developing';
  if (s.revision >= 55 && s.reasoningChain >= 55) return 'investigator';
  if (s.alternatives >= 55 && s.calibration >= 55) return 'weigher';
  if (s.groundedness >= 60 && s.alternatives < 40) return 'observer';
  if (s.calibration < 40 && s.alternatives < 40) return 'intuitor';
  if (s.expression >= 60 && s.reasoningChain < 40) return 'articulator';
  return 'developing';
}

export function computeProfile(
  responses: Record<string, SavedResponse>
): ThinkingProfile {
  const all = Object.values(responses);
  const thisWeek = all.filter((r) => daysAgo(r.submittedAt) <= 6);
  const last = all.filter((r) => {
    const d = daysAgo(r.submittedAt);
    return d >= 7 && d <= 13;
  });

  const signals = avgSignals(thisWeek);
  const lastWeekSignals = avgSignals(last);

  const trend: Signals = { ...EMPTY_SIGNALS };
  for (const k of Object.keys(trend) as SignalKey[]) {
    trend[k] = signals[k] - lastWeekSignals[k];
  }

  let strength: SignalKey = 'reasoningChain';
  let weakness: SignalKey = 'revision';
  let maxVal = -1;
  let minVal = 101;
  for (const k of Object.keys(signals) as SignalKey[]) {
    if (signals[k] > maxVal) {
      maxVal = signals[k];
      strength = k;
    }
    if (signals[k] < minVal) {
      minVal = signals[k];
      weakness = k;
    }
  }

  return {
    weekCount: thisWeek.length,
    lastWeekCount: last.length,
    signals,
    lastWeekSignals,
    trend,
    type: classify(signals, thisWeek.length),
    strength,
    weakness,
  };
}

