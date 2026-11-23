import type { CurriculumTier, DayConfig } from '../core/sdk/types';

const modules = import.meta.glob<{ default: DayConfig }>(
  './tier*/day-*/config.ts',
  { eager: true }
);

export const TOTAL_DAYS = 365;
export const CYCLE_LENGTH_DAYS = 30;

function normalizeTierNumber(tier: CurriculumTier): 1 | 2 {
  if (tier === 2 || tier === 'builder' || tier === 'explorer') return 2;
  return 1;
}

/**
 * Maps any annual day (1..365) onto its underlying 30-day cycle (1..30).
 */
export function resolveCycleDay(day: number): number {
  const clamped = Math.max(1, Math.min(TOTAL_DAYS, Math.floor(day)));
  return ((clamped - 1) % CYCLE_LENGTH_DAYS) + 1;
}

function keyFor(tierNum: 1 | 2, day: number): string {
  const dd = String(day).padStart(2, '0');
  return `./tier${tierNum}/day-${dd}/config.ts`;
}

/**
 * Finds the highest authored day <= requested day for the tier (falls back to Tier 1 Day 1),
 * guaranteeing missions are NEVER invisible even if a future day's config isn't authored yet.
 */
export function loadDayConfig(
  tier: CurriculumTier,
  day: number
): DayConfig | null {
  const tierNum = normalizeTierNumber(tier);
  const cycledDay = resolveCycleDay(day);

  // 1. Exact match in requested tier
  const direct = modules[keyFor(tierNum, day)]?.default;
  if (direct && direct.items.length > 0) return direct;

  // 2. Cycled match in requested tier
  const cycled = modules[keyFor(tierNum, cycledDay)]?.default;
  if (cycled && cycled.items.length > 0) return cycled;

  // 3. Nearest previous authored day in requested tier (e.g. Day 1 when on Day 7)
  for (let d = cycledDay; d >= 1; d--) {
    const candidate = modules[keyFor(tierNum, d)]?.default;
    if (candidate && candidate.items.length > 0) {
      return { ...candidate, day };
    }
  }

  // 4. Fallback to Tier 1 Day 1 so screen is never blank
  const fallback = modules[keyFor(1, 1)]?.default;
  return fallback ? { ...fallback, day } : null;
}

export function hasContentForDay(
  tier: CurriculumTier,
  day: number
): boolean {
  const cfg = loadDayConfig(tier, day);
  return !!(cfg && cfg.items.length > 0);
}

/**
 * Returns true only if a dedicated config file exists for that exact day.
 */
export function hasDedicatedDayConfig(
  tier: CurriculumTier,
  day: number
): boolean {
  const tierNum = normalizeTierNumber(tier);
  const exact = modules[keyFor(tierNum, day)]?.default;
  return !!(exact && exact.items.length > 0);
}