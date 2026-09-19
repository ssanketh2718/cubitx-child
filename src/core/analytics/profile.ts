import type { SavedResponse } from '../store';
import {
  extractResponseSignals,
  levelFromScore,
  DIMENSIONS,
  type DimensionKey,
  type Level,
} from './signals';

export interface DimensionResult {
  key: DimensionKey;
  plain: string;
  level: Level;
  previousLevel: Level | null;
  score: number;
}

export interface ConsistencyDay {
  date: string;
  count: number;
}

export interface ThinkingProfile {
  hasEnoughData: boolean;
  weekCount: number;
  writtenCount: number;
  activeDays: number;
  totalDays: number;
  consistency: ConsistencyDay[];
  dimensions: DimensionResult[];
  strongest: DimensionKey;
  weakest: DimensionKey;
  exampleResponse: { text: string; itemKey: string } | null;
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function daysAgo(iso: string): number {
  const then = new Date(iso);
  then.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.floor((now.getTime() - then.getTime()) / 86400000);
}

function buildConsistency(responses: SavedResponse[]): ConsistencyDay[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const byDay: Record<string, number> = {};
  for (const r of responses) {
    const k = dayKey(new Date(r.submittedAt));
    byDay[k] = (byDay[k] ?? 0) + 1;
  }

  const days: ConsistencyDay[] = [];
  for (let i = 20; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const k = dayKey(d);
    days.push({ date: k, count: byDay[k] ?? 0 });
  }
  return days;
}

function avgDimension(responses: SavedResponse[], key: DimensionKey): number {
  if (responses.length === 0) return 0;
  let sum = 0;
  for (const r of responses) {
    const s = extractResponseSignals(r.text ?? '', r.behaviours);
    sum += s[key];
  }
  return Math.round(sum / responses.length);
}

export function computeProfile(
  responses: Record<string, SavedResponse>
): ThinkingProfile {
  const all = Object.values(responses);
  const thisWeek = all.filter((r) => daysAgo(r.submittedAt) <= 6);
  const lastWeek = all.filter((r) => {
    const d = daysAgo(r.submittedAt);
    return d >= 7 && d <= 13;
  });
  const thisWeekText = thisWeek.filter(
    (r) => r.text && r.text.trim().length >= 3
  );

  const dims: DimensionResult[] = (
    Object.keys(DIMENSIONS) as DimensionKey[]
  ).map((k) => {
    const score = avgDimension(thisWeek, k);
    const prevScore = lastWeek.length > 0 ? avgDimension(lastWeek, k) : null;
    return {
      key: k,
      plain: DIMENSIONS[k].plain,
      score,
      level: levelFromScore(score),
      previousLevel: prevScore === null ? null : levelFromScore(prevScore),
    };
  });

  let strongest: DimensionKey = 'reasoning';
  let weakest: DimensionKey = 'curiosity';
  let max = -1;
  let min = 101;
  for (const d of dims) {
    if (d.score > max) {
      max = d.score;
      strongest = d.key;
    }
    if (d.score < min) {
      min = d.score;
      weakest = d.key;
    }
  }

  const example = [...thisWeekText].sort(
    (a, b) => (b.text?.length ?? 0) - (a.text?.length ?? 0)
  )[0];

  const consistency = buildConsistency(all);
  const activeDays = consistency.filter((c) => c.count > 0).length;

  return {
    hasEnoughData: thisWeekText.length >= 3,
    weekCount: thisWeek.length,
    writtenCount: thisWeekText.length,
    activeDays,
    totalDays: consistency.length,
    consistency,
    dimensions: dims,
    strongest,
    weakest,
    exampleResponse: example
      ? { text: example.text ?? '', itemKey: example.itemKey }
      : null,
  };
}

export { DIMENSIONS, levelFromScore };
export type { DimensionKey, Level };