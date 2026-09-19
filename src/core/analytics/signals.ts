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

export interface ResponseSignals {
  noticing: number;
  reasoning: number;
  openMindedness: number;
  revising: number;
  curiosity: number;
  hasText: boolean;
}

const EMPTY: ResponseSignals = {
  noticing: 0,
  reasoning: 0,
  openMindedness: 0,
  revising: 0,
  curiosity: 0,
  hasText: false,
};

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function countSentences(text: string): number {
  return Math.max(1, (text.match(/[.!?]+/g) || []).length);
}

function analyseStructure(text: string) {
  const t = text.toLowerCase();
  const wc = countWords(text);
  const sc = countSentences(text);

  const reasonRe =
    /\b(because|since|so|that is why|thats why|which means|reason)\b|कारण|क्योंकि|म्हणून|तो/;
  const counterRe =
    /\b(but|however|though|although|on the other hand|yet|even though)\b|पण|लेकिन|पर/;
  const hedgeRe =
    /\b(maybe|perhaps|probably|might|could|i think|seems|possibly|not sure|guess)\b|कदाचित|शायद/;
  const absRe =
    /\b(always|never|definitely|obviously|everyone|nobody|certainly|for sure)\b|नेहमी|कधीच|हमेशा/;
  const questionRe = /\?|what if|why do|how come|what makes|what about/;
  const exampleRe =
    /\b(for example|like when|one time|once|such as|for instance)\b|उदाहरणार्थ|जैसे/;

  return {
    hasReason: reasonRe.test(t),
    hasCounter: counterRe.test(t),
    hasHedge: hedgeRe.test(t),
    hasAbsolute: absRe.test(t),
    hasQuestion: questionRe.test(t),
    hasExample: exampleRe.test(t),
    hasIf: /\bif\b/.test(t),
    wordCount: wc,
    sentenceCount: sc,
  };
}

export function extractResponseSignals(
  text: string,
  behaviours?: BehaviouralSignals
): ResponseSignals {
  const hasText = !!(text && text.trim().length >= 3);
  const out: ResponseSignals = { ...EMPTY, hasText };

  if (behaviours) {
    if (typeof behaviours.testsBeforeGuess === 'number') {
      if (behaviours.testsBeforeGuess >= 5) out.reasoning += 30;
      else if (behaviours.testsBeforeGuess >= 3) out.reasoning += 20;
      else if (behaviours.testsBeforeGuess >= 1) out.reasoning += 10;
    }
    if (behaviours.wentBackToTest) out.revising += 40;
    if (
      typeof behaviours.secondsOnItem === 'number' &&
      behaviours.secondsOnItem > 60
    ) {
      out.curiosity += 15;
    }
  }

  if (!hasText) return out;

  const s = analyseStructure(text);

  if (s.hasExample) out.noticing += 30;
  if (s.wordCount >= 20) out.noticing += 15;
  if (s.wordCount >= 40) out.noticing += 15;

  if (s.hasReason) out.reasoning += 30;
  if (s.hasReason && s.wordCount >= 15) out.reasoning += 15;
  if (s.hasReason && s.hasExample) out.reasoning += 15;
  if (s.sentenceCount >= 2) out.reasoning += 10;

  if (s.hasCounter) out.openMindedness += 35;
  if (s.hasHedge) out.openMindedness += 25;
  if (s.hasCounter && s.hasHedge) out.openMindedness += 15;
  if (s.hasAbsolute && !s.hasHedge)
    out.openMindedness = Math.max(0, out.openMindedness - 15);

  if (s.hasIf && (s.hasReason || s.hasCounter)) out.revising += 30;
  if (s.hasCounter) out.revising += 15;

  if (s.hasQuestion) out.curiosity += 35;
  if (s.hasReason && s.hasCounter) out.curiosity += 15;

  return out;
}

export function levelFromScore(score: number): Level {
  if (score >= 45) return 2;
  if (score >= 18) return 1;
  return 0;
}
