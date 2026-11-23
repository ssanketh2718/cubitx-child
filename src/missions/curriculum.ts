import type { CurriculumTier, DayConfig } from '../core/sdk/types';

const modules = import.meta.glob<{ default: DayConfig }>(
  './tier*/day-*/config.ts',
  { eager: true }
);

export const TOTAL_DAYS = 365;
export const CYCLE_LENGTH_DAYS = 30;

/**
 * Maps any annual day (1..365) onto its underlying 30-day phenomenon cycle (1..30)
 * if a dedicated day-31..day-365 folder has not been authored yet.
 */
export function resolveCycleDay(day: number): number {
  const clamped = Math.max(1, Math.min(TOTAL_DAYS, Math.floor(day)));
  return ((clamped - 1) % CYCLE_LENGTH_DAYS) + 1;
}

function keyFor(tier: CurriculumTier, day: number): string {
  const dd = String(day).padStart(2, '0');
  return `./tier${tier}/day-${dd}/config.ts`;
}

export function loadDayConfig(
  tier: CurriculumTier,
  day: number
): DayConfig | null {
  const direct = modules[keyFor(tier, day)];
  if (direct?.default) return direct.default;

  const cycledDay = resolveCycleDay(day);
  const cycled = modules[keyFor(tier, cycledDay)];
  return cycled?.default ?? null;
}

export function hasContentForDay(
  tier: CurriculumTier,
  day: number
): boolean {
  const cfg = loadDayConfig(tier, day);
  return !!(cfg && cfg.items.length > 0);
}