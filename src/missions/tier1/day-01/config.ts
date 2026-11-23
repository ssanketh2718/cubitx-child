import type { DayConfig } from '../../../core/sdk/types';

export const FREE_MISSIONS_PER_DAY = 2;
export const FREE_QUESTIONS_PER_TOPIC = 4;

const day01Tier1: DayConfig = {
  day: 1,
  title: 'Day 1 · Detective Lab',
  theme: 'Check Clues Before Guessing',
  items: [
    // ── MISSION 1 (FREE 1/2) ─────────────────────────────────────────────
    {
      id: 't1:d1:i0',
      title: 'The Missing Tiffin',
      phenomenonTag: 'CLUES',
      difficultyLevel: 1,
      isFarTransfer: false,
      hookPrompt:
        'Rohan kept his mango tiffin on the classroom bench at 10 AM. At 1 PM, the tiffin was empty.',
      question: 'Who ate the mangoes?',
      clues: [
        {
          id: 'c1',
          label: 'Classroom door',
          detail: 'The classroom door was locked from 10 AM to 12 PM.',
          isCausal: true,
        },
        {
          id: 'c2',
          label: 'Bench at 12:30 PM',
          detail: 'Only Kabir sat on that bench at 12:30 PM.',
          isCausal: true,
        },
        {
          id: 'c3',
          label: 'School bag',
          detail: 'Rohan has a blue school bag.',
          isCausal: false,
        },
      ],
      options: [
        {
          id: 'not-sure',
          tag: 'CHECK MORE',
          label: 'Not sure yet—need to check Kabir.',
          isCorrect: true,
        },
        {
          id: 'kabir',
          tag: 'FIRST GUESS',
          label: 'Kabir ate the mangoes.',
          isCorrect: false,
        },
        {
          id: 'outsider',
          tag: 'CHECK DOOR',
          label: 'Someone from outside the school.',
          isCorrect: false,
          socraticCounter:
            'The classroom door was locked from 10 AM to 12 PM. How could someone from outside enter?',
        },
      ],
      challengeCard: {
        strength: 'strong',
        headline: 'NEW CLUE',
        prompt:
          'Kabir had a bad stomach ache today and ate nothing all day. Now what do you think? Keep your answer or change it?',
      },
      hints: [
        'Tap all 3 clues first.',
        'Check who was near the bench when the door was open.',
        'With the new clue, Kabir ate nothing all day—so someone else took the mangoes.',
      ],
      sceneKeywords: ['mango', 'tiffin', 'door', 'locked', 'kabir', 'bench', 'stomach'],
      causalKeywords: ['locked', 'door', 'kabir', 'bench', 'stomach', 'ate nothing'],
      decorativeKeywords: ['blue', 'bag'],
      mechanismKeywords: ['locked', 'stomach', 'ate nothing', 'someone else'],
    },

    // ── MISSION 2 (FREE 2/2) ─────────────────────────────────────────────
    {
      id: 't1:d1:i1',
      title: 'The Wet Shoes',
      phenomenonTag: 'TWO CAUSES',
      difficultyLevel: 1,
      isFarTransfer: false,
      hookPrompt:
        'Meera’s school shoes were totally wet at 8 AM. She says: “It rained at night!”',
      question: 'Did rain make her shoes wet?',
      clues: [
        {
          id: 'c1',
          label: 'Road outside',
          detail: 'The road outside her house is totally dry.',
          isCausal: true,
        },
        {
          id: 'c2',
          label: '7 AM near shoe rack',
          detail: 'Her brother washed his bicycle right next to the shoe rack at 7 AM.',
          isCausal: true,
        },
        {
          id: 'c3',
          label: 'Shoe colour',
          detail: 'Meera’s shoes are white.',
          isCausal: false,
        },
      ],
      options: [
        {
          id: 'bicycle-wash',
          tag: 'CLUE MATCH',
          label: 'No, the bicycle wash made them wet.',
          isCorrect: true,
        },
        {
          id: 'rained',
          tag: 'FIRST GUESS',
          label: 'Yes, it rained at night.',
          isCorrect: false,
          socraticCounter:
            'If it rained at night, why is the open road right outside her house totally dry?',
        },
      ],
      challengeCard: {
        strength: 'decoy',
        headline: 'FRIEND SAYS',
        prompt:
          'Meera’s friend says: “Maybe rain fell only on your shoes!” Keep your answer or switch?',
      },
      hints: [
        'Check the road outside her house.',
        'Look at what happened next to the shoe rack at 7 AM.',
        'The road is dry, so it did not rain—the bicycle wash splashed water on her shoes.',
      ],
      sceneKeywords: ['shoes', 'wet', 'rain', 'road', 'dry', 'brother', 'bicycle'],
      causalKeywords: ['road', 'dry', 'bicycle', 'washed', '7 am'],
      decorativeKeywords: ['white'],
      mechanismKeywords: ['bicycle', 'washed', 'dry', 'splashed'],
    },

    // ── MISSION 3 (ANNUAL 3/5) ───────────────────────────────────────────
    {
      id: 't1:d1:i2',
      title: 'Fastest Way to School',
      phenomenonTag: 'PLANNING',
      difficultyLevel: 2,
      isFarTransfer: false,
      hookPrompt:
        'School starts in 15 minutes. Pick the best way for Aarav to reach on time.',
      question: 'Which way should Aarav go?',
      clues: [
        {
          id: 'c1',
          label: 'Walk through park',
          detail: 'Takes 12 minutes. Free.',
          isCausal: true,
        },
        {
          id: 'c2',
          label: 'Take the auto',
          detail: 'Takes 8 minutes. Costs ₹30, and Aarav only has ₹20.',
          isCausal: true,
        },
        {
          id: 'c3',
          label: 'Ride his cycle',
          detail: 'Takes 10 minutes, but the front tyre is flat.',
          isCausal: true,
        },
      ],
      options: [
        {
          id: 'walk',
          tag: 'WORKS',
          label: 'Walk through the park.',
          isCorrect: true,
        },
        {
          id: 'auto',
          tag: 'SHORT MONEY',
          label: 'Take the auto.',
          isCorrect: false,
          socraticCounter:
            'The auto costs ₹30, and Aarav only has ₹20. How will he pay?',
        },
        {
          id: 'cycle',
          tag: 'FLAT TYRE',
          label: 'Ride his cycle.',
          isCorrect: false,
          socraticCounter:
            'The front tyre is flat. Can Aarav ride a flat tyre in 10 minutes?',
        },
      ],
      challengeCard: {
        strength: 'strong',
        headline: 'NEW UPDATE',
        prompt:
          'The park gate is locked today! Going around takes 20 minutes. What should Aarav do now?',
      },
      hints: [
        'Check how much money Aarav has and check his cycle tyre.',
        'Walking takes 12 minutes, which is under 15 minutes.',
        'When the park gate is locked, Aarav must ask the auto uncle for a ₹20 ride or call home.',
      ],
      sceneKeywords: ['15 minutes', 'walk', 'park', '12 minutes', 'auto', '20', '30', 'cycle', 'flat'],
      causalKeywords: ['12 minutes', '20', '30', 'flat', 'locked'],
      decorativeKeywords: [],
      mechanismKeywords: ['minutes', 'money', 'flat', 'gate'],
    },

    // ── MISSION 4 (ANNUAL 4/5) ───────────────────────────────────────────
    {
      id: 't1:d1:i3',
      title: 'The Broken Flower Pot',
      phenomenonTag: 'CHECK AGAIN',
      difficultyLevel: 2,
      isFarTransfer: false,
      hookPrompt:
        'Amma’s flower pot broke on the balcony at 5 PM.',
      question: 'What broke the flower pot?',
      clues: [
        {
          id: 'c1',
          label: 'Balcony floor',
          detail: 'A cricket ball is lying right next to the broken pot pieces.',
          isCausal: true,
        },
        {
          id: 'c2',
          label: 'Weather at 4:45 PM',
          detail: 'A very strong wind blew across the balcony at 4:45 PM.',
          isCausal: true,
        },
        {
          id: 'c3',
          label: 'Pot colour',
          detail: 'The flower pot was painted red.',
          isCausal: false,
        },
      ],
      options: [
        {
          id: 'cricket-ball',
          tag: 'FIRST GUESS',
          label: 'A cricket ball hit the pot.',
          isCorrect: false,
        },
        {
          id: 'wind',
          tag: 'SECOND CAUSE',
          label: 'The strong wind pushed it down.',
          isCorrect: true,
        },
        {
          id: 'not-sure',
          tag: 'BOTH POSSIBLE',
          label: 'Both wind and ball look possible.',
          isCorrect: true,
        },
      ],
      challengeCard: {
        strength: 'strong',
        headline: 'NEW CLUE',
        prompt:
          'Neighbour uncle says: “Nobody played cricket today—that ball was lying there since morning.” Keep your answer or switch?',
      },
      hints: [
        'Tap all 3 clues first.',
        'Both the cricket ball and the strong wind were near the pot.',
        'Since the ball was there since morning, the 4:45 PM strong wind broke the pot.',
      ],
      sceneKeywords: ['flower pot', 'balcony', 'cricket ball', 'wind', '4:45', 'morning'],
      causalKeywords: ['cricket ball', 'wind', '4:45', 'morning'],
      decorativeKeywords: ['red'],
      mechanismKeywords: ['wind', 'morning', 'ball'],
    },

    // ── MISSION 5 (ANNUAL 5/5) ───────────────────────────────────────────
    {
      id: 't1:d1:i4',
      title: 'Two Juice Shops',
      phenomenonTag: 'SMART CHOICE',
      difficultyLevel: 2,
      isFarTransfer: true,
      hookPrompt:
        'Raju wants 2 glasses of sugarcane juice. He has ₹30.',
      question: 'Which shop is the smarter pick?',
      clues: [
        {
          id: 'c1',
          label: 'Shop A',
          detail: '₹15 per glass. Clean steel glasses. 2-minute wait.',
          isCausal: true,
        },
        {
          id: 'c2',
          label: 'Shop B',
          detail: '₹10 per glass. Dirty glasses. No wait.',
          isCausal: true,
        },
        {
          id: 'c3',
          label: 'Shop sign',
          detail: 'Shop A has a yellow board.',
          isCausal: false,
        },
      ],
      options: [
        {
          id: 'shop-a',
          tag: 'CLEAN + FITS ₹30',
          label: 'Shop A (₹30 for 2 clean glasses).',
          isCorrect: true,
        },
        {
          id: 'shop-b',
          tag: 'SAVES ₹10',
          label: 'Shop B (saves ₹10, no wait).',
          isCorrect: false,
          socraticCounter:
            'Shop B saves ₹10, but the glasses are dirty. Is saving ₹10 worth getting sick?',
        },
      ],
      challengeCard: {
        strength: 'strong',
        headline: 'NEW UPDATE',
        prompt:
          'Raju’s school bus horn blows—he only has 30 seconds! Should he still wait 2 minutes at Shop A, or skip juice today?',
      },
      hints: [
        '2 glasses at ₹15 each = ₹30, which Raju already has.',
        'Compare clean glasses against saving ₹10.',
        'When the bus is about to leave in 30 seconds, skipping juice is smarter than missing the bus.',
      ],
      sceneKeywords: ['sugarcane', '30', '15', '10', 'clean', 'dirty', 'wait', 'bus'],
      causalKeywords: ['15', '10', 'clean', 'dirty', 'wait', 'bus'],
      decorativeKeywords: ['yellow'],
      mechanismKeywords: ['clean', 'dirty', 'budget', 'bus'],
    },
  ],
};

export default day01Tier1;