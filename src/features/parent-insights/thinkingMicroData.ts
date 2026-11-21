export type MicroState = 'observed' | 'early' | 'unseen';

export interface MicroBehaviourItem {
  id: string;
  title: string;
  state: MicroState;
  stateLabel: 'Seen in activity' | 'Early glimpse' | 'Not seen yet';
  momentNote: string;
}

export interface ThinkingAreaCluster {
  id: string;
  code: string;
  label: string;
  shortTag: string;
  warmSummary: string;
  homePrompt: string;
  boundaryNote: string;
  items: MicroBehaviourItem[];
}

export const THINKING_AREA_CLUSTERS: ThinkingAreaCluster[] = [
  {
    id: 'questions',
    code: 'A1',
    label: 'Asking Good Questions',
    shortTag: 'Questions',
    warmSummary: 'Wondering aloud and asking helpful questions before picking an answer.',
    homePrompt: 'What else would you like to know before choosing?',
    boundaryNote: 'Only shows questions noticed in activities so far—never a measure of curiosity overall.',
    items: [
      { id: 'a1-1', title: 'Asks what changes the result', state: 'observed', stateLabel: 'Seen in activity', momentNote: 'Asked what shifts when one condition changes.' },
      { id: 'a1-2', title: 'Wonders why a rule behaves that way', state: 'observed', stateLabel: 'Seen in activity', momentNote: 'Asked why two inputs led to similar outcomes.' },
      { id: 'a1-3', title: 'Pauses to ask before guessing', state: 'early', stateLabel: 'Early glimpse', momentNote: 'Slowed down before making a quick pick.' },
      { id: 'a1-4', title: 'Compares two questions to try', state: 'early', stateLabel: 'Early glimpse', momentNote: 'Looked at which question fit the moment better.' },
      { id: 'a1-5', title: 'Connects a question to a clue', state: 'unseen', stateLabel: 'Not seen yet', momentNote: 'No activity for this step yet—completely normal.' },
      { id: 'a1-6', title: 'Follows up after the first answer', state: 'unseen', stateLabel: 'Not seen yet', momentNote: 'No activity for this step yet—completely normal.' },
    ],
  },
  {
    id: 'missing-clues',
    code: 'A2',
    label: 'Spotting Missing Clues',
    shortTag: 'Missing Clues',
    warmSummary: 'Noticing when a helpful fact or detail has not been shown yet.',
    homePrompt: 'What detail might we still be missing?',
    boundaryNote: 'A quiet spot here just means fewer missing-clue moments came up in this window.',
    items: [
      { id: 'a2-1', title: 'Spots an incomplete clue', state: 'observed', stateLabel: 'Seen in activity', momentNote: 'Noticed one part of the clue was left out.' },
      { id: 'a2-2', title: 'Waits when facts feel partial', state: 'early', stateLabel: 'Early glimpse', momentNote: 'Held back before locking in an answer.' },
      { id: 'a2-3', title: 'Checks rules or limits first', state: 'observed', stateLabel: 'Seen in activity', momentNote: 'Looked at the boundary rules before acting.' },
      { id: 'a2-4', title: 'Notices hidden conditions', state: 'early', stateLabel: 'Early glimpse', momentNote: 'Spotted a condition tucked inside the task.' },
      { id: 'a2-5', title: 'Names one missing piece clearly', state: 'unseen', stateLabel: 'Not seen yet', momentNote: 'No activity for this step yet—completely normal.' },
      { id: 'a2-6', title: 'Keeps known facts apart from guesses', state: 'unseen', stateLabel: 'Not seen yet', momentNote: 'No activity for this step yet—completely normal.' },
    ],
  },
  {
    id: 'reasons',
    code: 'B1',
    label: 'Giving Clear Reasons',
    shortTag: 'Reasons',
    warmSummary: 'Sharing why a choice makes sense in everyday, honest words.',
    homePrompt: 'What made that choice feel right to you?',
    boundaryNote: 'Captures how reasons are shared in tasks—not a test of speaking or writing skill.',
    items: [
      { id: 'b1-1', title: 'Gives a reason for a choice', state: 'observed', stateLabel: 'Seen in activity', momentNote: 'Shared why an option fit what they saw.' },
      { id: 'b1-2', title: 'Links choice to what happened', state: 'observed', stateLabel: 'Seen in activity', momentNote: 'Connected the result back to their pick.' },
      { id: 'b1-3', title: 'Uses simple, clear words', state: 'early', stateLabel: 'Early glimpse', momentNote: 'Put the thought into short, direct lines.' },
      { id: 'b1-4', title: 'Goes beyond a one-word answer', state: 'early', stateLabel: 'Early glimpse', momentNote: 'Added a short reason alongside the choice.' },
      { id: 'b1-5', title: 'Checks if the reason fits all parts', state: 'unseen', stateLabel: 'Not seen yet', momentNote: 'No activity for this step yet—completely normal.' },
      { id: 'b1-6', title: 'Explains the choice in a new way', state: 'unseen', stateLabel: 'Not seen yet', momentNote: 'No activity for this step yet—completely normal.' },
    ],
  },
  {
    id: 'evidence',
    code: 'B2',
    label: 'Using Clues & Evidence',
    shortTag: 'Clues',
    warmSummary: 'Looking closely at real clues before deciding what is going on.',
    homePrompt: 'Which clue helped you decide just now?',
    boundaryNote: 'Reflects clue-checking inside CubitX activities—not a permanent skill label.',
    items: [
      { id: 'b2-1', title: 'Tests more than one clue', state: 'observed', stateLabel: 'Seen in activity', momentNote: 'Tried multiple probes before picking a rule.' },
      { id: 'b2-2', title: 'Compares two choices side by side', state: 'observed', stateLabel: 'Seen in activity', momentNote: 'Weighed two options before settling.' },
      { id: 'b2-3', title: 'Points to a clue behind a choice', state: 'observed', stateLabel: 'Seen in activity', momentNote: 'Backed up the choice with what showed up.' },
      { id: 'b2-4', title: 'Re-checks a clue when unsure', state: 'early', stateLabel: 'Early glimpse', momentNote: 'Returned to an earlier clue to double-check.' },
      { id: 'b2-5', title: 'Picks a stronger clue over a weak one', state: 'early', stateLabel: 'Early glimpse', momentNote: 'Moved toward the clearer clue in the task.' },
      { id: 'b2-6', title: 'Notices when a clue does not fit', state: 'unseen', stateLabel: 'Not seen yet', momentNote: 'No activity for this step yet—completely normal.' },
    ],
  },
  {
    id: 'weak-logic',
    code: 'B3',
    label: 'Spotting Shaky Ideas',
    shortTag: 'Shaky Ideas',
    warmSummary: 'Noticing when a quick guess or big claim has a gap.',
    homePrompt: 'Could there be a gap in that idea?',
    boundaryNote: 'Spotting gaps takes practice across many situations—unseen items are simply not tried yet.',
    items: [
      { id: 'b3-1', title: 'Questions a fast first guess', state: 'early', stateLabel: 'Early glimpse', momentNote: 'Paused on a quick guess before keeping it.' },
      { id: 'b3-2', title: 'Notices a skipped step', state: 'early', stateLabel: 'Early glimpse', momentNote: 'Spotted a jump where a step was missing.' },
      { id: 'b3-3', title: 'Tests if an idea still holds', state: 'observed', stateLabel: 'Seen in activity', momentNote: 'Checked whether the pattern held up again.' },
      { id: 'b3-4', title: 'Spots an over-broad claim', state: 'unseen', stateLabel: 'Not seen yet', momentNote: 'No activity for this step yet—completely normal.' },
      { id: 'b3-5', title: 'Looks for a case that tests the rule', state: 'unseen', stateLabel: 'Not seen yet', momentNote: 'No activity for this step yet—completely normal.' },
      { id: 'b3-6', title: 'Stays calm when an idea falls short', state: 'unseen', stateLabel: 'Not seen yet', momentNote: 'No activity for this step yet—completely normal.' },
    ],
  },
  {
    id: 'trade-offs',
    code: 'C1',
    label: 'Weighing Give & Take',
    shortTag: 'Give & Take',
    warmSummary: 'Balancing what you gain against what you give up when choosing.',
    homePrompt: 'What did we gain, and what did we trade off?',
    boundaryNote: 'Shows how real limits were handled in recent tasks—not a grade.',
    items: [
      { id: 'c1-1', title: 'Notices budget or space limits', state: 'observed', stateLabel: 'Seen in activity', momentNote: 'Worked within the given limits on a choice.' },
      { id: 'c1-2', title: 'Compares two helpful options', state: 'early', stateLabel: 'Early glimpse', momentNote: 'Looked at two good paths before picking.' },
      { id: 'c1-3', title: 'Spots a cost or trade-off', state: 'early', stateLabel: 'Early glimpse', momentNote: 'Noticed what one choice cost in return.' },
      { id: 'c1-4', title: 'Adjusts choice to fit limits', state: 'unseen', stateLabel: 'Not seen yet', momentNote: 'No activity for this step yet—completely normal.' },
      { id: 'c1-5', title: 'Names what matters most in the moment', state: 'unseen', stateLabel: 'Not seen yet', momentNote: 'No activity for this step yet—completely normal.' },
      { id: 'c1-6', title: 'Settles on a balanced choice', state: 'unseen', stateLabel: 'Not seen yet', momentNote: 'No activity for this step yet—completely normal.' },
    ],
  },
  {
    id: 'mind-shift',
    code: 'C2',
    label: 'Changing Mind Gently',
    shortTag: 'Mind Shift',
    warmSummary: 'Being open to shifting a first idea when new clues appear.',
    homePrompt: 'Did anything new make you change your mind today?',
    boundaryNote: 'Changing your mind when new clues appear is healthy flexibility—never a mistake.',
    items: [
      { id: 'c2-1', title: 'Updates guess after a new clue', state: 'observed', stateLabel: 'Seen in activity', momentNote: 'Shifted the rule after seeing another clue.' },
      { id: 'c2-2', title: 'Stands by idea when clues fit', state: 'observed', stateLabel: 'Seen in activity', momentNote: 'Kept the choice when new clues lined up.' },
      { id: 'c2-3', title: 'Shares what shifted the view', state: 'early', stateLabel: 'Early glimpse', momentNote: 'Pointed to what changed their mind.' },
      { id: 'c2-4', title: 'Tries another way after a miss', state: 'observed', stateLabel: 'Seen in activity', momentNote: 'Kept exploring with a fresh approach.' },
      { id: 'c2-5', title: 'Notices a surprising turn', state: 'unseen', stateLabel: 'Not seen yet', momentNote: 'No activity for this step yet—completely normal.' },
      { id: 'c2-6', title: 'Compares before and after thinking', state: 'unseen', stateLabel: 'Not seen yet', momentNote: 'No activity for this step yet—completely normal.' },
    ],
  },
  {
    id: 'looking-back',
    code: 'C3',
    label: 'Looking Back & Noticing',
    shortTag: 'Looking Back',
    warmSummary: 'Noticing what helped along the way and what feels fun to try next.',
    homePrompt: 'What helped you today — what do you want to try next?',
    boundaryNote: 'Reflection moments grow naturally over time; empty spots simply mean no prompt there yet.',
    items: [
      { id: 'c3-1', title: 'Notices what helped solve it', state: 'early', stateLabel: 'Early glimpse', momentNote: 'Named a helpful clue or step.' },
      { id: 'c3-2', title: 'Picks a gentle tip for next time', state: 'unseen', stateLabel: 'Not seen yet', momentNote: 'No activity for this step yet—completely normal.' },
      { id: 'c3-3', title: 'Writes a thought in own words', state: 'observed', stateLabel: 'Seen in activity', momentNote: 'Left a short note in their own words.' },
      { id: 'c3-4', title: 'Spots a tricky part of the task', state: 'unseen', stateLabel: 'Not seen yet', momentNote: 'No activity for this step yet—completely normal.' },
      { id: 'c3-5', title: 'Values trying, not just getting it right', state: 'unseen', stateLabel: 'Not seen yet', momentNote: 'No activity for this step yet—completely normal.' },
      { id: 'c3-6', title: 'Explores at an unhurried pace', state: 'early', stateLabel: 'Early glimpse', momentNote: 'Moved through the activity at their own pace.' },
    ],
  },
];
