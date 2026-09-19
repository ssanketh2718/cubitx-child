// Tier 1 — Day 4 (Classes 5–7)

export default {
  tier: 1 as const,
  day: 4,
  label: 'Day 4 · Thinking About Yourself',
  items: [
    {
      engine: 'math' as const,
      title: 'Number Machine',
      description: 'This machine behaves differently from the others. Test it, then work out its rule.',
      tests: [
        { in: 5, out: 1 },
        { in: 6, out: 2 },
        { in: 7, out: 3 },
        { in: 8, out: 4 },
        { in: 9, out: 5 },
        { in: 10, out: 6 },
        { in: 11, out: 7 },
        { in: 12, out: 8 },
        { in: 13, out: 9 },
      ],
      ruleOptions: [
        'Subtract 5 from the number',
        'Subtract 4 from the number',
        'Divide the number by 4',
        'Add 4 to the number',
      ],
      answerIdx: 1,
      explanation: 'Every output is 4 less than the input. 5 → 1, 7 → 3, 10 → 6. So the rule is: subtract 4.',
    },
    {
      engine: 'opinion' as const,
      question: 'You did something wrong. Nobody saw you do it. What do you do?',
      options: [
        { em: '🤐', label: 'Say nothing — nobody knows', hint: 'The moment has passed' },
        { em: '🙋', label: 'Own up and say sorry', hint: 'Honesty is hard but right' },
        { em: '🤔', label: 'Think about it for a day', hint: 'Give yourself time' },
      ],
    },
    {
      engine: 'creative' as const,
      prompt: 'Describe a place you love. Use at least three of your five senses.',
      hint: 'What does it look like, sound like, smell like? Use at least 20 words.',
    },
    {
      engine: 'opinion' as const,
      question: 'A classmate speaks very little English. Others laugh when they speak. What do you do?',
      options: [
        { em: '🤝', label: 'Sit with them and help', hint: 'Make it easier for them' },
        { em: '🛑', label: 'Tell the others to stop', hint: 'Say something in the moment' },
        { em: '👩‍🏫', label: 'Tell a teacher privately', hint: 'Let an adult handle it' },
      ],
    },
  ],
};