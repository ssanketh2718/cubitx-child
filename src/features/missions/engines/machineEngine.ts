/**
 * CUBITX CRACK THE MACHINE PURE ENGINE
 * Subordinate to Master Framework V1.2 & CIX-MDF-001 / CIX-Z1-001
 * Multi-level progression engine with Quad-Model separation.
 */

export interface CandidateRule {
  readonly id: string;
  readonly label: string;
  readonly formulaDisplay: string;
  readonly transform: (input: number) => number;
}

export interface MachineObservation {
  readonly input: number;
  readonly output: number;
}

export interface RulePrediction {
  readonly ruleId: string;
  readonly label: string;
  readonly predictedOutput: number;
  readonly matchesObservedOutput?: boolean;
}

export interface ProbeResult {
  readonly observation: MachineObservation;
  readonly predictions: readonly RulePrediction[];
  readonly discriminated: boolean;
  readonly remainingCandidateIds: readonly string[];
}

export interface MachineLevelDefinition {
  readonly levelId: string;
  readonly levelNumber: number;
  readonly title: string;
  readonly missionVersion: string;
  readonly hiddenRule: CandidateRule;
  readonly candidateRules: readonly CandidateRule[];
  readonly initialObservations: readonly MachineObservation[];
  readonly allowedProbes: readonly number[];
}

export function validateLevel(level: MachineLevelDefinition): void {
  const candidateIds = level.candidateRules.map((r) => r.id);
  if (new Set(candidateIds).size !== candidateIds.length) {
    throw new Error(`[VALIDATOR] Duplicate candidate IDs in level ${level.levelId}`);
  }

  const hiddenIncluded = level.candidateRules.some((r) => r.id === level.hiddenRule.id);
  if (!hiddenIncluded) {
    throw new Error(`[VALIDATOR] Hidden rule missing from candidates in level ${level.levelId}`);
  }

  for (const obs of level.initialObservations) {
    if (level.hiddenRule.transform(obs.input) !== obs.output) {
      throw new Error(`[VALIDATOR] Hidden rule contradicts initial observation in ${level.levelId}`);
    }
    for (const rule of level.candidateRules) {
      if (rule.transform(obs.input) !== obs.output) {
        throw new Error(`[VALIDATOR] Candidate "${rule.id}" contradicts initial observation in ${level.levelId}`);
      }
    }
  }

  let hasDiscriminatingProbe = false;
  for (const probe of level.allowedProbes) {
    const outputs = new Set(level.candidateRules.map((r) => r.transform(probe)));
    if (outputs.size > 1) {
      hasDiscriminatingProbe = true;
      break;
    }
  }

  if (!hasDiscriminatingProbe) {
    throw new Error(`[VALIDATOR] No probe discriminates between candidates in ${level.levelId}`);
  }
}

export function runProbe(
  level: MachineLevelDefinition,
  input: number,
  priorHistory: readonly MachineObservation[] = []
): ProbeResult {
  const output = level.hiddenRule.transform(input);
  const currentObs: MachineObservation = { input, output };
  const allObservations = [...priorHistory, currentObs];

  const predictions: RulePrediction[] = level.candidateRules.map((rule) => {
    const predicted = rule.transform(input);
    return {
      ruleId: rule.id,
      label: rule.label,
      predictedOutput: predicted,
      matchesObservedOutput: predicted === output,
    };
  });

  const uniqueOutputs = new Set(predictions.map((p) => p.predictedOutput));
  const discriminated = uniqueOutputs.size > 1;

  const remainingCandidateIds = level.candidateRules
    .filter((rule) => allObservations.every((obs) => rule.transform(obs.input) === obs.output))
    .map((r) => r.id);

  return {
    observation: currentObs,
    predictions,
    discriminated,
    remainingCandidateIds,
  };
}

/**
 * 4 PROGRESSIVE LEVELS:
 * Level 1: Multiply by self (x*x) vs Double (x*2). Initial: 2 -> 4.
 * Level 2: Triple minus 1 (3x - 1) vs Add 3 (x + 3). Initial: 2 -> 5.
 * Level 3: Add 6 (x + 6) vs Multiply by 4 (4x - 3). Initial: 3 -> 9.
 * Level 4: Half plus 2 (x/2 + 2) vs Subtract from 8 (8 - x). Initial: 4 -> 4.
 */
export const MACHINE_LEVELS: Record<number, MachineLevelDefinition> = {
  1: {
    levelId: 'cix_machine_lvl_1',
    levelNumber: 1,
    title: 'The Square vs Double Hopper',
    missionVersion: '1.3.0',
    hiddenRule: {
      id: 'rule_square',
      label: 'Multiply the number by itself',
      formulaDisplay: 'Input × Input',
      transform: (x: number) => x * x,
    },
    candidateRules: [
      {
        id: 'rule_square',
        label: 'Multiply the number by itself',
        formulaDisplay: 'Input × Input',
        transform: (x: number) => x * x,
      },
      {
        id: 'rule_double',
        label: 'Double the number',
        formulaDisplay: 'Input × 2',
        transform: (x: number) => x * 2,
      },
    ],
    initialObservations: [{ input: 2, output: 4 }],
    allowedProbes: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
  2: {
    levelId: 'cix_machine_lvl_2',
    levelNumber: 2,
    title: 'The Offset Chamber',
    missionVersion: '1.3.0',
    hiddenRule: {
      id: 'rule_triple_sub1',
      label: 'Multiply by 3, then subtract 1',
      formulaDisplay: '(Input × 3) − 1',
      transform: (x: number) => x * 3 - 1,
    },
    candidateRules: [
      {
        id: 'rule_triple_sub1',
        label: 'Multiply by 3, then subtract 1',
        formulaDisplay: '(Input × 3) − 1',
        transform: (x: number) => x * 3 - 1,
      },
      {
        id: 'rule_add3',
        label: 'Add 3 to the number',
        formulaDisplay: 'Input + 3',
        transform: (x: number) => x + 3,
      },
    ],
    initialObservations: [{ input: 2, output: 5 }],
    allowedProbes: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
};

// Validate all authored levels at startup
Object.values(MACHINE_LEVELS).forEach(validateLevel);