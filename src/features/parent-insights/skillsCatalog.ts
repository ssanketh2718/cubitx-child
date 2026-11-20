export type SkillCode = 'A1' | 'A2' | 'B1' | 'B2' | 'B3' | 'C1' | 'C2' | 'C3';

export type EvidenceCoverageState =
  | 'evidence_available'
  | 'limited_evidence'
  | 'awaiting_review'
  | 'not_observed';

export interface SkillDefinition {
  code: SkillCode;
  name: string;
  shortLabel: string;
  pillar: 'Inquiry' | 'Reasoning' | 'Judgement & Revision';
  homeSummary: string;
  whatYouMightNotice: string[];
  dinnerPrompt: string;
  frameworkDefinition: string;
  primaryParameters: string[];
  scoringMode: string;
}

/**
 * Official eight-skill reporting layer governed by CubitX Master Framework V1.2.
 * No composite scores, trait labels, or unapproved skills.
 */
export const V12_SKILLS: readonly SkillDefinition[] = [
  {
    code: 'A1',
    name: 'Asking good questions',
    shortLabel: 'Questions',
    pillar: 'Inquiry',
    homeSummary:
      'Asks specific, answerable questions that help separate two possible explanations.',
    whatYouMightNotice: [
      'Asks "how could we check?" instead of stopping at the first guess.',
      'Asks targeted follow-up questions when a story sounds incomplete.',
    ],
    dinnerPrompt:
      'If someone made a bold claim at school today, what one question would help you test it?',
    frameworkDefinition:
      'Asks a relevant, answerable question that would help tell competing possibilities apart.',
    primaryParameters: ['V1-only indicator (A1)'],
    scoringMode: 'Human or bounded rubric review on open response',
  },
  {
    code: 'A2',
    name: 'Spotting missing information',
    shortLabel: 'Missing Info',
    pillar: 'Inquiry',
    homeSummary:
      'Notices what is still unknown before jumping to a confident conclusion.',
    whatYouMightNotice: [
      'Pauses to say "we do not know enough yet" instead of guessing immediately.',
      'Names one specific fact that would make a decision clearer.',
    ],
    dinnerPrompt:
      'Before we decide on a weekend plan, what important detail are we still missing?',
    frameworkDefinition:
      'Identifies what is unknown or needed before reaching a confident conclusion.',
    primaryParameters: [
      'M5 (Uncertainty naming)',
      'R8 (Sufficiency)',
      'E9 (Sufficiency judgement)',
    ],
    scoringMode: 'Deterministic rules (tap) + open response',
  },
  {
    code: 'B1',
    name: 'Giving reasons',
    shortLabel: 'Reasons',
    pillar: 'Reasoning',
    homeSummary:
      'Explains why a choice makes sense using details from the situation, not just repeating the answer.',
    whatYouMightNotice: [
      'Connects a conclusion to a concrete "because" from the situation.',
      'Avoids circular answers like "it works because it is right."',
    ],
    dinnerPrompt:
      'What made you lean toward that choice over the other one?',
    frameworkDefinition:
      'Gives a relevant, situation-specific reason that adds information rather than restating the claim.',
    primaryParameters: ['R1', 'R2', 'R3', 'R5'],
    scoringMode: 'Deterministic rules (tap) + open response',
  },
  {
    code: 'B2',
    name: 'Using evidence',
    shortLabel: 'Evidence',
    pillar: 'Reasoning',
    homeSummary:
      'Points to a specific clue, measurement, or observation to back up an idea.',
    whatYouMightNotice: [
      'Checks clues or observations before committing to an explanation.',
      'Compares two clues side by side instead of relying on memory.',
    ],
    dinnerPrompt:
      'Which clue or detail convinced you the most—and why?',
    frameworkDefinition:
      'Points to a specific clue, observation, or source to support or qualify a claim.',
    primaryParameters: ['R6 (Evidence citation)', 'I1', 'I5', 'E4'],
    scoringMode: 'Deterministic rules (tap)',
  },
  {
    code: 'B3',
    name: 'Detecting weak reasoning',
    shortLabel: 'Weak Claims',
    pillar: 'Reasoning',
    homeSummary:
      'Spots when a claim relies on a tiny sample, a biased source, or an unsupported assumption.',
    whatYouMightNotice: [
      'Questions "everyone says so" or single-example claims.',
      'Notices when a confident speaker or AI assistant skips important facts.',
    ],
    dinnerPrompt:
      'Can you think of a claim you saw online or heard recently that sounded confident but had weak proof?',
    frameworkDefinition:
      'Names what makes a claim, source, or inference weak (e.g., small sample, bias, correlation-as-cause).',
    primaryParameters: ['E1', 'E2', 'E3', 'E5', 'E6'],
    scoringMode: 'Deterministic rules (flaw identification)',
  },
  {
    code: 'C1',
    name: 'Weighing trade-offs',
    shortLabel: 'Trade-offs',
    pillar: 'Judgement & Revision',
    homeSummary:
      'Compares benefits, downsides, or competing explanations before choosing.',
    whatYouMightNotice: [
      'Recognises that solving one problem can create a cost somewhere else.',
      'Compares two explanations fairly before picking one.',
    ],
    dinnerPrompt:
      'If we make that choice, what do we gain—and what might we have to give up?',
    frameworkDefinition:
      'Compares benefits, costs, risks, or competing explanations using separate decision and explanation anchors.',
    primaryParameters: ['R9', 'O1', 'E7', 'E10'],
    scoringMode: 'Deterministic rules + open response',
  },
  {
    code: 'C2',
    name: 'Updating on evidence',
    shortLabel: 'Updating',
    pillar: 'Judgement & Revision',
    homeSummary:
      'Changes their mind when strong new evidence appears—and holds firm when weak evidence tries to mislead them.',
    whatYouMightNotice: [
      'Willing to revise a first guess without embarrassment when new facts show up.',
      'Does not fold just because a confident voice disagrees without proof.',
    ],
    dinnerPrompt:
      'What new fact would actually make you change your mind about something you believe?',
    frameworkDefinition:
      'Holds or revises a view in proportion to evidence strength and direction, with an evidence-linked reason.',
    primaryParameters: ['M1', 'M3', 'O7', 'O10'],
    scoringMode: 'Revision quality matrix (requires ≥5 varied challenges for summary)',
  },
  {
    code: 'C3',
    name: 'Reflecting',
    shortLabel: 'Reflecting',
    pillar: 'Judgement & Revision',
    homeSummary:
      'Notices which clue or strategy worked best and what to test next time.',
    whatYouMightNotice: [
      'Can look back and say "testing that second clue is what unlocked it."',
      'Identifies a better next step after an experiment does not work.',
    ],
    dinnerPrompt:
      'What strategy helped you figure out a tricky problem this week?',
    frameworkDefinition:
      'Identifies which clue or strategy mattered most and articulates what to try next.',
    primaryParameters: ['M2', 'M4', 'M7'],
    scoringMode: 'Human or bounded rubric review on open response',
  },
] as const;

export interface ObservedMoment {
  id: string;
  itemKey: string;
  title: string;
  engine: string;
  submittedAt: string;
  verbatimText?: string;
  pickedIndex?: number;
  testsBeforeGuess?: number;
  wentBackToTest?: boolean;
  hintsUsed?: number;
  changedAnswerCount?: number;
}