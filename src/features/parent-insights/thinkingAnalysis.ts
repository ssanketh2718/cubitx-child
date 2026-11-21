import type { Session } from '../../core/sdk/types';
import type { SavedResponse } from '../../core/store';
import type { ObservedMoment } from './skillsCatalog';

export interface ThinkingPatternCard {
  id: 'evidence-checking' | 'revisiting-ideas' | 'written-reasoning' | 'steady-pace';
  title: string;
  headline: string;
  detail: string;
  badge: string;
  tone: 'teal' | 'amber' | 'slate';
}

export interface StudentThinkingSummary {
  totalExplorations: number;
  uniqueMissions: number;
  activeDays: number;
  recordedMoments: number;
  totalChecksTried: number;
  recheckMoments: number;
  writtenReflections: number;
  highlights: string[];
  nextStepTip: string;
}

export function buildMomentsFromResponses(
  responses: Record<string, SavedResponse>,
  resolveTitle: (key: string) => string
): ObservedMoment[] {
  return Object.values(responses)
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
    .map((r) => ({
      id: `${r.itemKey}-${r.submittedAt}`,
      itemKey: r.itemKey,
      title: resolveTitle(r.itemKey),
      submittedAt: r.submittedAt,
      verbatimText: r.text,
      pickedIndex: r.picked,
      testsBeforeGuess: r.behaviours?.testsBeforeGuess,
      wentBackToTest: r.behaviours?.wentBackToTest,
      hintsUsed: r.behaviours?.hintsUsed,
      changedAnswerCount: r.behaviours?.changedAnswerCount,
    }));
}

export function analyzeThinking(
  sessions: Session[],
  responses: Record<string, SavedResponse>,
  childFirstName: string
): {
  patterns: ThinkingPatternCard[];
  studentSummary: StudentThinkingSummary;
} {
  const responseList = Object.values(responses);
  const allMissionIds = sessions.flatMap((s) => s.missionsCompleted);
  const uniqueMissionIds = new Set(allMissionIds);
  const activeDays = new Set(sessions.map((s) => s.date)).size;

  const totalChecksTried = responseList.reduce((acc, r) => {
    const checks = r.behaviours?.testsBeforeGuess ?? 0;
    return acc + (checks > 0 ? checks : 0);
  }, 0);

  const recheckMoments = responseList.filter(
    (r) => r.behaviours?.wentBackToTest === true || (r.behaviours?.changedAnswerCount ?? 0) > 0
  ).length;

  const writtenReflections = responseList.filter(
    (r) => typeof r.text === 'string' && r.text.trim().length > 0
  ).length;

  const patterns: ThinkingPatternCard[] = [];

  if (totalChecksTried > 0) {
    const avgChecks = (totalChecksTried / Math.max(responseList.length, 1)).toFixed(1);
    patterns.push({
      id: 'evidence-checking',
      title: 'Testing Before Settling',
      headline: `${totalChecksTried} clue checks across ${responseList.length} recorded moment${responseList.length === 1 ? '' : 's'}`,
      detail: `${childFirstName} averaged ${avgChecks} checks per recorded activity—a practical sign of gathering observations instead of relying on a single guess.`,
      badge: 'Clue Habit',
      tone: 'teal',
    });
  } else {
    patterns.push({
      id: 'evidence-checking',
      title: 'Testing Before Settling',
      headline: 'Ready to gather first clues',
      detail: `When ${childFirstName} tests numbers, clues, or options before choosing, we will highlight how they check proof here.`,
      badge: 'Starts on Next Activity',
      tone: 'slate',
    });
  }

  if (recheckMoments > 0) {
    patterns.push({
      id: 'revisiting-ideas',
      title: 'Re-Checking & Adapting',
      headline: `Re-checked or updated ideas in ${recheckMoments} moment${recheckMoments === 1 ? '' : 's'}`,
      detail: `Revisiting an earlier assumption when new details appear is a core part of clear reasoning—not a mistake.`,
      badge: 'Flexible Thinking',
      tone: 'amber',
    });
  } else {
    patterns.push({
      id: 'revisiting-ideas',
      title: 'Re-Checking & Adapting',
      headline: 'First-pass choices recorded so far',
      detail: `Whenever ${childFirstName} goes back to re-test a clue or rethinks a pick after new information, it shows up here.`,
      badge: 'Observing',
      tone: 'slate',
    });
  }

  if (writtenReflections > 0) {
    patterns.push({
      id: 'written-reasoning',
      title: 'Explaining in Own Words',
      headline: `${writtenReflections} written thought${writtenReflections === 1 ? '' : 's'} captured`,
      detail: `Putting reasoning into words helps ${childFirstName} notice what convinced them and share ideas with family.`,
      badge: 'Voice & Clarity',
      tone: 'teal',
    });
  } else {
    patterns.push({
      id: 'written-reasoning',
      title: 'Explaining in Own Words',
      headline: 'Choice-based moves recorded',
      detail: `${childFirstName} has worked through interactive choices; written notes will appear here whenever they type a reason.`,
      badge: 'Choice Trail',
      tone: 'slate',
    });
  }

  patterns.push({
    id: 'steady-pace',
    title: 'Self-Paced Exploration',
    headline: `${uniqueMissionIds.size} mission${uniqueMissionIds.size === 1 ? '' : 's'} explored over ${activeDays} day${activeDays === 1 ? '' : 's'}`,
    detail: `CubitX tracks genuine exploration at ${childFirstName}’s own rhythm—with zero streak penalties or rush timers.`,
    badge: 'No Streak Pressure',
    tone: 'slate',
  });

  const highlights: string[] = [];
  if (uniqueMissionIds.size > 0) {
    highlights.push(
      `You have completed ${uniqueMissionIds.size} distinct investigation${uniqueMissionIds.size === 1 ? '' : 's'} (${allMissionIds.length} total run${allMissionIds.length === 1 ? '' : 's'}).`
    );
  }
  if (totalChecksTried > 0) {
    highlights.push(
      `You ran ${totalChecksTried} check${totalChecksTried === 1 ? '' : 's'} across your recorded activities.`
    );
  }
  if (recheckMoments > 0) {
    highlights.push(
      `You went back to re-check or update your thinking in ${recheckMoments} activity.`
    );
  }
  if (highlights.length === 0) {
    highlights.push(
      `Try feeding 3 or 4 different numbers in Crack the Machine or checking multiple clues before deciding.`
    );
  }

  const nextStepTip =
    writtenReflections === 0
      ? 'Next time you finish an investigation, write one sentence on why your answer fits the clues.'
      : recheckMoments === 0
      ? 'Try testing one extra number or clue even after you spot a pattern—just to be sure.'
      : 'Keep comparing clues side by side before locking in your final choice.';

  return {
    patterns,
    studentSummary: {
      totalExplorations: allMissionIds.length,
      uniqueMissions: uniqueMissionIds.size,
      activeDays,
      recordedMoments: responseList.length,
      totalChecksTried,
      recheckMoments,
      writtenReflections,
      highlights,
      nextStepTip,
    },
  };
}