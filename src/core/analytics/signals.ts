// src/core/analytics/signals.ts

export type DimensionKey =
  | 'noticing'
  | 'reasoning'
  | 'openMindedness'
  | 'revising'
  | 'curiosity';

export type Level = 0 | 1 | 2;

export const DIMENSIONS: Record<
  DimensionKey,
  { plain: string; description: string }
> = {
  noticing: {
    plain: 'Noticing details',
    description: 'Spots what is actually there before deciding',
  },
  reasoning: {
    plain: 'Giving reasons',
    description: 'Explains why, not just what',
  },
  openMindedness: {
    plain: 'Considering other ideas',
    description: 'Thinks about more than one possibility',
  },
  revising: {
    plain: 'Changing their mind',
    description: 'Updates their thinking when new information appears',
  },
  curiosity: {
    plain: 'Asking good questions',
    description: 'Pushes back, asks for evidence, questions assumptions',
  },
};

export const LEVEL_LABELS: Record<Level, string> = {
  0: 'Just starting',
  1: 'Getting there',
  2: 'A real strength',
};

export const LEVEL_ICONS: Record<Level, string> = {
  0: '🌱',
  1: '🌿',
  2: '🌳',
};

export interface BehaviouralSignals {
  testsBeforeGuess?: number;
  wentBackToTest?: boolean;
  secondsOnItem?: number;
}

export interface AnswerFlags {
  noticing: boolean;
  reasoning: boolean;
  openMindedness: boolean;
  revising: boolean;
  curiosity: boolean;
  hasText: boolean;
}

const EMPTY_FLAGS: AnswerFlags = {
  noticing: false,
  reasoning: false,
  openMindedness: false,
  revising: false,
  curiosity: false,
  hasText: false,
};

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function extractFlags(
  text: string,
  behaviours?: BehaviouralSignals
): AnswerFlags {
  const hasText = !!(text && text.trim().length >= 5);
  const flags: AnswerFlags = { ...EMPTY_FLAGS, hasText };

  // Behavioural — from math missions. These count even without text.
  if (behaviours) {
    if (
      typeof behaviours.testsBeforeGuess === 'number' &&
      behaviours.testsBeforeGuess >= 3
    ) {
      flags.reasoning = true;
    }
    if (behaviours.wentBackToTest) {
      flags.revising = true;
    }
  }

  if (!hasText) return flags;

  const t = text.toLowerCase();
  const wc = countWords(text);
  const reasonRe =
    /\b(because|since|so|that is why|thats why|which means|reason)\b|कारण|क्योंकि|म्हणून|तो/;
  const counterRe =
    /\b(but|however|though|although|on the other hand|yet|even though)\b|पण|लेकिन|पर/;
  const hedgeRe =
    /\b(maybe|perhaps|probably|might|could|i think|seems|possibly|not sure|guess)\b|कदाचित|शायद/;
  const questionRe = /\?|what if|why do|how come|what makes|what about/;
  const exampleRe =
    /\b(for example|like when|one time|once|such as|for instance|yesterday|today|last week)\b|उदाहरणार्थ|जैसे/;
  const ifRe = /\bif\b|\bthen\b/;

  // NOTICING — mentions a specific detail, example, or uses ≥15 words
  if (exampleRe.test(t) || wc >= 15) flags.noticing = true;

  // REASONING — gives a reason
  if (reasonRe.test(t)) flags.reasoning = true;

  // OPEN-MINDEDNESS — considers another possibility
  if (counterRe.test(t) || hedgeRe.test(t)) flags.openMindedness = true;

  // REVISING — shows they'd change their mind given new information
  if (ifRe.test(t) && (reasonRe.test(t) || counterRe.test(t))) {
    flags.revising = true;
  }

  // CURIOSITY — asks a question or pushes back
  if (questionRe.test(t)) flags.curiosity = true;

  return flags;
}

/**
 * Given an array of answer flags for a week, decide whether that week
 * counts toward each dimension. Rule: at least 2 answers showing the habit.
 */
export function dimensionCountsForWeek(
  flags: AnswerFlags[]
): Record<DimensionKey, boolean> {
  const count = (key: DimensionKey) => flags.filter((f) => f[key]).length;
  return {
    noticing: count('noticing') >= 2,
    reasoning: count('reasoning') >= 2,
    openMindedness: count('openMindedness') >= 2,
    revising: count('revising') >= 2,
    curiosity: count('curiosity') >= 2,
  };
}

export function levelFromPct(pct: number): Level {
  if (pct >= 65) return 2;
  if (pct >= 30) return 1;
  return 0;
}
