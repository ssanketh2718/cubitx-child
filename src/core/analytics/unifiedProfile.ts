// src/core/analytics/unifiedProfile.ts
import type { SavedResponse } from '../store';
import type { Session } from '../sdk/types';
import {
  detectParameters,
  type ParameterResult,
  type ParameterSet,
} from './parameters';
import { detectBehaviours, type BehaviourSignals } from './behavioural';
import {
  summarizeThinkingSheets,
  type SkillCode,
  type ThinkingSheetSummary,
} from './thinkingSheetBridge';

export type CoverageStatus = 'observed' | 'early' | 'review' | 'upcoming';

export interface DispositionScores {
  inquisitiveness: number;
  systematicity: number;
  analyticity: number;
  openMindedness: number;
  truthSeeking: number;
  selfConfidence: number;
  cognitiveMaturity: number;
}

export interface UnifiedPillarMetric {
  code: SkillCode;
  status: CoverageStatus;
  obsCount: number;
  needsPracticeCount: number;
  masteryScore: number; // 0-100 true mastery (errors do NOT inflate this)
  growthSeries: [number, number, number, number]; // Chronological 4-bucket progression
  latestEvidence: string;
}

export interface UnifiedAssessmentProfile {
  pillars: Record<SkillCode, UnifiedPillarMetric>;
  dispositions: DispositionScores;
  sheetSummary: ThinkingSheetSummary;
  missionResponses: Record<string, SavedResponse>;
  variabilityIndex: number; // Dynamic Systems Theory developmental variability (0-100)
  inTransitionPhase: boolean;
  totalProbes: number;
  recheckMoments: number;
  ownWordNotesCount: number;
  multiCluePct: number;
  firstHunchPct: number;
  hasClueHabitData: boolean;
  weeklyActivityBars: Array<{ label: string; val: number }>;
  activeDaysCount: number;
  missionsSolvedCount: number;
}

