// src/core/analytics/socraticEngine.ts
// Real-time deterministic Socratic Elenchus, Lipman Counter-Example & Finnish Sisu evaluator.

import { countMarkers } from './markers';

export type SocraticMoveType =
  | 'elenchus_trap'          // Exposes flaw in a chosen trap option
  | 'circular_probe'         // Breaks tautological ("because it is") answers
  | 'lipman_counterexample'  // Challenges unjustified "always/never" absolutes
  | 'missing_reason_nudge'   // Prompts for evidence when claim has 0 causal links
  | 'sisu_decoy_challenge';  // Tests intellectual grit when initial reasoning is strong

export interface SocraticPromptResult {
  triggered: boolean;
  moveType: SocraticMoveType | null;
  prompt: string;
  targetSkillCode: 'A1' | 'B1' | 'B3' | 'C2';
}

export function evaluateSocraticMove(input: {
  selectedOptionId?: string;
  optionSocraticMap?: Record<string, string>;
  freeText?: string;
  decoyPrompt?: string;
  hasStrongInitialReasoning?: boolean;
}): SocraticPromptResult {
  const {
    selectedOptionId,
    optionSocraticMap = {},
    freeText = '',
    decoyPrompt,
    hasStrongInitialReasoning = false,
  } = input;

  // 1. Mission-specific Socratic Elenchus for a trap/incomplete option
  if (selectedOptionId && optionSocraticMap[selectedOptionId]) {
    return {
      triggered: true,
      moveType: 'elenchus_trap',
      prompt: optionSocraticMap[selectedOptionId],
      targetSkillCode: 'B3',
    };
  }

  const trimmed = freeText.trim();
  if (trimmed.length >= 3) {
    // 2. Circular reasoning detector ("because it is", "aisa hi hai", "असंच असतं")
    if (countMarkers(trimmed, 'circular') > 0) {
      return {
        triggered: true,
        moveType: 'circular_probe',
        prompt:
          'You said that is just how it happens. Which exact clue in the setup made it happen?',
        targetSkillCode: 'B1',
      };
    }

    // 3. Lipman P4C Counter-Example check on unjustified absolutes
    const hasAbsolute = countMarkers(trimmed, 'absolute') > 0;
    const hasHedge = countMarkers(trimmed, 'hedge') > 0;
    if (hasAbsolute && !hasHedge) {
      return {
        triggered: true,
        moveType: 'lipman_counterexample',
        prompt:
          'Would that still happen every single time if we changed one part of the setup?',
        targetSkillCode: 'C2',
      };
    }

    // 4. Claim without causal link
    if (countMarkers(trimmed, 'causal') === 0 && trimmed.split(/\s+/).length >= 4) {
      return {
        triggered: true,
        moveType: 'missing_reason_nudge',
        prompt: 'Good start. What clue or number convinced you of that?',
        targetSkillCode: 'B1',
      };
    }
  }

  // 5. Finnish Sisu Decoy Twist when initial reasoning is solid
  if (hasStrongInitialReasoning && decoyPrompt) {
    return {
      triggered: true,
      moveType: 'sisu_decoy_challenge',
      prompt: decoyPrompt,
      targetSkillCode: 'C2',
    };
  }

  return {
    triggered: false,
    moveType: null,
    prompt: '',
    targetSkillCode: 'B1',
  };
}