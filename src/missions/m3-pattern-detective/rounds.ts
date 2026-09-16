export const NP = 'NONE';

export interface Round {
  seq: string[];
  next: string | null;
  isPattern: boolean;
  why: string;
}

export const ROUNDS: Round[] = [
  {
    seq: ['🔴', '🔵', '🔴', '🔵', '🔴', '🔵', '🔴'],
    next: '🔵',
    isPattern: true,
    why: 'Red, blue — repeating. Next is blue.',
  },
  {
    seq: ['🟡', '🔴', '🔴', '🟢', '🔴', '🟡', '🔴', '🟢'],
    next: null,
    isPattern: false,
    why: 'No repeating rule. This one is random.',
  },
  {
    seq: ['🔴', '🔵', '🟢', '🔴', '🔵', '🟢', '🔴', '🔵'],
    next: '🟢',
    isPattern: true,
    why: 'Red, blue, green — repeating. After blue comes green.',
  },
  {
    seq: ['🟣', '🟠', '🟠', '🟣', '🟠', '🟣', '🟠', '🟣'],
    next: null,
    isPattern: false,
    why: 'No repeating cycle. Random.',
  },
  {
    seq: ['🔴', '🔴', '🔵', '🔴', '🔴', '🔵', '🔴', '🔴'],
    next: '🔵',
    isPattern: true,
    why: 'Two reds, one blue — repeating. Next is blue.',
  },
  {
    seq: ['🟢', '🔴', '🟡', '🟡', '🔴', '🟢', '🟡', '🔴'],
    next: null,
    isPattern: false,
    why: 'No repeating rule. Random.',
  },
  {
    seq: ['🟠', '🟣', '🟠', '🟣', '🟠', '🟣', '🟠'],
    next: '🟣',
    isPattern: true,
    why: 'Orange, purple — repeating. Next is purple.',
  },
  {
    seq: ['🟠', '🔴', '🟢', '🔴', '🟠', '🟢', '🔴', '🟢'],
    next: null,
    isPattern: false,
    why: 'No repeating rule. Random.',
  },
];

export function buildOptions(r: Round): string[] {
  let opts: string[];
  if (r.isPattern) {
    const others = ['🔴', '🔵', '🟢', '🟡', '🟣', '🟠']
      .filter((c) => c !== r.next)
      .slice(0, 2);
    opts = [r.next as string, ...others, NP];
  } else {
    opts = [r.seq[0], r.seq[1], r.seq[2], NP];
  }
  const uniq = [...new Set(opts)];
  for (let i = uniq.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [uniq[i], uniq[j]] = [uniq[j], uniq[i]];
  }
  return uniq;
}
