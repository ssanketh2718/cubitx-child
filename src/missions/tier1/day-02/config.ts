import type { DayConfig, MissionStageSpec } from '../../../core/sdk/types';

export const FREE_MISSIONS_PER_DAY = 2;

const day02Missions: MissionStageSpec[] = [
  {
    id: 'd2-m1',
    title: 'The Two Plant Pots',
    phenomenonTag: 'fair-comparison',
    difficultyLevel: 1,
    hookPrompt:
      'Ananya wants to prove that sunlight makes plants grow faster. She puts Pot A in the sunny verandah and Pot B in a dark room. After 10 days, Pot A is tall and Pot B is tiny.',
    clues: [
      {
        id: 'pot-a',
        label: 'Pot A (Verandah)',
        detail: 'Sun shines 6 hours daily. Ananya pours 1 full mug of water every morning.',
        isCausal: true,
      },
      {
        id: 'pot-b',
        label: 'Pot B (Dark room)',
        detail: 'Zero sunlight. Ananya forgets to water it all 10 days.',
        isCausal: true,
      },
      {
        id: 'soil-seeds',
        label: 'Soil & Seeds',
        detail: 'Both pots have the same garden mud and seeds from the same packet.',
        isCausal: false,
      },
    ],
    question:
      'Ananya says: “See! Pot A grew tall because of sunlight!” What must she change to actually prove her claim?',
    options: [
      {
        id: 'same-water-dark-vs-sun',
        label:
          'Keep Pot A in the sun with 1 mug water, and give Pot B in the dark room 1 mug water too.',
        tag: 'fair-test',
        isCorrect: true,
      },
      {
        id: 'both-in-sun',
        label:
          'Move Pot B to the sunny verandah and give both pots 2 mugs of water.',
        tag: 'loses-comparison',
        socraticCounter:
          'If both pots sit in the sunny verandah, how will Ananya compare sun vs. dark?',
      },
      {
        id: 'more-water-pot-b',
        label:
          'Give Pot B 2 mugs of water in the dark room so it catches up to Pot A.',
        tag: 'unequal-variable',
        socraticCounter:
          'If Pot A gets 1 mug and Pot B gets 2 mugs, water is still unequal between the two pots.',
      },
    ],
    challengeCard: {
      headline: 'One more question',
      prompt:
        'Why should Ananya keep the same garden mud and same packet seeds in both pots?',
      strength: 'strong',
    },
    hints: [
      'Compare what Pot A got versus what Pot B got.',
      'Pot A got sun AND water. Pot B got neither sun nor water.',
      'To test ONLY sunlight, both pots must get the exact same 1 mug of water.',
    ],
    sceneKeywords: ['pot', 'verandah', 'room', 'sunlight', 'water', 'mug'],
    causalKeywords: ['water', 'same', '1 mug', 'dark', 'sun', 'only', 'equal'],
    decorativeKeywords: ['mud', 'packet', '10 days'],
    mechanismKeywords: ['same water', 'one thing', 'fair'],
  },
  {
    id: 'd2-m2',
    title: 'The Lucky Blue Bat',
    phenomenonTag: 'spurious-correlation',
    difficultyLevel: 1,
    hookPrompt:
      'Dev used his new blue bat on Saturday and scored 45 runs. Last week with his old wooden bat, he scored only 12 runs. He tells his friends: “My blue bat hits the ball harder!”',
    clues: [
      {
        id: 'saturday-match',
        label: 'Saturday’s match',
        detail: 'Class 3 kids bowled slow underarm balls on a small ground.',
        isCausal: true,
      },
      {
        id: 'last-week-match',
        label: 'Last week’s match',
        detail: 'Class 8 boys bowled fast overarm balls on the big ground.',
        isCausal: true,
      },
      {
        id: 'bat-check',
        label: 'Bat check',
        detail: 'Both bats weigh 900 grams and are made from the same willow wood.',
        isCausal: false,
      },
    ],
    question:
      'Dev’s friend Kabir doubts him. What is the best test to check if the blue bat really hits farther?',
    options: [
      {
        id: 'compare-old-12',
        label:
          'Let Dev bat with the blue bat against Class 8 bowlers, and compare with his old 12 runs.',
        tag: 'time-confound',
        socraticCounter:
          'Dev might have improved since last week, or bowlers might bowl differently today. How can he compare both bats fairly on the same day?',
      },
      {
        id: 'give-to-class-8',
        label:
          'Give the blue bat to a Class 8 boy to see if he scores more than 45 runs.',
        tag: 'changes-batter',
        socraticCounter:
          'A Class 8 boy is stronger than Dev! That tests the player, not the two bats.',
      },
      {
        id: 'same-bowler-same-day',
        label:
          'Let Dev hit 10 balls with the blue bat and 10 balls with the old bat against the same bowler on the same day.',
        tag: 'fair-test',
        isCorrect: true,
      },
    ],
    challengeCard: {
      headline: 'One more question',
      prompt:
        'Why did Dev score 45 runs on Saturday even though both bats have the exact same wood and weight?',
      strength: 'strong',
    },
    hints: [
      'Look at who bowled on Saturday versus last week.',
      'To compare two bats fairly, the batter, bowler, and ground must stay the same.',
      'Testing both bats against the same bowler on the same day makes it a fair check.',
    ],
    sceneKeywords: ['bat', 'blue', 'runs', 'saturday', 'bowler', 'ground'],
    causalKeywords: ['same bowler', 'same day', 'both bats', 'compare', 'fair'],
    decorativeKeywords: ['900 grams', 'willow', '45', '12'],
    mechanismKeywords: ['same bowler', 'side by side', 'fair test'],
  },
  {
    id: 'd2-m3',
    title: 'The Cold Steel Spoon',
    phenomenonTag: 'heat-transfer',
    difficultyLevel: 2,
    hookPrompt:
      'A steel spoon and a wooden spoon lay side by side on the kitchen shelf all night. In the morning, Kabir touched both. The steel spoon felt icy cold, while the wooden spoon felt normal.',
    clues: [
      {
        id: 'kitchen-shelf',
        label: 'Kitchen shelf',
        detail: 'Both spoons stayed in the exact same room all night—neither touched ice or a fridge.',
        isCausal: true,
      },
      {
        id: 'steel-spoon',
        label: 'Steel spoon',
        detail: 'Steel pulls warmth out of your warm fingers very quickly.',
        isCausal: true,
      },
      {
        id: 'wooden-spoon',
        label: 'Wooden spoon',
        detail: 'Wood pulls warmth out of your warm fingers very slowly.',
        isCausal: false,
      },
    ],
    question:
      'If Kabir wraps both spoons in a thick woollen shawl for 1 hour (away from his hand), what will happen?',
    options: [
      {
        id: 'steel-stays-colder',
        label: 'The steel spoon will stay colder than the wooden spoon inside the shawl.',
        tag: 'sensory-illusion',
        socraticCounter:
          'Check the Kitchen shelf card—was the steel spoon actually colder than the room, or did it just take warmth from Kabir’s hand fast?',
      },
      {
        id: 'same-room-temp',
        label:
          'Nothing changes in their temperature—both were already at the exact same room temperature.',
        tag: 'thermal-equilibrium',
        isCorrect: true,
      },
      {
        id: 'wood-warms-steel',
        label: 'The wooden spoon will make the steel spoon warm up.',
        tag: 'unsupported-guess',
        socraticCounter:
          'Both spoons sat on the exact same shelf all night, so neither is warmer than the other.',
      },
    ],
    challengeCard: {
      headline: 'One more question',
      prompt:
        'If both spoons lie in the hot afternoon sun, which spoon will feel hotter to your fingers and why?',
      strength: 'strong',
    },
    hints: [
      'Both spoons sat on the same kitchen shelf all night.',
      'Steel feels cold only because it pulls heat out of your warm hand very fast.',
      'Since both were in the same room all night, both already have the exact same temperature.',
    ],
    sceneKeywords: ['steel', 'wood', 'spoon', 'shelf', 'shawl', 'fingers'],
    causalKeywords: ['same', 'room', 'temperature', 'nothing', 'already', 'heat'],
    decorativeKeywords: ['shawl', 'night', 'fridge'],
    mechanismKeywords: ['same temperature', 'pulls warmth', 'equilibrium'],
  },
  {
    id: 'd2-m4',
    title: 'The Carrom Club Poster',
    phenomenonTag: 'missing-denominator',
    difficultyLevel: 2,
    hookPrompt:
      'A poster outside school says: “9 out of 10 Carrom Club players won a medal!” Maya joins thinking almost everyone in the club wins a medal.',
    clues: [
      {
        id: 'club-register',
        label: 'Club register',
        detail: '100 students paid fees and joined the Carrom Club this year.',
        isCausal: true,
      },
      {
        id: 'match-selection',
        label: 'Match selection',
        detail: 'Teacher held trials and sent only the top 10 players to the tournament.',
        isCausal: true,
      },
      {
        id: 'tournament-result',
        label: 'Tournament result',
        detail: '9 out of those 10 players came back with medals.',
        isCausal: false,
      },
    ],
    question:
      'Next year, 100 new students join the Carrom Club, and the rules stay the same. What should Maya expect?',
    options: [
      {
        id: 'only-9-of-100',
        label:
          'Only about 9 out of 100 club students will win a medal, because 90 are never even sent to play.',
        tag: 'base-rate-check',
        isCorrect: true,
      },
      {
        id: 'around-90-win',
        label: 'Around 90 out of 100 club students will win a medal.',
        tag: 'denominator-blindness',
        socraticCounter:
          'Tap Full Club (100) in the scene above—how many students actually get sent to the tournament?',
      },
      {
        id: 'send-all-100',
        label: '90 students will win if the teacher sends all 100 students to play.',
        tag: 'selection-bias-error',
        socraticCounter:
          'Only the top 10 best players won 9 medals. Would beginners win at the same rate?',
      },
    ],
    challengeCard: {
      headline: 'One more question',
      prompt:
        'Which number did the poster leave out to make winning look easy?',
      strength: 'strong',
    },
    hints: [
      'Tap Full Club (100) in the top box to see all club members.',
      'Only the top 10 out of 100 students are sent to play.',
      '90 club members stay behind, so only about 9 out of 100 win medals.',
    ],
    sceneKeywords: ['carrom', 'club', 'poster', 'medal', '100', '10'],
    causalKeywords: ['9', '100', '90', 'never sent', 'top 10', 'only'],
    decorativeKeywords: ['fees', 'trials'],
    mechanismKeywords: ['out of 100', 'selection', 'base rate'],
  },
  {
    id: 'd2-m5',
    title: 'The Cancelled Picnic',
    phenomenonTag: 'necessary-vs-sufficient',
    difficultyLevel: 3,
    hookPrompt:
      'Teacher announced: “If it rains heavily tomorrow morning, the school picnic will be cancelled.” Next morning, the sky is bright and sunny—yet the picnic is cancelled!',
    clues: [
      {
        id: 'morning-sky',
        label: '7:00 AM sky',
        detail: 'Bright sun, clear blue sky, and dry roads across town.',
        isCausal: false,
      },
      {
        id: 'road-news',
        label: '6:30 AM road news',
        detail: 'The hired school bus had a tyre burst and no spare bus was available.',
        isCausal: true,
      },
      {
        id: 'teacher-rule',
        label: 'Teacher’s exact rule',
        detail: 'She promised heavy rain cancels the picnic—she never said rain is the ONLY thing that can cancel it.',
        isCausal: true,
      },
    ],
    question: 'Which situation would actually prove the teacher broke her promise?',
    options: [
      {
        id: 'no-rain-bus-burst',
        label:
          'It did not rain, and the picnic was cancelled because the bus tyre burst.',
        tag: 'inverse-fallacy',
        socraticCounter:
          'That is what happened today! Did the teacher ever promise the picnic would happen if the bus broke down?',
      },
      {
        id: 'rained-and-went',
        label:
          'It rained heavily in the morning, and the teacher still took the class for the picnic.',
        tag: 'rule-violation',
        isCorrect: true,
      },
      {
        id: 'sunny-and-went',
        label: 'It was sunny in the morning, and the picnic went ahead on time.',
        tag: 'normal-case',
        socraticCounter:
          'That follows her rule! Look for the case where her promise “If it rains → cancelled” fails.',
      },
    ],
    challengeCard: {
      headline: 'One more question',
      prompt:
        'Why can a rule like “If it rains, picnic is cancelled” still be true even on a sunny cancelled day?',
      strength: 'strong',
    },
    hints: [
      'Read Teacher’s exact rule: “If it rains heavily tomorrow morning, the school picnic will be cancelled.”',
      'Her promise is broken ONLY if it rains heavily and the picnic is NOT cancelled.',
      'When it rains heavily and the class still goes on the picnic, the promise is broken.',
    ],
    sceneKeywords: ['rain', 'picnic', 'bus', 'tyre', 'sunny', 'promise'],
    causalKeywords: ['rained', 'heavily', 'still took', 'not cancelled', 'went'],
    decorativeKeywords: ['spare bus', 'town'],
    mechanismKeywords: ['if-then', 'breaks promise', 'rained and went'],
  },
];

const day02Tier1: DayConfig = {
  day: 2,
  title: 'Fair Checks & Hidden Numbers',
  items: day02Missions,
};

export default day02Tier1;