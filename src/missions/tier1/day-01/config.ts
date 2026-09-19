// Tier 1 — Day 1 (Classes 5–7)

export default {
  tier: 1 as const,
  day: 1,
  label: 'Day 1 · Your Thinking Starts Here',
  items: [
    {
      engine: 'opinion' as const,
      question: "It's your mom's birthday. You saved your own money for weeks and bought her something you thought she'd love. Your younger sister whispers: \"She told me she doesn't want that.\" Your sister sometimes says things to get attention.",
      options: [
        { em: '🎁', label: 'Give the gift anyway', hint: 'Trust your own judgment' },
        { em: '🤔', label: 'Ask your sister why she said that', hint: 'Find out more first' },
        { em: '💬', label: 'Ask your mom what she wants', hint: 'Spoils the surprise' },
        { em: '⏸️', label: 'Wait and give it to her later', hint: 'You are not sure yet' },
      ],
    },
    {
      engine: 'math' as const,
      title: 'The Doubling Machine',
      description: 'A machine takes any number you give it. It gives back a new number. Test it a few times, then figure out its rule.',
      tests: [
        { in: 1, out: 2 },
        { in: 2, out: 4 },
        { in: 3, out: 6 },
        { in: 4, out: 8 },
        { in: 5, out: 10 },
        { in: 6, out: 12 },
        { in: 7, out: 14 },
        { in: 8, out: 16 },
        { in: 9, out: 18 },
      ],
      ruleOptions: [
        'Add 3 to the number',
        'Multiply the number by 3',
        'Double the number (multiply by 2)',
        'Add 4 to the number',
      ],
      answerIdx: 2,
      explanation: 'Every output is exactly twice the input. 1 → 2, 3 → 6, 5 → 10. So the rule is: double the number.',
    },
    {
      engine: 'creative' as const,
      prompt: 'Describe the best day you have had this month.',
      hint: 'What happened? Why was it the best? Use at least 20 words.',
    },
    {
      engine: 'opinion' as const,
      question: 'Your best friend asks to copy your homework. You worked hard on yours. They say they will get in trouble if they do not submit it.',
      options: [
        { em: '📝', label: 'Let them copy it', hint: 'They are your friend' },
        { em: '🙅', label: 'Say no and explain why', hint: 'Honesty matters' },
        { em: '🤝', label: 'Help them understand the work instead', hint: 'Teach, do not give' },
      ],
    },
  ],
};
