export type CurriculumTier = 1 | 2;

export type EngineId =
  | 'm1'
  | 'm2'
  | 'm3'
  | 'm4'
  | 'm5'
  | 'opinion'
  | 'creative'
  | 'watch';

export type DayItem =
  | { engine: 'm1' | 'm2' | 'm3' | 'm4' | 'm5'; puzzle: string }
  | { engine: 'opinion'; question: string }
  | { engine: 'creative'; prompt: string }
  | { engine: 'watch'; video: string };

export interface DayConfig {
  tier: CurriculumTier;
  day: number;
  label?: string;
  items: DayItem[];
}