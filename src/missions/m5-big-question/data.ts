export interface OpenQuestion {
  id: string;
  scenario: string;
  scenarioEmoji: string;
  options: { em: string; label: string; hint: string }[];
  ask: string;
  placeholder: string;
  prompt: string;
}

export const QUESTIONS: OpenQuestion[] = [
  {
    id: 'q1-village-water',
    scenarioEmoji: '🌾',
    scenario: "Ravi's village is running out of water. He can only do ONE thing this year.",
    options: [
      { em: '💧', label: 'Dig a deeper well', hint: 'So the farm has water for the crops' },
      { em: '🏪', label: 'Sell at the market', hint: 'Instead of giving crops to a middleman' },
      { em: '🏛️', label: 'Ask the government', hint: 'For money to buy better seeds' },
    ],
    ask: 'Which ONE should Ravi try first? And why?',
    placeholder: 'I think Ravi should... because...',
    prompt: 'Ravi can dig a well, sell at market, or ask government for money. Which first and why?',
  },
  {
    id: 'q2-school-broken',
    scenarioEmoji: '🏫',
    scenario: "Aarav's school has one broken thing. They have money to fix only ONE this year.",
    options: [
      { em: '🚰', label: 'Fix the water tap', hint: 'So kids can wash hands before eating' },
      { em: '📚', label: 'Buy new books', hint: 'For the library, so everyone can read more' },
      { em: '🪑', label: 'Fix the benches', hint: "So kids don't sit on the floor" },
    ],
    ask: 'Which ONE should the school fix first? And why?',
    placeholder: 'The school should fix... because...',
    prompt: 'School can fix water, buy books, or fix benches. Which first and why?',
  },
  {
    id: 'q3-bus-route',
    scenarioEmoji: '🚌',
    scenario: 'The village bus only has one route. It can go one place.',
    options: [
      { em: '🏥', label: 'To the hospital', hint: 'For emergencies, once a day' },
      { em: '🏫', label: 'To the school', hint: "So kids don't walk 5 km" },
      { em: '🏪', label: 'To the market', hint: 'So farmers can sell on time' },
    ],
    ask: 'Where should the bus go first? And why?',
    placeholder: 'The bus should go to... because...',
    prompt: 'Bus can go to hospital, school, or market. Which first and why?',
  },
  {
    id: 'q4-phone-lost',
    scenarioEmoji: '📱',
    scenario: 'Meera found a phone on the playground. She can do only ONE thing.',
    options: [
      { em: '👮', label: 'Give it to the teacher', hint: 'The teacher can find the owner' },
      { em: '📞', label: 'Call the last number', hint: 'To find who it belongs to' },
      { em: '🎒', label: 'Keep it in her bag', hint: "So it's safe until someone asks" },
    ],
    ask: 'What should Meera do first? And why?',
    placeholder: 'Meera should... because...',
    prompt: 'Meera found a phone. Give to teacher, call last number, or keep it. Which first and why?',
  },
  {
    id: 'q5-cricket-team',
    scenarioEmoji: '🏏',
    scenario: 'A cricket team has one change to make before the big match.',
    options: [
      { em: '💪', label: 'Practise more', hint: 'Two extra hours every day this week' },
      { em: '🆕', label: 'Bring a new player', hint: 'From another school who is very good' },
      { em: '🎯', label: 'Change the batting order', hint: 'So the best player goes earlier' },
    ],
    ask: 'What should the team do first? And why?',
    placeholder: 'The team should... because...',
    prompt: 'Team can practise more, bring new player, or change order. Which first and why?',
  },
];
