// Tier 1 — Day 2 (Classes 5–7)

export default {
  tier: 1 as const,
  day: 2,
  label: 'Day 2 · Noticing the World',
  items: [
    {
      engine: 'math' as const,
      title: 'The +5 Machine',
      description: 'A machine takes a number and gives back a new one. Test it a few times, then figure out its rule.',
      tests: [
        { in: 1, out: 6 },
        { in: 2, out: 7 },
        { in: 3, out: 8 },
        { in: 4, out: 9 },
        { in: 5, out: 10 },
        { in: 6, out: 11 },
        { in: 7, out: 12 },
        { in: 8, out: 13 },
        { in: 9, out: 14 },
      ],
      ruleOptions: [
        'Add 6 to the number',
        'Add 5 to the number',
        'Multiply the number by 5',
        'Add 4 to the number',
      ],
      answerIdx: 1,
      explanation: 'Every output is exactly 5 more than the input. 1 → 6, 3 → 8, 5 → 10. So the rule is: add 5.',
    },
    {
      engine: 'opinion' as const,
      question: 'You find a ₹100 note on the playground. Nobody saw you pick it up. What do you do?',
      options: [
        { em: '🤷', label: 'Keep it — finders keepers', hint: 'Nobody will know' },
        { em: '👩‍🏫', label: 'Give it to a teacher', hint: 'They can find the owner' },
        { em: '📣', label: 'Ask around who lost it', hint: 'Ask your classmates' },
      ],
    },
    {
      engine: 'creative' as const,
      prompt: 'Describe a time you helped someone without being asked.',
      hint: 'What happened? How did it feel? Use at least 20 words.',
    },
    {
      engine: 'opinion' as const,
      question: 'A new student joins your class and sits alone at lunch every day. What do you do?',
      options: [
        { em: '🙋', label: 'Go sit with them', hint: 'Make them feel welcome' },
        { em: '🤔', label: 'Wait and see if they make friends', hint: 'Maybe they prefer being alone' },
        { em: '👥', label: 'Ask your friends to join them together', hint: 'Involve your group' },
      ],
    },
  ],
};
