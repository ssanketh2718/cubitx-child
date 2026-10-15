// src/core/analytics/scoring.ts
//
// Aggregates parameters and behaviours into dimension scores.
// Every dimension produces a score 0-100 and a level 0-4.

import type { ParameterSet, ParameterResult } from './parameters';
import type { BehaviourSet } from './behavioural';

export type Level = 0 | 1 | 2 | 3 | 4;

export interface DimensionScore {
  dimension: 'interpretation' | 'reasoning' | 'openMindedness' | 'evaluation' | 'revision';
  score: number;          // 0-100
  level: Level;           // 0-4
  parameters: ParameterResult[];
  strongest: ParameterResult | null;
  weakest: ParameterResult | null;
}

export interface FullScore {
  dimensions: DimensionScore[];
  composite: number;      // 0-100
  totalEvidence: string[]; // top 3 quote-worthy evidence snippets
}

// Level thresholds
export function levelFromScore(score: number): Level {
  if (score >= 75) return 4; // Strong
  if (score >= 50) return 3; // Solid
  if (score >= 25) return 2; // Growing
  return score > 0 ? 1 : 0;  // Just starting / Absent
}

export const LEVEL_LABELS: Record<Level, string> = {
  0: 'Not seen yet',
  1: 'Just starting',
  2: 'Growing',
  3: 'Solid',
  4: 'Strong',
};

// Weighted averages — Reasoning counts double (research priority)
const DIMENSION_WEIGHTS = {
  interpretation: 0.15,
  reasoning: 0.35,
  openMindedness: 0.20,
  evaluation: 0.20,
  revision: 0.10,
};

// Per-parameter weights within each dimension
const PARAMETER_WEIGHTS: Record<string, number> = {
  // Interpretation
  I1: 1.0, I2: 1.5, I3: 0.8, I4: 1.0,
  // Reasoning
  R1: 1.5, R3: 1.3, R4: 1.2, R6: 1.5, R9: 1.0,
  // Open-mindedness
  O1: 1.5, O4: 1.0, O5: 1.2, O7: 1.5,
  // Evaluation
  E1: 1.5, E3: 1.3, E6: 1.0,
  // Revision
  M1: 1.5, M2: 1.3, M5: 1.2,
};

function scoreParameterSet(params: ParameterResult[]): number {
  if (params.length === 0) return 0;
  let weightedSum = 0;
  let totalWeight = 0;
  for (const p of params) {
    const w = PARAMETER_WEIGHTS[p.code] ?? 1;
    // Each parameter is 0-5, scale to 0-100
    weightedSum += (p.level / 5) * 100 * w;
    totalWeight += w;
  }
  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}

function findStrongest(params: ParameterResult[]): ParameterResult | null {
  const sorted = [...params].sort((a, b) => b.level - a.level);
  return sorted[0]?.level > 0 ? sorted[0] : null;
}

function findWeakest(params: ParameterResult[]): ParameterResult | null {
  const sorted = [...params].sort((a, b) => a.level - b.level);
  return sorted[0]?.level <= 2 ? sorted[0] : null;
}

function buildDimension(
  name: DimensionScore['dimension'],
  params: ParameterResult[]
): DimensionScore {
  const score = scoreParameterSet(params);
  return {
    dimension: name,
    score,
    level: levelFromScore(score),
    parameters: params,
    strongest: findStrongest(params),
    weakest: findWeakest(params),
  };
}

// Behavioural contribution — boosts scores when thinking signals are strong
function behaviouralBoost(behaviours?: BehaviourSet): number {
  if (!behaviours) return 0;
  const all = [
    behaviours.reflection,
    behaviours.perseverance,
    behaviours.engagement,
    behaviours.deliberation,
  ];
  const avg = all.reduce((sum, b) => sum + (b.level / 5) * 100, 0) / all.length;
  // Behaviour contributes up to +10 to composite
  return Math.round((avg / 100) * 10);
}

// ─── Main API ────────────────────────────────────────────────

export function computeFullScore(input: {
  parameters: ParameterSet;
  behaviours?: BehaviourSet;
}): FullScore {
  const { parameters, behaviours } = input;

  const dimensions: DimensionScore[] = [
    buildDimension('interpretation', parameters.interpretation),
    buildDimension('reasoning', parameters.reasoning),
    buildDimension('openMindedness', parameters.openMindedness),
    buildDimension('evaluation', parameters.evaluation),
    buildDimension('revision', parameters.revision),
  ];

  const composite = Math.round(
    dimensions.reduce((sum, d) => {
      const weight = DIMENSION_WEIGHTS[d.dimension];
      return sum + d.score * weight;
    }, 0) + behaviouralBoost(behaviours)
  );

  // Top 3 evidence snippets across all parameters
  const evidence = dimensions
    .flatMap(d => d.parameters)
    .filter(p => p.evidence.length > 5)
    .sort((a, b) => b.level - a.level)
    .slice(0, 3)
    .map(p => p.evidence);

  return {
    dimensions,
    composite: Math.min(100, composite),
    totalEvidence: evidence,
  };
}
