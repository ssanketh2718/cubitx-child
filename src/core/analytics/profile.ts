// src/core/analytics/profile.ts
import type { SavedResponse } from '../store';
import { detectParameters, type ParameterSet } from './parameters';
import { detectBehaviours, type BehaviourSignals } from './behavioural';
import {
  computeFullScore,
  type DimensionScore,
  type Level,
  LEVEL_LABELS,
} from './scoring';

export type { Level, DimensionScore };
export { LEVEL_LABELS };

export interface AnswerAnalysis {
  itemKey: string;
  submittedAt: string;
  answerText: string;
  parameters: ParameterSet;
  dimensions: DimensionScore[];
  composite: number;
  evidence: string[];
}

export interface ThinkingProfile {
  hasEnoughData: boolean;
  totalAnswers: number;
  answersThisWeek: number;
  dimensions: DimensionScore[];      // averaged across all answers
  composite: number;                 // averaged
  lastWeekComposite: number | null;
  strongest: DimensionScore | null;
  weakest: DimensionScore | null;
  recentAnswers: AnswerAnalysis[];   // last 5
  evidence: string[];                // top 3 quotes for parent view
}

// ─── Time helpers ────────────────────────────────────────────

function daysAgo(iso: string): number {
  const then = new Date(iso);
  then.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.floor((now.getTime() - then.getTime()) / 86400000);
}

// ─── Single-answer analysis ──────────────────────────────────

function analyseAnswer(
  itemKey: string,
  response: SavedResponse
): AnswerAnalysis | null {
  const text = response.text?.trim() ?? '';
  if (text.length < 3) return null;

  const params = detectParameters({
    answer: text,
    question: '',
    sceneKeywords: [],
  });

  const behaviours = detectBehaviours({
    timeToFirstTapMs: (response.behaviours as any)?.timeToFirstTapMs,
    totalTimeMs: (response.behaviours as any)?.secondsOnItem
      ? (response.behaviours as any).secondsOnItem * 1000
      : undefined,
    backtrackCount: (response.behaviours as any)?.wentBackToTest ? 1 : 0,
    hintsUsed: 0,
    changedAnswerCount: 0,
  } as BehaviourSignals);

  const score = computeFullScore({ parameters: params, behaviours });

  return {
    itemKey,
    submittedAt: response.submittedAt,
    answerText: text,
    parameters: params,
    dimensions: score.dimensions,
    composite: score.composite,
    evidence: score.totalEvidence,
  };
}

// ─── Aggregate across answers ────────────────────────────────

function averageDimensions(all: AnswerAnalysis[]): DimensionScore[] {
  const names: DimensionScore['dimension'][] = [
    'interpretation',
    'reasoning',
    'openMindedness',
    'evaluation',
    'revision',
  ];

  return names.map(name => {
    const scores = all
      .flatMap(a => a.dimensions)
      .filter(d => d.dimension === name)
      .map(d => d.score);

    const avg = scores.length > 0
      ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length)
      : 0;

    // Best parameter across all answers for this dimension
    const allParams = all
      .flatMap(a => a.dimensions)
      .filter(d => d.dimension === name)
      .flatMap(d => d.parameters);

    const strongest = allParams.sort((a, b) => b.level - a.level)[0] ?? null;
    const weakest = allParams.sort((a, b) => a.level - b.level)[0] ?? null;

    // Level thresholds from score
    const level: Level = avg >= 75 ? 4 : avg >= 50 ? 3 : avg >= 25 ? 2 : avg > 0 ? 1 : 0;

    return {
      dimension: name,
      score: avg,
      level,
      parameters: [],
      strongest,
      weakest,
    };
  });
}

function averageComposite(all: AnswerAnalysis[]): number {
  if (all.length === 0) return 0;
  return Math.round(all.reduce((s, a) => s + a.composite, 0) / all.length);
}

// ─── Main API ────────────────────────────────────────────────

export function computeProfile(
  responses: Record<string, SavedResponse>
): ThinkingProfile {
  const entries = Object.entries(responses);

  // Analyse each
  const analysed: AnswerAnalysis[] = [];
  for (const [key, r] of entries) {
    const a = analyseAnswer(key, r);
    if (a) analysed.push(a);
  }

  // Split by time
  const thisWeek = analysed.filter(a => daysAgo(a.submittedAt) <= 6);
  const lastWeek = analysed.filter(a => {
    const d = daysAgo(a.submittedAt);
    return d >= 7 && d <= 13;
  });

  const dimensions = averageDimensions(thisWeek);
  const composite = averageComposite(thisWeek);
  const lastWeekComposite = lastWeek.length > 0 ? averageComposite(lastWeek) : null;

  // Strongest and weakest dimensions
  const sorted = [...dimensions].sort((a, b) => b.score - a.score);
  const strongest = sorted[0]?.score > 0 ? sorted[0] : null;
  const weakest = sorted[sorted.length - 1]?.score > 0 ? sorted[sorted.length - 1] : null;

  // Recent 5 answers
  const recentAnswers = [...analysed]
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
    .slice(0, 5);

  // Top evidence quotes
  const evidence = recentAnswers
    .flatMap(a => a.evidence)
    .filter(e => e.length > 10)
    .slice(0, 3);

  return {
    hasEnoughData: thisWeek.length >= 3,
    totalAnswers: analysed.length,
    answersThisWeek: thisWeek.length,
    dimensions,
    composite,
    lastWeekComposite,
    strongest,
    weakest,
    recentAnswers,
    evidence,
  };
}
