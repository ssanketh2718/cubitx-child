export type HabitStatus = 'seen' | 'starting' | 'not_yet';

export interface MicroHabit {
  id: string;
  label: string;
  status: HabitStatus;
  example: string;
}

export interface ThinkingArea48 {
  id: string;
  code: string;
  name: string;
  shortName: string;
  simpleMeaning: string;
  homeQuestion: string;
  notYetNote: string;
  habits: MicroHabit[];
}

export const THINKING_AREAS_48: ThinkingArea48[] = [
  {
    id: 'asking-questions',
    code: 'A1',
    name: 'Asking Good Questions',
    shortName: 'Questions',
    simpleMeaning: 'Asking helpful questions before jumping to an answer.',
    homeQuestion: 'What else would you like to know before picking an answer?',
    notYetNote: 'Not tried much yet in this time — and that is completely okay.',
    habits: [
      { id: 'a1-1', label: 'Asks what changes a result', status: 'seen', example: 'Asked how changing light changes a shadow.' },
      { id: 'a1-2', label: 'Wonders why a rule works', status: 'seen', example: 'Asked why two numbers gave the same output.' },
      { id: 'a1-3', label: 'Asks before guessing fast', status: 'starting', example: 'Paused to ask a question first.' },
      { id: 'a1-4', label: 'Compares two questions', status: 'starting', example: 'Picked the clearer question to test.' },
      { id: 'a1-5', label: 'Connects question to clue', status: 'not_yet', example: 'Coming up in next missions.' },
      { id: 'a1-6', label: 'Asks a follow-up question', status: 'not_yet', example: 'Coming up in next missions.' },
    ],
  },
  {
    id: 'missing-info',
    code: 'A2',
    name: 'Spotting Missing Details',
    shortName: 'Missing Info',
    simpleMeaning: 'Noticing when a clue or piece of information is missing.',
    homeQuestion: 'What detail are we still missing here?',
    notYetNote: 'Not tried much yet in this time — and that is completely okay.',
    habits: [
      { id: 'a2-1', label: 'Spots an incomplete clue', status: 'seen', example: 'Noticed one number was left out.' },
      { id: 'a2-2', label: 'Pauses when facts feel thin', status: 'starting', example: 'Waited before making a call.' },
      { id: 'a2-3', label: 'Checks rules before deciding', status: 'seen', example: 'Checked limit rules first.' },
      { id: 'a2-4', label: 'Finds hidden conditions', status: 'starting', example: 'Spotted a time limit in the task.' },
      { id: 'a2-5', label: 'Asks for one missing fact', status: 'not_yet', example: 'Coming up in thinking sheets.' },
      { id: 'a2-6', label: 'Separates known from unknown', status: 'not_yet', example: 'Coming up in thinking sheets.' },
    ],
  },
  {
    id: 'giving-reasons',
    code: 'B1',
    name: 'Sharing Clear Reasons',
    shortName: 'Reasons',
    simpleMeaning: 'Explaining why a choice makes sense in plain words.',
    homeQuestion: 'What made you pick that choice today?',
    notYetNote: 'Not tried much yet in this time — and that is completely okay.',
    habits: [
      { id: 'b1-1', label: 'Gives a reason for choice', status: 'seen', example: 'Explained why one path fit better.' },
      { id: 'b1-2', label: 'Links choice to what happened', status: 'seen', example: 'Connected output back to the test.' },
      { id: 'b1-3', label: 'Uses simple everyday words', status: 'starting', example: 'Shared reason in short words.' },
      { id: 'b1-4', label: 'Gives more than a one-word answer', status: 'starting', example: 'Added a short "because" note.' },
      { id: 'b1-5', label: 'Checks if reason fits all parts', status: 'not_yet', example: 'Coming up in next missions.' },
      { id: 'b1-6', label: 'Explains choice to someone else', status: 'not_yet', example: 'Coming up in family talks.' },
    ],
  },
  {
    id: 'using-evidence',
    code: 'B2',
    name: 'Using Clues & Facts',
    shortName: 'Clues',
    simpleMeaning: 'Looking at real clues before making up your mind.',
    homeQuestion: 'Which clue helped you feel sure?',
    notYetNote: 'Not tried much yet in this time — and that is completely okay.',
    habits: [
      { id: 'b2-1', label: 'Tests more than one clue', status: 'seen', example: 'Tried two inputs before picking a rule.' },
      { id: 'b2-2', label: 'Compares two choices side by side', status: 'seen', example: 'Looked at both options before choosing.' },
      { id: 'b2-3', label: 'Points to a clue in the task', status: 'seen', example: 'Used the observed change as support.' },
      { id: 'b2-4', label: 'Re-checks clue when stuck', status: 'starting', example: 'Went back to check the first clue.' },
      { id: 'b2-5', label: 'Drops weak clue for strong one', status: 'starting', example: 'Switched to a clearer clue.' },
      { id: 'b2-6', label: 'Spots when clue does not fit', status: 'not_yet', example: 'Coming up in next missions.' },
    ],
  },
  {
    id: 'weak-reasoning',
    code: 'B3',
    name: 'Spotting Shaky Ideas',
    shortName: 'Shaky Ideas',
    simpleMeaning: 'Noticing when a quick idea has a gap or weak spot.',
    homeQuestion: 'Could there be another way to look at that?',
    notYetNote: 'Not tried much yet in this time — and that is completely okay.',
    habits: [
      { id: 'b3-1', label: 'Questions a fast guess', status: 'starting', example: 'Asked if one example is enough.' },
      { id: 'b3-2', label: 'Notices skipped steps', status: 'starting', example: 'Spotted a jump in an idea.' },
      { id: 'b3-3', label: 'Checks if a rule always holds', status: 'seen', example: 'Tested if the rule worked again.' },
      { id: 'b3-4', label: 'Spots an over-big claim', status: 'not_yet', example: 'Coming up in claim missions.' },
      { id: 'b3-5', label: 'Looks for a counter-example', status: 'not_yet', example: 'Coming up in claim missions.' },
      { id: 'b3-6', label: 'Keeps calm when an idea breaks', status: 'not_yet', example: 'Coming up in next missions.' },
    ],
  },
  {
    id: 'trade-offs',
    code: 'C1',
    name: 'Weighing Give-and-Take',
    shortName: 'Give & Take',
    simpleMeaning: 'Thinking about what you gain and what you give up.',
    homeQuestion: 'What did we gain, and what did we trade off?',
    notYetNote: 'Not tried much yet in this time — and that is completely okay.',
    habits: [
      { id: 'c1-1', label: 'Notices budget or space limits', status: 'seen', example: 'Kept choice inside the limit.' },
      { id: 'c1-2', label: 'Compares two helpful choices', status: 'starting', example: 'Weighed two good options.' },
      { id: 'c1-3', label: 'Spots a hidden cost', status: 'starting', example: 'Noticed a higher cost on one pick.' },
      { id: 'c1-4', label: 'Adjusts pick to fit limits', status: 'not_yet', example: 'Coming up in trade-off missions.' },
      { id: 'c1-5', label: 'Names what matters most here', status: 'not_yet', example: 'Coming up in thinking sheets.' },
      { id: 'c1-6', label: 'Accepts a balanced choice', status: 'not_yet', example: 'Coming up in thinking sheets.' },
    ],
  },
  {
    id: 'updating-views',
    code: 'C2',
    name: 'Changing Mind Gently',
    shortName: 'Mind Shift',
    simpleMeaning: 'Updating a first idea when new clues show something else.',
    homeQuestion: 'Did a new clue change your first idea today?',
    notYetNote: 'Not tried much yet in this time — and that is completely okay.',
    habits: [
      { id: 'c2-1', label: 'Changes guess after new clue', status: 'seen', example: 'Updated rule after second try.' },
      { id: 'c2-2', label: 'Stays sure when clue backs it', status: 'seen', example: 'Kept idea when clues matched.' },
      { id: 'c2-3', label: 'Says why mind changed', status: 'starting', example: 'Shared what shifted the choice.' },
      { id: 'c2-4', label: 'Tries again without giving up', status: 'seen', example: 'Tried another way after a miss.' },
      { id: 'c2-5', label: 'Notices a surprise result', status: 'not_yet', example: 'Coming up in next missions.' },
      { id: 'c2-6', label: 'Compares before and after idea', status: 'not_yet', example: 'Coming up in next missions.' },
    ],
  },
  {
    id: 'reflecting',
    code: 'C3',
    name: 'Looking Back & Learning',
    shortName: 'Looking Back',
    simpleMeaning: 'Seeing what helped and what to try next time.',
    homeQuestion: 'What helped you most today — and what is next?',
    notYetNote: 'Not tried much yet in this time — and that is completely okay.',
    habits: [
      { id: 'c3-1', label: 'Names what helped solve it', status: 'starting', example: 'Noted which clue helped.' },
      { id: 'c3-2', label: 'Picks a tip for next time', status: 'not_yet', example: 'Coming up in reflection steps.' },
      { id: 'c3-3', label: 'Writes a thought in own words', status: 'seen', example: 'Typed a short note on what happened.' },
      { id: 'c3-4', label: 'Spots a tricky part of the task', status: 'not_yet', example: 'Coming up in thinking sheets.' },
      { id: 'c3-5', label: 'Feels proud of trying, not just winning', status: 'not_yet', example: 'Coming up in next missions.' },
      { id: 'c3-6', label: 'Ready to explore at own pace', status: 'starting', example: 'Explored at an easy pace.' },
    ],
  },
];
