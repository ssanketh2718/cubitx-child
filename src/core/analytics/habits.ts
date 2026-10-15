// src/core/analytics/habits.ts

export type DimensionKey =
  | 'interpretation'
  | 'reasoning'
  | 'openMindedness'
  | 'evaluation'
  | 'revision';

export interface Habit {
  title: string;
  why: string;
  script: string;
}

export const HABITS: Record<DimensionKey, Habit> = {
  interpretation: {
    title: 'Ask for one specific thing',
    why: 'Your child often speaks in general terms. Noticing small, specific things is the foundation of clear thinking.',
    script:
      'At dinner: "Tell me one thing that happened today — and one detail about it." If they say "school was fine," ask: "What specifically made it fine?"',
  },
  reasoning: {
    title: 'The "why" chain',
    why: 'Your child often gives answers without connecting them to reasons. Asking "why" twice gets to the real thinking.',
    script:
      'When they tell you something, ask "Why?" once. Then ask "Why?" again. The first why gets the surface answer. The second gets the reasoning.',
  },
  openMindedness: {
    title: 'The second option',
    why: 'Your child commits to the first idea quickly. Considering alternatives is what separates a good thinker from a fast one.',
    script:
      'When they make a choice, ask: "What else could be true here?" Then wait 10 seconds in silence. Do not answer for them.',
  },
  evaluation: {
    title: 'Who says?',
    why: 'Your child accepts information without checking where it comes from. Source evaluation is the essential skill of the AI era.',
    script:
      'When they share something they heard, ask: "Who told you that? And how would they know?" Then listen.',
  },
  revision: {
    title: 'What would change your mind?',
    why: 'Your child rarely updates their thinking when new information appears. Revision is a strength, not a weakness.',
    script:
      'When they state an opinion, ask: "What would change your mind about that?" Praise them when they give a real answer.',
  },
};

export const DIMENSION_LABELS: Record<DimensionKey, string> = {
  interpretation: 'Noticing details',
  reasoning: 'Giving reasons',
  openMindedness: 'Considering other ideas',
  evaluation: 'Checking sources',
  revision: 'Changing their mind',
};

export const DIMENSION_ICONS: Record<DimensionKey, string> = {
  interpretation: '👁️',
  reasoning: '🧠',
  openMindedness: '🔀',
  evaluation: '🔍',
  revision: '🔁',
};
