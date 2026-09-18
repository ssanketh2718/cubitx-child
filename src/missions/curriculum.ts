import type { Tier, DayConfig } from './types';

const modules = import.meta.glob<{ default: DayConfig }>(
  './tier*/day-*/config.ts',
  { eager: true }
);

function keyFor(tier: Tier, day: number): string {
  const dd = String(day).padStart(2, '0');
  return `./tier${tier}/day-${dd}/config.ts`;
}

export function loadDayConfig(tier: Tier, day: number): DayConfig | null {
  const mod = modules[keyFor(tier, day)];
  return mod?.default ?? null;
}

export function hasContentForDay(tier: Tier, day: number): boolean {
  const cfg = loadDayConfig(tier, day);
  return !!(cfg && cfg.items.length > 0);
}

export const TOTAL_DAYS = 30;
