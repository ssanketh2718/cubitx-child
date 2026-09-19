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
    {
      engine: 'watch' as const,
      title: 'Watch: Why do we ask questions?',
      video: 'https://www.youtube.com/watch?v=KwGmG9wLIeg',
      reflect: 'In your own words — why do you think asking good questions is more useful than knowing all the answers?',
    },
  ],
};