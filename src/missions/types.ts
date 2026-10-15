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
  | 'watch'
  | 'observe';

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
    }
  | {
      engine: 'observe';
      title: string;
      image: string;
      imageVisibleSeconds: number;
      question: string;
      answerMode: 'choice' | 'text';
      options?: string[];
      answerIdx?: number;
      reasonPrompt: string;
      reveal: {
        title: string;
        text: string;
        revisionPrompt: string;
      };
    };

export interface DayConfig {
  tier: CurriculumTier;
  day: number;
  label?: string;
  teaser?: string;
  items: DayItem[];
}