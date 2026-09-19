// Tier 1 — Day 3 (Classes 5–7)

export default {
  tier: 1 as const,
  day: 3,
  label: 'Day 3 · Tricky Choices',
  items: [
    {
      engine: 'opinion' as const,
      question: 'You promised a friend you would keep a secret. But the secret is making you worried about them. What do you do?',
      options: [
        { em: '🤐', label: 'Keep the secret — you promised', hint: 'A promise is a promise' },
        { em: '🗣️', label: 'Tell a trusted adult', hint: 'Their safety may matter more' },
        { em: '💬', label: 'Ask your friend if you can tell someone', hint: 'Let them decide with you' },
      ],
    },
    {
      engine: 'math' as const,
      title: 'Number Machine',
      description: 'Another machine. A different rule from before. Test it and work out what it is doing.',
      tests: [
        { in: 1, out: 3 },
        { in: 2, out: 6 },
        { in: 3, out: 9 },
        { in: 4, out: 12 },
        { in: 5, out: 15 },
        { in: 6, out: 18 },
        { in: 7, out: 21 },
        { in: 8, out: 24 },
        { in: 9, out: 27 },
      ],
      ruleOptions: [
        'Add 3 to the number',
        'Multiply the number by 2',
        'Multiply the number by 3',
        'Add 9 to the number',
      ],
      answerIdx: 2,
      explanation: 'Every output is 3 times the input. 1 → 3, 2 → 6, 4 → 12. So the rule is: multiply by 3.',
    },
    {
      engine: 'creative' as const,
      prompt: 'If you could fix one thing about the world, what would it be? And why does it matter to you?',
      hint: 'It can be big or small. Use at least 20 words.',
    },
    {
      engine: 'opinion' as const,
      question: 'Your teacher gives your group a project. One person is not doing anything. You and the others are doing all the work. What do you do?',
      options: [
        { em: '📢', label: 'Tell the teacher', hint: 'It is not fair to the others' },
        { em: '💬', label: 'Talk to them first', hint: 'Maybe something is wrong' },
        { em: '🙂', label: 'Just do the work yourself', hint: 'Keep the peace, finish the project' },
      ],
    },
  ],
};
