import type { DayConfig, MissionStageSpec } from '../../../core/sdk/types';

export const FREE_MISSIONS_PER_DAY = 2;

const day02Missions: MissionStageSpec[] = [
  {
    id: 'd2-m1',
    title: 'The Two Plant Pots',
    phenomenonTag: 'fair-comparison',
    difficultyLevel: 1,
    hookPrompt:
      'Ananya kept Pot A in the sunny balcony and Pot B in a dark room. She gave Pot A 2 cups of water daily and Pot B 0 cups. Pot A grew tall. She says: “Sunlight alone made Pot A grow!”',
    clues: [
      {
        id: 'pot-a',
        label: 'Pot A (Balcony)',
        detail: 'Got full sunlight AND 2 cups of water every day.',
        isCausal: true,
      },
      {
        id: 'pot-b',
        label: 'Pot B (Dark room)',
        detail: 'Got zero sunlight AND zero water all week.',
        isCausal: true,
      },
      {
        id: 'difference',
        label: 'What changed',
        detail: 'Two things were different at the same time: sunlight and water.',
        isCausal: true,
      },
    ],
    question: 'Does Ananya’s test prove that sunlight alone made Pot A grow?',
    options: [
      {
        id: 'yes-sunlight',
        label: 'Yes, because Pot A was in the sun.',
        tag: 'confounded',
        socraticCounter:
          'Pot B also got zero water! Could Pot B have stayed small because it had no water?',
      },
      {
        id: 'no-two-things',
        label: 'No, because water and sunlight both changed.',
        tag: 'fair-test',
        isCorrect: true,
      },
    ],
    challengeCard: {
      headline: 'Follow-up check',
      prompt:
        'How should Ananya set up Pot A and Pot B to test ONLY sunlight fairly?',
      strength: 'strong',
    },
    hints: [
      'Compare both things Pot A got versus what Pot B got.',
      'Pot A got sunlight and water. Pot B got neither.',
      'To test sunlight fairly, both pots must get the exact same amount of water.',
    ],
    sceneKeywords: ['pot', 'balcony', 'room', 'sunlight', 'water', 'cups'],
    causalKeywords: ['both', 'same', 'water', 'two', 'changed', 'fair', 'only'],
    decorativeKeywords: ['tall', 'green', 'week'],
    mechanismKeywords: ['control', 'variable', 'same water', 'one thing'],
  },
  {
    id: 'd2-m2',
    title: 'The Lucky Cricket Bat',
    phenomenonTag: 'spurious-correlation',
    difficultyLevel: 1,
    hookPrompt:
      'Dev used a new blue bat in Saturday’s match and scored 45 runs. Last week with his old bat, he scored 12 runs. Dev says: “This blue bat scores more runs on its own!”',
    clues: [
      {
        id: 'saturday-match',
        label: 'Saturday’s match',
        detail: 'Dev played against Class 4 beginners on a small ground.',
        isCausal: true,
      },
      {
        id: 'last-week',
        label: 'Last week’s match',
        detail: 'Dev played against the school’s fastest Class 8 bowlers.',
        isCausal: true,
      },
      {
        id: 'bat-weight',
        label: 'The blue bat',
        detail: 'Same wood and same weight as his old bat—only the sticker is blue.',
        isCausal: false,
      },
    ],
    question: 'Why did Dev most likely score 45 runs on Saturday?',
    options: [
      {
        id: 'blue-bat',
        label: 'Because the new blue bat has special power.',
        tag: 'superstition',
        socraticCounter:
          'Look at who was bowling on Saturday versus last week. Did the bowlers change too?',
      },
      {
        id: 'easier-bowlers',
        label: 'Because Saturday’s bowlers and ground were much easier.',
        tag: 'causal-match',
        isCorrect: true,
      },
    ],
    challengeCard: {
      headline: 'Follow-up check',
      prompt:
        'How could Dev check if the blue bat actually helps against the same bowlers?',
      strength: 'strong',
    },
    hints: [
      'Check who bowled to Dev in both matches.',
      'Class 4 beginners are much easier to hit than Class 8 fast bowlers.',
      'He would need to test both bats against the same bowlers.',
    ],
    sceneKeywords: ['bat', 'blue', 'runs', 'saturday', 'match', 'ground'],
    causalKeywords: ['bowlers', 'easier', 'beginners', 'class 4', 'same', 'ground'],
    decorativeKeywords: ['sticker', '45', '12'],
    mechanismKeywords: ['compare', 'same bowlers', 'practice'],
  },
  {
    id: 'd2-m3',
    title: 'The Cold Steel Spoon',
    phenomenonTag: 'heat-transfer',
    difficultyLevel: 2,
    hookPrompt:
      'Kabir touched a steel spoon and a wooden spoon lying on the same kitchen table. The steel spoon felt icy cold. Kabir said: “The steel spoon is at a lower temperature than the wood!”',
    clues: [
      {
        id: 'kitchen-room',
        label: 'Kitchen room',
        detail: 'Both spoons sat on the same table all night at 24°C.',
        isCausal: true,
      },
      {
        id: 'steel-spoon',
        label: 'Steel spoon',
        detail: 'Metal pulls heat away from your warm fingers very fast.',
        isCausal: true,
      },
      {
        id: 'wooden-spoon',
        label: 'Wooden spoon',
        detail: 'Wood pulls heat away from your fingers very slowly.',
        isCausal: false,
      },
    ],
    question: 'Which spoon actually has a lower temperature?',
    options: [
      {
        id: 'steel-colder',
        label: 'The steel spoon is colder than the wooden spoon.',
        tag: 'sensory-illusion',
        socraticCounter:
          'Both spoons sat in the exact same 24°C room all night. Can one be colder without a fridge?',
      },
      {
        id: 'same-temp',
        label: 'Neither—both are 24°C, steel just takes heat from fingers faster.',
        tag: 'thermal-conduction',
        isCorrect: true,
      },
    ],
    challengeCard: {
      headline: 'Follow-up check',
      prompt:
        'What if both spoons were left in the hot afternoon sun? Which one would feel hotter to touch?',
      strength: 'strong',
    },
    hints: [
      'Check the room temperature clue for both spoons.',
      'Both spoons have been at 24°C all night.',
      'Steel feels cold because it pulls heat out of your hand quickly.',
    ],
    sceneKeywords: ['steel', 'wood', 'spoon', 'table', 'kitchen', '24'],
    causalKeywords: ['same', 'temperature', 'heat', 'fingers', 'fast', '24'],
    decorativeKeywords: ['icy', 'night'],
    mechanismKeywords: ['conduct', 'heat transfer', 'same room'],
  },
  {
    id: 'd2-m4',
    title: 'The Bus Stop Crowd',
    phenomenonTag: 'missing-denominator',
    difficultyLevel: 2,
    hookPrompt:
      'A poster at school says: “9 out of 10 students who joined Chess Club won a medal!” Maya thinks almost everyone in the club wins medals.',
    clues: [
      {
        id: 'poster-line',
        label: 'What the poster shows',
        detail: '9 students won medals in the inter-school chess contest.',
        isCausal: false,
      },
      {
        id: 'club-register',
        label: 'Club register',
        detail: '120 students joined the Chess Club this year.',
        isCausal: true,
      },
      {
        id: 'contest-team',
        label: 'Contest team',
        detail: 'Only the top 10 players were sent to the contest.',
        isCausal: true,
      },
    ],
    question: 'Did almost everyone in the 120-student Chess Club win a medal?',
    options: [
      {
        id: 'yes-9-of-10',
        label: 'Yes, 9 out of 10 means 90% of the club won.',
        tag: 'denominator-blindness',
        socraticCounter:
          'Look at the club register: 120 students joined, and only 9 won medals. Is 9 out of 120 almost everyone?',
      },
      {
        id: 'no-only-top-10',
        label: 'No, only 9 out of 120 club members won medals.',
        tag: 'base-rate-check',
        isCorrect: true,
      },
    ],
    challengeCard: {
      headline: 'Follow-up check',
      prompt:
        'What missing number made the poster sound bigger than it really was?',
      strength: 'strong',
    },
    hints: [
      'Compare the 9 medal winners against all 120 club members.',
      'Only 10 top players were sent to the contest.',
      '9 out of 120 is much smaller than 9 out of 10.',
    ],
    sceneKeywords: ['chess', 'club', 'poster', 'medal', '120', '10'],
    causalKeywords: ['120', 'only', 'top 10', 'members', 'total', 'club'],
    decorativeKeywords: ['poster', 'inter-school'],
    mechanismKeywords: ['total', 'out of 120', 'selected'],
  },
  {
    id: 'd2-m5',
    title: 'The Heavy Rain Alert',
    phenomenonTag: 'necessary-vs-sufficient',
    difficultyLevel: 3,
    hookPrompt:
      'Riya’s class teacher said: “If it rains heavily tomorrow morning, the school picnic will be cancelled.” Tomorrow morning, the sky is bright and sunny, yet the picnic is cancelled!',
    clues: [
      {
        id: 'teacher-rule',
        label: 'Teacher’s rule',
        detail: 'Heavy rain cancels the picnic—she did not say rain is the ONLY reason.',
        isCausal: true,
      },
      {
        id: 'morning-weather',
        label: 'Morning weather',
        detail: 'Zero rain; clear blue sky at 7 AM.',
        isCausal: false,
      },
      {
        id: 'school-notice',
        label: 'School gate notice',
        detail: 'The hired school bus broke down at 6:30 AM.',
        isCausal: true,
      },
    ],
    question: 'Was the teacher’s statement broken, or can something else cancel the picnic?',
    options: [
      {
        id: 'teacher-wrong',
        label: 'The teacher was wrong because it did not rain.',
        tag: 'inverse-fallacy',
        socraticCounter:
          'Does “If it rains, picnic is cancelled” mean rain is the ONLY thing that can cancel a picnic?',
      },
      {
        id: 'other-reason',
        label: 'Something else (the broken bus) cancelled the picnic.',
        tag: 'multiple-causes',
        isCorrect: true,
      },
    ],
    challengeCard: {
      headline: 'Follow-up check',
      prompt:
        'What if it DID rain heavily, and the picnic still happened? Would that break the teacher’s rule?',
      strength: 'strong',
    },
    hints: [
      'Re-read the teacher’s rule and the school gate notice.',
      'Rain is one reason to cancel, not the only possible reason.',
      'The bus broke down, which also stopped the picnic.',
    ],
    sceneKeywords: ['rain', 'picnic', 'bus', 'sunny', 'cancelled', 'teacher'],
    causalKeywords: ['bus', 'broke', 'other', 'reason', 'not only', 'else'],
    decorativeKeywords: ['blue sky', '7 AM'],
    mechanismKeywords: ['another cause', 'bus breakdown', 'not only'],
  },
];

const day02Tier1: DayConfig = {
  day: 2,
  title: 'Fair Checks & Hidden Numbers',
  items: day02Missions,
};

export default day02Tier1;