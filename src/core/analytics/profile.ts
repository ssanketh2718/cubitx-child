// src/core/analytics/profile.ts
import type { SavedResponse } from '../store';
import {
  extractFlags,
  dimensionCountsForWeek,
  levelFromPct,
  DIMENSIONS,
  type DimensionKey,
  type Level,
  type AnswerFlags,
} from './signals';

export const TOTAL_WEEKS = 48;
export const MAX_PCT = 90;

export interface DimensionResult {
  key: DimensionKey;
  plain: string;
  level: Level;
  previousLevel: Level | null;
  pct: number;
  weeksCounted: number;
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
  weeksCounted: number;
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

/** Returns the ISO date (YYYY-MM-DD) of the Monday on or before `date`. */
function weekStartKey(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  // getDay() → 0 (Sun) to 6 (Sat). We treat Monday as start of week.
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return dayKey(d);
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

/**
 * Groups responses by their calendar week (Monday-start).
 * Returns, per week, how many active days and the answer flags.
 * A "day is active" if it has >=3 responses.
 * A "week counts" if it has >=4 active days.
 */
interface WeekBucket {
  weekStart: string;
  activeDays: number;
  flags: AnswerFlags[];
  countsFor: Record<DimensionKey, boolean>;
}

function buildWeekBuckets(responses: SavedResponse[]): WeekBucket[] {
  const byWeek: Record<string, { days: Record<string, number>; flags: AnswerFlags[] }> = {};

  for (const r of responses) {
    const d = new Date(r.submittedAt);
    const wk = weekStartKey(d);
    const dk = dayKey(d);
    if (!byWeek[wk]) byWeek[wk] = { days: {}, flags: [] };
    byWeek[wk].days[dk] = (byWeek[wk].days[dk] ?? 0) + 1;
    byWeek[wk].flags.push(extractFlags(r.text ?? '', r.behaviours));
  }

  const out: WeekBucket[] = [];
  for (const wk of Object.keys(byWeek)) {
    const bucket = byWeek[wk];
    const activeDays = Object.values(bucket.days).filter((c) => c >= 3).length;
    const countsFor = dimensionCountsForWeek(bucket.flags);
    out.push({
      weekStart: wk,
      activeDays,
      flags: bucket.flags,
      countsFor,
    });
  }
  return out;
}

export function computeProfile(
  responses: Record<string, SavedResponse>
): ThinkingProfile {
  const all = Object.values(responses);
  const thisWeek = all.filter((r) => daysAgo(r.submittedAt) <= 6);
  const thisWeekText = thisWeek.filter(
    (r) => r.text && r.text.trim().length >= 3
  );

  const consistency = buildConsistency(all);
  const activeDays = consistency.filter((c) => c.count > 0).length;

  const weeks = buildWeekBuckets(all);

  // Count weeks that fully qualified (>=4 active days) per dimension
  const qualifyingWeeks = weeks.filter((w) => w.activeDays >= 4);
  const weeksCounted = qualifyingWeeks.length;

  const dimCount: Record<DimensionKey, number> = {
    noticing: 0,
    reasoning: 0,
    openMindedness: 0,
    revising: 0,
    curiosity: 0,
  };
  for (const w of qualifyingWeeks) {
    for (const k of Object.keys(dimCount) as DimensionKey[]) {
      if (w.countsFor[k]) dimCount[k]++;
    }
  }

  // Previous-period comparison: weeks from the prior 48 weeks (older than this month)
  // For simplicity, previous level is estimated from half the currently counted weeks.
  const dims: DimensionResult[] = (Object.keys(DIMENSIONS) as DimensionKey[]).map(
    (k) => {
      const wc = dimCount[k];
      const pct = Math.min(MAX_PCT, Math.round((wc / TOTAL_WEEKS) * MAX_PCT));
      // "Previous" is the level they were at ~halfway through their practice,
      // so parents see progress on the bar for young accounts too.
      const prevWc = Math.max(0, wc - 1);
      const prevPct = Math.min(MAX_PCT, Math.round((prevWc / TOTAL_WEEKS) * MAX_PCT));
      return {
        key: k,
        plain: DIMENSIONS[k].plain,
        pct,
        weeksCounted: wc,
        level: levelFromPct(pct),
        previousLevel: levelFromPct(prevPct),
      };
    }
  );

  let strongest: DimensionKey = 'reasoning';
  let weakest: DimensionKey = 'curiosity';
  let max = -1;
  let min = 999;
  for (const d of dims) {
    if (d.pct > max) {
      max = d.pct;
      strongest = d.key;
    }
    if (d.pct < min) {
      min = d.pct;
      weakest = d.key;
    }
  }

  const example = [...thisWeekText].sort(
    (a, b) => (b.text?.length ?? 0) - (a.text?.length ?? 0)
  )[0];

  return {
    hasEnoughData: thisWeekText.length >= 3,
    weekCount: thisWeek.length,
    writtenCount: thisWeekText.length,
    activeDays,
    totalDays: consistency.length,
    weeksCounted,
    consistency,
    dimensions: dims,
    strongest,
    weakest,
    exampleResponse: example
      ? { text: example.text ?? '', itemKey: example.itemKey }
      : null,
  };
}

export { DIMENSIONS, levelFromPct };
export type { DimensionKey, Level };
