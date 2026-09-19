// src/core/analytics/conversations.ts
import type { SavedResponse } from '../store';

export interface Starter {
  itemKey: string;
  childWrote: string;
  tryThis: string;
}

const FOLLOW_UPS = [
  'What would change your mind about that?',
  'What else could be true here?',
  'Why do you think that? And why that reason?',
  'Can you think of an example?',
  'How would someone who disagrees with you answer?',
  'What is one thing you are not sure about?',
];

export function buildStarters(
  responses: Record<string, SavedResponse>,
  max = 3
): Starter[] {
  const list = Object.values(responses)
    .filter((r) => r.text && r.text.trim().length > 30)
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));

  const out: Starter[] = [];
  const used = new Set<string>();

  for (const r of list) {
    if (out.length >= max) break;
    const followUp = FOLLOW_UPS[out.length % FOLLOW_UPS.length];
    if (used.has(followUp)) continue;
    used.add(followUp);
    out.push({
      itemKey: r.itemKey,
      childWrote: r.text!.trim().slice(0, 140),
      tryThis: followUp,
    });
  }
  return out;
}
