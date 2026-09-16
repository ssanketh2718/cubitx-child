export interface ScaleSide {
  left: string[];
  right: string[];
}

export interface Round {
  givens: ScaleSide[];
  q: string;
  opts: (string | { em: string; lbl: string })[];
  correct: number;
  why: string;
  isNull: boolean;
}

export const SAME = { em: '⚖️', lbl: 'SAME' };

export const ROUNDS: Round[] = [
  {
    givens: [{ left: ['🔴'], right: ['🔵'] }],
    q: 'Which is HEAVIEST?',
    opts: ['🔴', '🔵', SAME],
    correct: 2,
    why: 'They weigh the SAME — the scale is level!',
    isNull: true,
  },
  {
    givens: [{ left: ['⭐', '⭐'], right: ['🔵'] }],
    q: 'Which is HEAVIEST?',
    opts: ['⭐', '🔵', SAME],
    correct: 1,
    why: '2 stars balance 1 blue. Blue is HEAVIER.',
    isNull: false,
  },
  {
    givens: [
      { left: ['🟪'], right: ['🟦'] },
      { left: ['🟦'], right: ['🟩'] },
    ],
    q: 'Which is HEAVIEST?',
    opts: ['🟪', '🟦', '🟩', SAME],
    correct: 3,
    why: '🟪 = 🟦 and 🟦 = 🟩. All three weigh the SAME.',
    isNull: true,
  },
  {
    givens: [{ left: ['🍎'], right: ['🍊', '🍊'] }],
    q: 'Which is HEAVIEST?',
    opts: ['🍎', '🍊', SAME],
    correct: 0,
    why: '1 apple balances 2 oranges. Apple is HEAVIER.',
    isNull: false,
  },
  {
    givens: [
      { left: ['🔺', '🔺'], right: ['🔵'] },
      { left: ['🔵'], right: ['⬜', '⬜', '⬜'] },
    ],
    q: 'Which is LIGHTEST?',
    opts: ['🔺', '🔵', '⬜', SAME],
    correct: 2,
    why: '1 blue = 2 triangles. 1 blue = 3 whites. White is LIGHTEST.',
    isNull: false,
  },
  {
    givens: [
      { left: ['🐘'], right: ['🐴', '🐴', '🐴'] },
      { left: ['🐴'], right: ['🐶', '🐶'] },
    ],
    q: 'Which is HEAVIEST?',
    opts: ['🐘', '🐴', '🐶', SAME],
    correct: 0,
    why: '1 elephant = 3 horses. Elephant is HEAVIEST.',
    isNull: false,
  },
  {
    givens: [
      { left: ['🐱'], right: ['🐭', '🐭', '🐭', '🐭'] },
      { left: ['🐭'], right: ['🍇', '🍇'] },
    ],
    q: 'Which is LIGHTEST?',
    opts: ['🐱', '🐭', '🍇', SAME],
    correct: 2,
    why: '1 mouse = 2 grapes. Grapes are LIGHTEST.',
    isNull: false,
  },
  {
    givens: [
      { left: ['🍎', '🍎'], right: ['🍊', '🍊', '🍊'] },
      { left: ['🍊'], right: ['🍇', '🍇'] },
    ],
    q: 'Which is HEAVIEST?',
    opts: ['🍎', '🍊', '🍇', SAME],
    correct: 0,
    why: '2 apples = 3 oranges. Apple is HEAVIEST.',
    isNull: false,
  },
];
