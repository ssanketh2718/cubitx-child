export type ThinkingAreaId =
  | 'asking-questions'
  | 'missing-clues'
  | 'giving-reasons'
  | 'using-evidence'
  | 'spotting-weak-claims'
  | 'weighing-trade-offs'
  | 'changing-mind-with-proof'
  | 'reflecting';

export type ObservationStatus =
  | 'observed_in_session'
  | 'not_seen_yet';

export interface ThinkingArea {
  id: ThinkingAreaId;
  title: string;
  shortLabel: string;
  focusGroup: 'Curiosity & Clues' | 'Reasoning & Proof' | 'Judgment & Growth';
  parentExplanation: string;
  whatItLooksLike: string[];
  homeConversation: string;
  howWeCheckIt: string;
  whatItDoesNotMean: string;
}

export const THINKING_AREAS: readonly ThinkingArea[] = [
  {
    id: 'asking-questions',
    title: 'Asking helpful questions',
    shortLabel: 'Questions',
    focusGroup: 'Curiosity & Clues',
    parentExplanation:
      'Pauses to ask practical questions that help tell one idea apart from another before jumping in.',
    whatItLooksLike: [
      'Asks "how can we test this?" instead of guessing right away.',
      'Wants to know what happened behind a confident statement.',
    ],
    homeConversation:
      'When someone makes a bold claim today, what one question would help you check it?',
    howWeCheckIt:
      'We look at the questions and follow-up checks your child makes during open prompts.',
    whatItDoesNotMean:
      'Not seeing this yet does not mean your child is incurious—many kids jump straight into action.',
  },
  {
    id: 'missing-clues',
    title: 'Spotting missing information',
    shortLabel: 'Missing Info',
    focusGroup: 'Curiosity & Clues',
    parentExplanation:
      'Notices when key facts are missing so they do not form a rushed conclusion from half the story.',
    whatItLooksLike: [
      'Spots that a detail is left out before deciding.',
      'Checks multiple clues before settling on an answer.',
    ],
    homeConversation:
      'Before we decide on a plan today, what detail might we be missing?',
    howWeCheckIt:
      'We observe whether your child checks available clues and notes what else is needed to be sure.',
    whatItDoesNotMean:
      'Kids naturally rely on familiar shortcuts until a mystery asks them to slow down.',
  },
  {
    id: 'giving-reasons',
    title: 'Giving clear reasons',
    shortLabel: 'Reasons',
    focusGroup: 'Reasoning & Proof',
    parentExplanation:
      'Explains why an idea makes sense using specific details from the situation rather than just repeating a guess.',
    whatItLooksLike: [
      'Connects a choice to what actually happened in the story or puzzle.',
      'Explains "why" in their own words.',
    ],
    homeConversation:
      'What made you lean toward that choice over the other options?',
    howWeCheckIt:
      'We look at the reasoning your child gives alongside their choices and written notes.',
    whatItDoesNotMean:
      'Short answers during early sessions are just a starting point—kids build deeper explanations with practice.',
  },
  {
    id: 'using-evidence',
    title: 'Using evidence',
    shortLabel: 'Evidence',
    focusGroup: 'Reasoning & Proof',
    parentExplanation:
      'Points to concrete clues, measurements, or observations to back up what they think.',
    whatItLooksLike: [
      'Goes back to check earlier clues or observations.',
      'Bases a choice on what was actually observed rather than a hunch.',
    ],
    homeConversation:
      'Which clue or detail convinced you the most—and why?',
    howWeCheckIt:
      'We see whether your child checks clues, re-tests ideas, and points to real evidence.',
    whatItDoesNotMean:
      'A single session only shows how they worked on those specific puzzles—not a fixed label.',
  },
  {
    id: 'spotting-weak-claims',
    title: 'Spotting weak or one-sided claims',
    shortLabel: 'Weak Claims',
    focusGroup: 'Reasoning & Proof',
    parentExplanation:
      'Notices when a claim sounds confident—even from an AI or an authority—but rests on weak proof or a tiny sample.',
    whatItLooksLike: [
      'Questions "everyone says so" or one-example proof.',
      'Spots when an explanation skips an important comparison.',
    ],
    homeConversation:
      'Did you see or hear anything today that sounded very sure, even without strong proof?',
    howWeCheckIt:
      'We present realistic, persuasive-sounding claims and see if your child checks the proof behind them.',
    whatItDoesNotMean:
      'Sounding certain is persuasive to almost everyone—building healthy skepticism takes steady practice.',
  },
  {
    id: 'weighing-trade-offs',
    title: 'Weighing trade-offs',
    shortLabel: 'Trade-offs',
    focusGroup: 'Judgment & Growth',
    parentExplanation:
      'Balances benefits against limits—like cost, time, or effort—when choosing between options.',
    whatItLooksLike: [
      'Compares what a choice gains against what it costs.',
      'Adjusts their plan when a constraint gets tight.',
    ],
    homeConversation:
      'If we pick that option, what do we gain—and what do we give up?',
    howWeCheckIt:
      'We observe how your child balances competing goals like budget, strength, or fairness.',
    whatItDoesNotMean:
      'Hitting a budget limit or trying a few combinations is a normal part of testing options.',
  },
  {
    id: 'changing-mind-with-proof',
    title: 'Updating ideas when new proof arrives',
    shortLabel: 'Updating',
    focusGroup: 'Judgment & Growth',
    parentExplanation:
      'Stays flexible enough to rethink an early guess when strong new evidence appears, without folding to weak pressure.',
    whatItLooksLike: [
      'Reconsiders an initial pick when new facts change the picture.',
      'Holds steady when a claim lacks real proof.',
    ],
    homeConversation:
      'What new fact would actually make you change your mind about something?',
    howWeCheckIt:
      'We look at how your child responds when new clues or twists are introduced mid-mission.',
    whatItDoesNotMean:
      'Changing your mind after seeing better proof is a sign of clear thinking, not inconsistency.',
  },
  {
    id: 'reflecting',
    title: 'Reflecting on what worked',
    shortLabel: 'Reflecting',
    focusGroup: 'Judgment & Growth',
    parentExplanation:
      'Looks back at which approach helped most and what they would try differently next time.',
    whatItLooksLike: [
      'Notices which strategy helped untangle a puzzle.',
      'Thinks about a better next step after a tough moment.',
    ],
    homeConversation:
      'What helped you figure out a tricky moment this week?',
    howWeCheckIt:
      'We look at how your child summarizes what they noticed and what they would try next.',
    whatItDoesNotMean:
      'Reflection grows naturally when children get calm space to look back without being graded.',
  },
] as const;

export interface ObservedMoment {
  id: string;
  itemKey: string;
  title: string;
  submittedAt: string;
  verbatimText?: string;
  pickedIndex?: number;
  testsBeforeGuess?: number;
  wentBackToTest?: boolean;
  hintsUsed?: number;
  changedAnswerCount?: number;
}