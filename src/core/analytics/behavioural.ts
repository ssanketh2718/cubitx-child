// src/core/analytics/behavioural.ts
//
// Non-verbal indicators — the parts of thinking that don't appear in writing.
// A child who pauses before answering is thinking.
// A child who taps instantly is guessing.
// These signals work in every language and every culture.

export interface BehaviourSignals {
  // Time from screen appearing to first tap — measures reflection
  timeToFirstTapMs?: number;
  // Total time on the item screen
  totalTimeMs?: number;
  // How many times did they go back to re-read?
  backtrackCount?: number;
  // Did they change their choice before submitting?
  changedAnswerCount?: number;
  // How many times did they use a hint?
  hintsUsed?: number;
  // Time per screen (for multi-screen missions)
  screenTimes?: number[];
}

export interface BehaviourResult {
  code: string;
  level: 0 | 1 | 2 | 3 | 4 | 5;
  evidence: string;
}

export interface BehaviourSet {
  reflection: BehaviourResult;
  perseverance: BehaviourResult;
  engagement: BehaviourResult;
  deliberation: BehaviourResult;
}

// ─── Detectors ───────────────────────────────────────────────

function B1_reflection(ms: number | undefined): BehaviourResult {
  if (ms === undefined) return { code: 'B1', level: 0, evidence: '' };
  // < 1.5s = impulsive, 1.5-4s = considered, 4-8s = reflective, > 8s = deep
  if (ms < 1500) return { code: 'B1', level: 1, evidence: 'Answered almost instantly' };
  if (ms < 4000) return { code: 'B1', level: 3, evidence: 'Took a moment to consider' };
  if (ms < 8000) return { code: 'B1', level: 4, evidence: 'Took time to reflect' };
  return { code: 'B1', level: 5, evidence: 'Deep reflection before answering' };
}

function B2_perseverance(hints: number, backtrack: number, changed: number): BehaviourResult {
  // Positive: backtracked OR changed answer without hints
  // Negative: used many hints OR changed many times without progress
  const total = backtrack + changed;
  if (total >= 2 && hints <= 1) return { code: 'B2', level: 5, evidence: 'Revised thinking without assistance' };
  if (total >= 1 && hints <= 1) return { code: 'B2', level: 4, evidence: 'Went back to reconsider' };
  if (hints === 0) return { code: 'B2', level: 3, evidence: 'Committed to first answer' };
  if (hints <= 2) return { code: 'B2', level: 2, evidence: `Used ${hints} hint${hints === 1 ? '' : 's'}` };
  return { code: 'B2', level: 1, evidence: `Needed ${hints} hints` };
}

function B3_engagement(totalTimeMs: number | undefined): BehaviourResult {
  if (totalTimeMs === undefined) return { code: 'B3', level: 0, evidence: '' };
  const seconds = totalTimeMs / 1000;
  // Too short = rushed; too long = disengaged/stuck
  if (seconds < 5) return { code: 'B3', level: 1, evidence: 'Rushed through' };
  if (seconds < 15) return { code: 'B3', level: 2, evidence: '' };
  if (seconds < 45) return { code: 'B3', level: 4, evidence: 'Engaged with the mission' };
  if (seconds < 120) return { code: 'B3', level: 5, evidence: 'Deeply engaged' };
  return { code: 'B3', level: 2, evidence: '' };
}

function B4_deliberation(changed: number, timeMs: number | undefined): BehaviourResult {
  // Changed their mind mid-answer = deliberating
  if (changed >= 2) return { code: 'B4', level: 4, evidence: 'Weighed multiple options' };
  if (changed === 1) return { code: 'B4', level: 3, evidence: 'Reconsidered once' };
  if (timeMs !== undefined && timeMs > 8000) return { code: 'B4', level: 3, evidence: 'Took time before committing' };
  return { code: 'B4', level: 1, evidence: '' };
}

// ─── Main API ────────────────────────────────────────────────

export function detectBehaviours(signals: BehaviourSignals): BehaviourSet {
  return {
    reflection: B1_reflection(signals.timeToFirstTapMs),
    perseverance: B2_perseverance(
      signals.hintsUsed ?? 0,
      signals.backtrackCount ?? 0,
      signals.changedAnswerCount ?? 0
    ),
    engagement: B3_engagement(signals.totalTimeMs),
    deliberation: B4_deliberation(signals.changedAnswerCount ?? 0, signals.totalTimeMs),
  };
}
