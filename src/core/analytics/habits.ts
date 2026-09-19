// src/core/analytics/habits.ts
import type { SignalKey } from './profile';

export interface Habit {
  title: string;
  why: string;
  script: string;
}

export const HABITS: Record<SignalKey, Habit> = {
  groundedness: {
    title: 'Ask for one detail',
    why: 'Your child tends to speak in general terms. Grounding answers in specifics is the foundation of clear thinking.',
    script:
      'At dinner: "Tell me one thing that happened today — and one detail about it." Wait for the detail. If they say "school was fine", ask: "What specifically made it fine?"',
  },
  alternatives: {
    title: 'The second option',
    why: 'Your child commits to the first idea. Considering alternatives is what separates a good thinker from a fast one.',
    script:
      'When they make a choice this week, ask: "What else could be true here?" Then wait 10 seconds in silence. Do not answer for them.',
  },
  revision: {
    title: 'What would change your mind?',
    why: 'Your child rarely revises their thinking when new information appears. Revision is a strength, not a weakness.',
    script:
      'When they state an opinion this week, ask: "What would change your mind about that?" Praise them when they give a real answer.',
  },
  calibration: {
    title: 'Catch the "always" and "never"',
    why: 'Your child speaks with strong certainty. Calibrated thinking — using "maybe" and "probably" — is more accurate and more persuasive.',
    script:
      'When they say "always" or "never", gently ask: "Can you think of one time it wasn\'t like that?" Don\'t argue. Just plant the seed.',
  },
  reasoningChain: {
    title: 'The "why" chain',
    why: 'Your child gives answers without connecting them to reasons. The chain from claim → evidence → conclusion is the core of reasoning.',
    script:
      'When they tell you something, ask "Why?" twice in a row. The first why gets the surface answer. The second gets the real thinking.',
  },
  expression: {
    title: 'Say it in one more sentence',
    why: "Your child's answers are short. One extra sentence forces them to move from a hunch to a thought.",
    script:
      'Whenever they answer with one word or one line, ask: "Say one more sentence about that." Then just listen.',
  },
};
