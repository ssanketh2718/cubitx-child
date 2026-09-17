export interface AnalysisOption {
  em: string;
  label: string;
  correct: boolean;
  wrongHint?: string;
}

export interface LessonLine {
  bullet: string;
  text: string;
}

export interface Puzzle {
  id: string;
  kid: string;
  name: string;
  claim: string;
  question: string;
  tableTitle: string;
  tableHead: string[];
  tableRows: string[][];
  analysisQuestion: string;
  analysisOptions: AnalysisOption[];
  lessonIcon: string;
  lessonTitle: string;
  lessonLines: LessonLine[];
}

export const PUZZLES: Puzzle[] = [
  {
    id: 'lucky-shirt',
    kid: '👦',
    name: 'Kiran',
    claim: 'My green shirt makes my team win.',
    question: 'Is Kiran right?',
    tableTitle: "Kiran's Match Record",
    tableHead: ['Day', 'Green shirt?', 'Goalkeeper', 'Result'],
    tableRows: [
      ['Sat', 'yes', 'Ravi', 'win'],
      ['Sun', 'yes', 'Suresh', 'loss'],
      ['Mon', 'no', 'Ravi', 'win'],
      ['Tue', 'yes', 'Ravi', 'win'],
      ['Wed', 'no', 'Suresh', 'loss'],
      ['Thu', 'yes', 'Ravi', 'win'],
    ],
    analysisQuestion: 'What made the team win?',
    analysisOptions: [
      { em: '🎽', label: 'The green shirt', correct: false,
        wrongHint: "Look at the Green shirt column. It says Yes on Saturday and Sunday. But the team lost on Sunday. So the shirt doesn't match. Now look at the Goalkeeper column." },
      { em: '🧤', label: 'The goalkeeper', correct: true },
      { em: '🌤️', label: 'The weather', correct: false,
        wrongHint: "Weather is not in the table. Look at the Goalkeeper column." },
      { em: '🎲', label: 'Just luck', correct: false,
        wrongHint: "Look at the Goalkeeper column. Every win has Ravi. Every loss has Suresh." },
    ],
    lessonIcon: '🎯',
    lessonTitle: 'It was Ravi, not the shirt.',
    lessonLines: [
      { bullet: '✅', text: 'Ravi was goalkeeper in every win.' },
      { bullet: '❌', text: 'Suresh was goalkeeper in every loss.' },
      { bullet: '🎽', text: "The shirt was on in wins AND one loss. It didn't matter." },
    ],
  },
  {
    id: 'classroom-sneeze',
    kid: '👧',
    name: 'Meera',
    claim: 'When the teacher gets angry, we all sneeze.',
    question: 'Is Meera right?',
    tableTitle: 'Classroom Diary — 5 Days',
    tableHead: ['Day', 'Teacher mood', 'Truck came?', 'Sneezing?'],
    tableRows: [
      ['Mon', 'angry', 'yes', 'yes'],
      ['Tue', 'angry', 'no', 'no'],
      ['Wed', 'calm', 'yes', 'yes'],
      ['Thu', 'calm', 'no', 'no'],
      ['Fri', 'angry', 'yes', 'yes'],
    ],
    analysisQuestion: 'What made the kids sneeze?',
    analysisOptions: [
      { em: '😠', label: "The teacher's mood", correct: false,
        wrongHint: "Look at Tuesday. The teacher was angry but no one sneezed. Look at Wednesday. The teacher was calm but everyone sneezed. The mood doesn't match. Now look at the Truck column." },
      { em: '🤧', label: 'The sneezing', correct: false,
        wrongHint: "Sneezing is what happened. Not why it happened." },
      { em: '🚚', label: 'The dusty truck', correct: true },
      { em: '🎲', label: 'Just luck', correct: false,
        wrongHint: "The truck came on every sneezing day. It didn't come on the days no one sneezed. That is not luck." },
    ],
    lessonIcon: '🚚',
    lessonTitle: 'The truck caused both.',
    lessonLines: [
      { bullet: '🚚', text: 'Truck came → kids sneezed AND teacher got grumpy.' },
      { bullet: '🚫', text: 'No truck → no sneezing. Calm teacher.' },
      { bullet: '🎯', text: 'The dust from the truck caused both things.' },
    ],
  },
  {
    id: 'red-cap',
    kid: '👦',
    name: 'Ravi',
    claim: 'When I wear my red cap, it rains.',
    question: 'Is Ravi right?',
    tableTitle: "Ravi's Diary — 7 Days",
    tableHead: ['Day', 'Red cap?', 'Cloudy sky?', 'Rained?'],
    tableRows: [
      ['Mon', 'yes', 'yes', 'yes'],
      ['Tue', 'no', 'no', 'no'],
      ['Wed', 'no', 'yes', 'yes'],
      ['Thu', 'yes', 'no', 'no'],
      ['Fri', 'no', 'yes', 'yes'],
      ['Sat', 'yes', 'no', 'no'],
      ['Sun', 'yes', 'yes', 'yes'],
    ],
    analysisQuestion: 'What made it rain?',
    analysisOptions: [
      { em: '🧢', label: 'The red cap', correct: false,
        wrongHint: "Look at Thursday. Red cap on — but no rain. Look at Wednesday. No cap — but rain. The cap doesn't match. Now look at the Cloudy sky column." },
      { em: '☁️', label: 'The cloudy sky', correct: true },
      { em: '☀️', label: 'The sunshine', correct: false,
        wrongHint: "Sunshine is the opposite of cloudy. Look at the Cloudy sky column — every rainy day was cloudy." },
      { em: '🎲', label: 'Just luck', correct: false,
        wrongHint: "Look at the Cloudy sky column. Cloudy days → rain. Clear days → no rain. Every time. That is not luck." },
    ],
    lessonIcon: '☁️',
    lessonTitle: 'It was the clouds, not the cap.',
    lessonLines: [
      { bullet: '🧢', text: 'Cap on some rain days, cap off on others. Not the cause.' },
      { bullet: '☁️', text: 'Every cloudy day → rained.' },
      { bullet: '☀️', text: 'Every clear day → stayed dry.' },
    ],
  },
];