const ALL_SKILL_CODES: SkillCode[] = ['A1', 'A2', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3'];

// Maps each of the 48 internal parameters to its primary Parent Brain Map Pillar
const PARAM_TO_PILLAR: Record<string, SkillCode> = {
  I3: 'A1', I8: 'A1', E1: 'A1', E10: 'A1',
  I1: 'A2', I4: 'A2', I5: 'A2', E3: 'A2', E9: 'A2',
  R1: 'B1', R2: 'B1', R3: 'B1', R4: 'B1', R5: 'B1', R7: 'B1', R10: 'B1', R11: 'B1',
  I2: 'B2', I6: 'B2', I7: 'B2', R6: 'B2', R8: 'B2',
  E2: 'B3', E4: 'B3', E5: 'B3', E6: 'B3', E8: 'B3', R12: 'B3',
  R9: 'C1', O1: 'C1', O2: 'C1', O3: 'C1', O4: 'C1', O6: 'C1', O8: 'C1', O9: 'C1',
  M1: 'C2', M2: 'C2', M3: 'C2', O5: 'C2', O7: 'C2', O10: 'C2', E7: 'C2',
  M4: 'C3', M5: 'C3', M6: 'C3', M7: 'C3', M8: 'C3',
};

function flattenParams(set: ParameterSet): ParameterResult[] {
  return [
    ...set.interpretation,
    ...set.reasoning,
    ...set.openMindedness,
    ...set.evaluation,
    ...set.revision,
  ];
}

function getTimestamp(r: any): string | undefined {
  return r?.submittedAt || r?.completedAt;
}

function withinTimeWindow(
  dateStr: string | undefined,
  win: '7d' | '30d' | '90d' | 'all'
): boolean {
  if (win === 'all') return true;
  if (!dateStr) return false; // Prevent undated records from leaking into 7d/30d
  const days = win === '7d' ? 7 : win === '30d' ? 30 : 90;
  const parsed =
    dateStr.length === 10 ? new Date(`${dateStr}T12:00:00`) : new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return false;
  return parsed.getTime() >= Date.now() - days * 24 * 60 * 60 * 1000;
}

export function buildUnifiedAssessmentProfile(input: {
  sessions: Session[];
  responses: Record<string, any>;
  timeWindow: '7d' | '30d' | '90d' | 'all';
}): UnifiedAssessmentProfile {
  const { sessions, responses, timeWindow } = input;

  const filteredSessions = sessions.filter((s) =>
    withinTimeWindow(s.date, timeWindow)
  );

  // Split missions vs. Thinking Sheets cleanly so nothing is double-counted
  const missionResponses: Record<string, SavedResponse> = {};
  const sheetResponses: Record<string, any> = {};

  for (const [key, val] of Object.entries(responses || {})) {
    if (!val) continue;
    const ts = getTimestamp(val);
    if (!withinTimeWindow(ts, timeWindow)) continue;

    if (key.startsWith('sheet:')) {
      sheetResponses[key] = { ...val, completedAt: ts };
    } else {
      missionResponses[key] = { ...val, submittedAt: ts || '' };
    }
  }

  const sheetSummary = summarizeThinkingSheets(sheetResponses);

  // Per-pillar accumulators
  const obsCounts: Record<SkillCode, number> = {
    A1: 0, A2: 0, B1: 0, B2: 0, B3: 0, C1: 0, C2: 0, C3: 0,
  };
  const practiceCounts: Record<SkillCode, number> = {
    A1: 0, A2: 0, B1: 0, B2: 0, B3: 0, C1: 0, C2: 0, C3: 0,
  };
  const scoreBuckets: Record<SkillCode, number[]> = {
    A1: [], A2: [], B1: [], B2: [], B3: [], C1: [], C2: [], C3: [],
  };
  const evidenceMap: Record<SkillCode, string> = {
    A1: '', A2: '', B1: '', B2: '', B3: '', C1: '', C2: '', C3: '',
  };
  // 4 chronological buckets for real Dynamic Systems growth series
  const timeSeriesBuckets: Record<SkillCode, number[][]> = {
    A1: [[], [], [], []],
    A2: [[], [], [], []],
    B1: [[], [], [], []],
    B2: [[], [], [], []],
    B3: [[], [], [], []],
    C1: [[], [], [], []],
    C2: [[], [], [], []],
    C3: [[], [], [], []],
  };

  // Seed from Thinking Sheets (each completed sheet credits its mapped pillar)
  for (const code of ALL_SKILL_CODES) {
    const entries = sheetSummary.bySkill[code] ?? [];
    obsCounts[code] += entries.length;
    for (const entry of entries) {
      const hasExplanation = entry.text.trim().length >= 8;
      const pts = hasExplanation ? 22 : 14;
      scoreBuckets[code].push(pts);
      if (!evidenceMap[code] && entry.text.trim()) {
        evidenceMap[code] = `In ${entry.topicName}: “${entry.text.trim()}”`;
      }
    }
  }

  // Analyze each Mission Response through the 48-parameter + behavioural detectors
  const sortedMissions = Object.values(missionResponses).sort((a, b) =>
    (a.submittedAt || '').localeCompare(b.submittedAt || '')
  );

  const runScores: number[] = [];
  let totalChecksTried = 0;
  let recheckMoments = 0;
  let missionWrittenNotes = 0;
  let responsesWithChecks = 0;
  let multiClueCount = 0;

  // Disposition accumulators
  const dispRaw = {
    inquisitiveness: [] as number[],
    systematicity: [] as number[],
    analyticity: [] as number[],
    openMindedness: [] as number[],
    truthSeeking: [] as number[],
    selfConfidence: [] as number[],
    cognitiveMaturity: [] as number[],
  };

  sortedMissions.forEach((resp, idx) => {
    const meta = resp as any;
    const text = (resp.text ?? '').trim();
    if (text.length > 0) missionWrittenNotes++;

    const checks = resp.behaviours?.testsBeforeGuess;
    if (typeof checks === 'number') {
      responsesWithChecks++;
      if (checks > 0) totalChecksTried += checks;
      if (checks >= 2) multiClueCount++;
    }

    const revised =
      resp.behaviours?.wentBackToTest === true ||
      (resp.behaviours?.changedAnswerCount ?? 0) > 0;
    if (revised) recheckMoments++;

    const paramSet = detectParameters({
      answer: text,
      question: meta.question ?? '',
      before: meta.revisedFromText ?? '',
      after: text,
      sceneKeywords: meta.sceneKeywords ?? [],
      causalKeywords: meta.causalKeywords ?? [],
      decorativeKeywords: meta.decorativeKeywords ?? [],
      mechanismKeywords: meta.mechanismKeywords ?? [],
      isCorrect: meta.isCorrect,
      decoyCaught: meta.decoyCaught,
      challengeStrength: meta.challengeStrength,
      confidenceBefore: meta.confidenceBefore,
      confidenceAfter: meta.confidenceAfter,
      isFarTransfer: meta.isFarTransfer,
    });

    const behaviours = detectBehaviours({
      timeToFirstTapMs: resp.behaviours?.timeToFirstTapMs,
      totalTimeMs: resp.behaviours?.secondsOnItem
        ? resp.behaviours.secondsOnItem * 1000
        : undefined,
      backtrackCount:
        resp.behaviours?.backtrackCount ?? (resp.behaviours?.wentBackToTest ? 1 : 0),
      changedAnswerCount: resp.behaviours?.changedAnswerCount ?? 0,
      hintsUsed: resp.behaviours?.hintsUsed ?? 0,
    } as BehaviourSignals);

    const flat = flattenParams(paramSet);
    const bucketIdx =
      sortedMissions.length <= 1
        ? 3
        : Math.min(3, Math.floor((idx / sortedMissions.length) * 4));

    // Group active parameters by pillar for this mission
    const activeByPillar: Partial<Record<SkillCode, ParameterResult[]>> = {};
    for (const p of flat) {
      if (p.level > 0) {
        const pillar = PARAM_TO_PILLAR[p.code];
        if (pillar) {
          (activeByPillar[pillar] ??= []).push(p);
        }
      }
    }

    // Engine-level structural signals (so non-text interactive acts also register accurately)
    if (typeof checks === 'number' && checks >= 2) {
      obsCounts.B2 += 1;
      scoreBuckets.B2.push(16);
      timeSeriesBuckets.B2[bucketIdx].push(16);
    }
    if (revised) {
      obsCounts.C2 += 1;
      scoreBuckets.C2.push(18);
      timeSeriesBuckets.C2[bucketIdx].push(18);
    }
    if (resp.engine === 'baseline-act2-missing-info' && (checks ?? 0) >= 2) {
      obsCounts.A2 += 1;
      scoreBuckets.A2.push(18);
      timeSeriesBuckets.A2[bucketIdx].push(18);
    }
    if (resp.engine === 'baseline-act3-tradeoffs' && meta.isCorrect !== false) {
      obsCounts.C1 += 1;
      scoreBuckets.C1.push(18);
      timeSeriesBuckets.C1[bucketIdx].push(18);
    }
    if ((resp.behaviours?.hintsUsed ?? 0) >= 1 && meta.isCorrect === true) {
      obsCounts.A1 += 1;
      scoreBuckets.A1.push(15);
      timeSeriesBuckets.A1[bucketIdx].push(15);
    }

    // Error / Trap handling: flag needsPractice WITHOUT inflating mastery score
    if (meta.isCorrect === false) {
      practiceCounts.B3 += 1;
    } else if (meta.decoyCaught === true) {
      obsCounts.B3 += 1;
      scoreBuckets.B3.push(22);
      timeSeriesBuckets.B3[bucketIdx].push(22);
    }

    // Credit pillars from detected 48-parameter evidence
    let missionComposite = 0;
    for (const code of ALL_SKILL_CODES) {
      const hits = activeByPillar[code];
      if (hits && hits.length > 0) {
        obsCounts[code] += 1;
        const avgLevel = hits.reduce((s, h) => s + h.level, 0) / hits.length;
        const pts = Math.round((avgLevel / 5) * 24);
        scoreBuckets[code].push(pts);
        timeSeriesBuckets[code][bucketIdx].push(pts);
        missionComposite += pts;

        const bestWithQuote = hits.find((h) => h.evidence.length > 4);
        if (bestWithQuote && !evidenceMap[code]) {
          evidenceMap[code] = bestWithQuote.evidence;
        }
      }
    }
    runScores.push(missionComposite);

    // Populate 7 KRISTAL / Facione Dispositions
    dispRaw.inquisitiveness.push(
      Math.min(100, (checks ?? 0) * 25 + (activeByPillar.A1 ? 30 : 0))
    );
    dispRaw.systematicity.push(
      Math.round((behaviours.reflection.level / 5) * 60 + (behaviours.perseverance.level / 5) * 40)
    );
    dispRaw.analyticity.push(
      activeByPillar.A2 ? Math.min(100, activeByPillar.A2.length * 30) : 20
    );
    dispRaw.openMindedness.push(
      activeByPillar.C1 ? Math.min(100, activeByPillar.C1.length * 30) : 20
    );
    dispRaw.truthSeeking.push(
      meta.decoyCaught === true ? 90 : meta.isCorrect === false ? 25 : 55
    );
    dispRaw.selfConfidence.push(
      typeof meta.confidenceAfter === 'number' ? meta.confidenceAfter : 60
    );
    dispRaw.cognitiveMaturity.push(
      revised ? 85 : Math.round((behaviours.deliberation.level / 5) * 80)
    );
  });

  // Build final 8 Pillar metrics with real chronological growth curves (no synthetic ramp)
  const pillars = {} as Record<SkillCode, UnifiedPillarMetric>;
  for (const code of ALL_SKILL_CODES) {
    const obs = obsCounts[code];
    const practice = practiceCounts[code];
    const totalPts = scoreBuckets[code].reduce((s, v) => s + v, 0);
    // Cumulative mastery grows realistically across completed stages (cap 100)
    const masteryScore = obs === 0 ? 0 : Math.min(100, totalPts);

    const status: CoverageStatus =
      practice > 0 && obs === 0
        ? 'review'
        : obs >= 4
        ? 'observed'
        : obs >= 1
        ? 'early'
        : 'upcoming';

    // Real cumulative progression across 4 time buckets (supports plateaus)
    const b = timeSeriesBuckets[code];
    const bSums = b.map((arr) => arr.reduce((s, v) => s + v, 0));
    const sheetBaseline = Math.max(0, masteryScore - bSums.reduce((s, v) => s + v, 0));
    const c0 = Math.min(100, sheetBaseline + bSums[0]);
    const c1 = Math.min(100, c0 + bSums[1]);
    const c2 = Math.min(100, c1 + bSums[2]);
    const c3 = Math.min(100, c2 + bSums[3]);

    pillars[code] = {
      code,
      status,
      obsCount: obs,
      needsPracticeCount: practice,
      masteryScore,
      growthSeries: obs === 0 ? [0, 0, 0, 0] : [c0, c1, c2, c3],
      latestEvidence: evidenceMap[code],
    };
  }

  // Dynamic Systems Theory Variability Index (detects transition readiness)
  let variabilityIndex = 0;
  if (runScores.length >= 2) {
    const mean = runScores.reduce((s, v) => s + v, 0) / runScores.length;
    const variance =
      runScores.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / runScores.length;
    variabilityIndex = Math.min(100, Math.round(Math.sqrt(variance) * 2.5));
  }

  const avgDisp = (arr: number[]) =>
    arr.length === 0 ? 0 : Math.round(arr.reduce((s, v) => s + v, 0) / arr.length);

  const dispositions: DispositionScores = {
    inquisitiveness: avgDisp(dispRaw.inquisitiveness),
    systematicity: avgDisp(dispRaw.systematicity),
    analyticity: avgDisp(dispRaw.analyticity),
    openMindedness: avgDisp(dispRaw.openMindedness),
    truthSeeking: avgDisp(dispRaw.truthSeeking),
    selfConfidence: avgDisp(dispRaw.selfConfidence),
    cognitiveMaturity: avgDisp(dispRaw.cognitiveMaturity),
  };

  // Unique active days across sessions, missions, and sheets
  const uniqueDates = new Set<string>();
  for (const s of filteredSessions) if (s.date) uniqueDates.add(s.date.slice(0, 10));
  for (const r of Object.values(missionResponses))
    if (r.submittedAt) uniqueDates.add(r.submittedAt.slice(0, 10));
  for (const e of sheetSummary.entries)
    if (e.completedAt) uniqueDates.add(e.completedAt.slice(0, 10));

  const sheetWrittenCount = sheetSummary.entries.filter(
    (e) => e.text.trim().length > 0
  ).length;

  const hasClueHabitData = responsesWithChecks > 0;
  const multiCluePct = hasClueHabitData
    ? Math.round((multiClueCount / responsesWithChecks) * 100)
    : 0;

  // Weekly activity bars (last 4 weeks)
  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const buckets = [0, 0, 0, 0];
  const allTimestamps = [
    ...Object.values(missionResponses).map((r) => r.submittedAt),
    ...sheetSummary.entries.map((e) => e.completedAt || ''),
    ...filteredSessions.map((s) => s.date),
  ].filter(Boolean);

  for (const ts of allTimestamps) {
    const t = ts.length === 10 ? new Date(`${ts}T12:00:00`).getTime() : new Date(ts).getTime();
    if (Number.isNaN(t)) continue;
    const ageWeeks = Math.floor((now - t) / weekMs);
    if (ageWeeks <= 0) buckets[3] += 1;
    else if (ageWeeks === 1) buckets[2] += 1;
    else if (ageWeeks === 2) buckets[1] += 1;
    else if (ageWeeks === 3) buckets[0] += 1;
  }

  return {
    pillars,
    dispositions,
    sheetSummary,
    missionResponses,
    variabilityIndex,
    inTransitionPhase: variabilityIndex >= 35 && sortedMissions.length >= 3,
    totalProbes: totalChecksTried + sheetSummary.totalCompleted,
    recheckMoments,
    ownWordNotesCount: missionWrittenNotes + sheetWrittenCount,
    multiCluePct,
    firstHunchPct: hasClueHabitData ? 100 - multiCluePct : 0,
    hasClueHabitData,
    weeklyActivityBars: [
      { label: 'Wk 1', val: buckets[0] },
      { label: 'Wk 2', val: buckets[1] },
      { label: 'Wk 3', val: buckets[2] },
      { label: 'Now', val: buckets[3] },
    ],
    activeDaysCount: uniqueDates.size,
    missionsSolvedCount: filteredSessions.length,
  };
}