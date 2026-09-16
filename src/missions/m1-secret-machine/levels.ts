export interface Level {
  rule: (n: number) => number;
  desc: string;
  hint: string;
  range: [number, number];
  idealTests: number;
}

export const LEVELS: Level[] = [
  {
    rule: (n) => n + 2,
    desc: 'I add 2 to whatever you give me.',
    hint: 'Try 4 and 5 — look how much the answer changes.',
    range: [1, 60],
    idealTests: 3,
  },
  {
    rule: (n) => n * 2 + 1,
    desc: 'I double your number, then add 1.',
    hint: 'Try 1, 2, 3. Is the jump always the same?',
    range: [1, 40],
    idealTests: 4,
  },
  {
    rule: (n) => (n % 2 === 0 ? n / 2 : n + 3),
    desc: 'Even → halve. Odd → add 3.',
    hint: 'Try one even and one odd number.',
    range: [1, 40],
    idealTests: 5,
  },
  {
    rule: (n) => parseInt(String(n).split('').reverse().join(''), 10) + 1,
    desc: 'Flip the digits, then add 1.',
    hint: 'Try 12. Now try 21. Watch the digits.',
    range: [10, 99],
    idealTests: 6,
  },
];
