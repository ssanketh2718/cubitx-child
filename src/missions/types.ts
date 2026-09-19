export type CurriculumTier = 1 | 2;

export type EngineId =
  | 'm1'
  | 'm2'
  | 'm3'
  | 'm4'
  | 'm5'
  | 'math'
  | 'opinion'
  | 'creative'
  | 'watch';

export type DayItem =
  | { engine: 'm1' | 'm2' | 'm3' | 'm4' | 'm5'; puzzle: string }
  | {
      engine: 'math';
      title: string;
      description: string;
      tests: { in: number; out: number }[];
      ruleOptions: string[];
      answerIdx: number;
      explanation: string;
    }
  | {
      engine: 'opinion';
      question: string;
      scenario?: string;
      options: { em: string; label: string; hint?: string }[];
    }
  | { engine: 'creative'; prompt: string; hint?: string }
  | {
      engine: 'watch';
      title: string;
      video: string;
      reflect: string;
    };

export interface DayConfig {
  tier: CurriculumTier;
  day: number;
  label?: string;
  items: DayItem[];
}