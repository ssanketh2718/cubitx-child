// Tier 1 — Day 5 (Classes 5–7)

export default {
  tier: 1 as const,
  day: 5,
  label: 'Day 5 · Rules and Fairness',
  items: [
    {
      engine: 'opinion' as const,
      question: 'You could win a game by breaking a small rule that nobody would notice. What do you do?',
      options: [
        { em: '🎮', label: 'Break the rule and win', hint: 'Nobody will know' },
        { em: '✅', label: 'Follow the rule and lose honestly', hint: 'The win would feel empty anyway' },
        { em: '🤔', label: 'Ask why the rule exists', hint: 'Maybe it is not fair' },
      ],
    },
    {
      engine: 'math' as const,
      title: 'The ×4 Machine',
      description: 'One more number machine. Test it and figure out what it does.',
      tests: [
        { in: 1, out: 4 },
        { in: 2, out: 8 },
        { in: 3, out: 12 },
        { in: 4, out: 16 },
        { in: 5, out: 20 },
        { in: 6, out: 24 },
        { in: 7, out: 28 },
        { in: 8, out: 32 },
        { in: 9, out: 36 },
      ],
      ruleOptions: [
        'Add 4 to the number',
        'Multiply by 5',
        'Multiply by 4',
        'Add 12 to the number',
      ],
      answerIdx: 2,
      explanation: 'Every output is 4 times the input. 2 → 8, 3 → 12, 5 → 20. So the rule is: multiply by 4.',
    },
    {
      engine: 'creative' as const,
      prompt: 'What does it mean to be a good friend? Give an example from your own life.',
      hint: 'Think of something a friend did for you. Use at least 20 words.',
    },
    {
      engine: 'opinion' as const,
      question: 'You see your older sibling doing something your parents would be upset about. What do you do?',
      options: [
        { em: '🤐', label: 'Say nothing — it is not your business', hint: 'Stay out of it' },
        { em: '💬', label: 'Talk to your sibling first', hint: 'Give them a chance to fix it' },
        { em: '👨‍👩‍👧', label: 'Tell your parents', hint: 'They should know' },
      ],
    },
  ],
};
