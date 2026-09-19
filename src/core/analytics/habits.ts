// src/core/analytics/habits.ts
import type { DimensionKey } from './signals';

export interface Habit {
  title: string;
  why: string;
  script: string;
}

export const HABITS: Record<DimensionKey, Habit> = {
  noticing: {
    title: 'Ask for one detail',
    why: 'Your child often speaks in general terms. Noticing small, specific things is the foundation of clear thinking.',
    script:
      'At dinner: "Tell me one thing that happened today — and one detail about it." If they say "school was fine", ask: "What specifically made it fine?"',
  },
  reasoning: {
    title: 'The "why" chain',
    why: 'Your child tends to give answers without connecting them to reasons. Asking "why" twice gets to the real thinking.',
    script:
      'When they tell you something, ask "Why?" once. Then ask "Why?" again. The first why gets the surface answer. The second gets the reasoning.',
  },
  openMindedness: {
    title: 'The second option',
    why: 'Your child commits to the first idea quickly. Considering alternatives is what separates a good thinker from a fast one.',
    script:
      'When they make a choice, ask: "What else could be true here?" Then wait 10 seconds in silence. Do not answer for them.',
  },
  revising: {
    title: 'What would change your mind?',
    why: 'Your child rarely updates their thinking when new information appears. Revision is a strength, not a weakness.',
    script:
      'When they state an opinion, ask: "What would change your mind about that?" Praise them when they give a real answer.',
  },
  curiosity: {
    title: 'Question the question',
    why: 'Your child answers what is asked but rarely asks their own questions. The quality of thinking depends on the quality of questions.',
    script:
      'After they answer something, ask: "What would be a better question to ask about this?" Then just listen.',
  },
};
