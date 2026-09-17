import type { MissionEvent } from '../sdk/types';

export interface Marker {
  key: string;
  label: string;
  value: number | string;
  unit?: string;
}

export interface TraceStep {
  at: number;
  relativeSeconds: number;
  type: string;
  label: string;
  detail?: string;
}

export interface SessionSummary {
  id: string;
  missionId: string;
  missionName: string;
  missionEmoji: string;
  startTime: number;
  endTime: number;
  durationSeconds: number;
  roundsAttempted: number;
  roundsCorrect: number;
  accuracy: number;
  hintsUsed: number;
  hypothesesFormed: number;
  predictionsMade: number;
  predictionsCorrect: number;
  avgSecondsPerRound: number;
  avgSecondsPerAction: number;
  markers: Marker[];
  trace: TraceStep[];
}

const MISSION_META: Record<string, { name: string; emoji: string }> = {
  m1: { name: 'Secret Machine', emoji: '🔢' },
  m2: { name: 'Balance Detective', emoji: '⚖️' },
  m3: { name: 'Pattern Detective', emoji: '🔮' },
  m4: { name: 'Cause Detective', emoji: '🎯' },
  m5: { name: 'The Big Question', emoji: '💭' },
};

function avg(arr: number[]): number {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function analyzeEvents(events: MissionEvent[]): SessionSummary[] {
  const groups: Record<string, MissionEvent[]> = {};
  for (const e of events) {
    if (!groups[e.sessionId]) groups[e.sessionId] = [];
    groups[e.sessionId].push(e);
  }

  const summaries: SessionSummary[] = [];

  for (const [sessionId, sessionEvents] of Object.entries(groups)) {
    const sorted = [...sessionEvents].sort((a, b) => a.at - b.at);
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const missionId = first.missionId;
    const meta = MISSION_META[missionId] || { name: missionId, emoji: '❓' };

    const roundCompletions = sorted.filter(e => e.type === 'round_completed');
    const tests = sorted.filter(e => e.type === 'test_submitted');
    const hypotheses = sorted.filter(e => e.type === 'hypothesis_formed');
    const predictions = sorted.filter(e => e.type === 'prediction_made');
    const hints = sorted.filter(e => e.type === 'hint_used' || e.type === 'hint_requested');
    const giveUps = sorted.filter(e => e.type === 'give_up_pressed');

    const roundsAttempted = roundCompletions.length;
    const roundsCorrect = roundCompletions.filter(
      e => e.payload.correct === true
    ).length;
    const accuracy = roundsAttempted
      ? Math.round((roundsCorrect / roundsAttempted) * 100)
      : 0;

    const predictionsCorrect = predictions.filter(
      e => e.payload.correct === true
    ).length;

    const roundSeconds = roundCompletions
      .map(e => Number(e.payload.seconds) || 0)
      .filter(s => s > 0);

    const avgSecondsPerRound = round1(avg(roundSeconds));
    const durationSeconds = Math.round((last.at - first.at) / 1000);
    const avgSecondsPerAction = sorted.length
      ? round1(durationSeconds / sorted.length)
      : 0;

    const markers: Marker[] = [
      { key: 'accuracy', label: 'Accuracy', value: accuracy, unit: '%' },
      { key: 'tests', label: 'Tests run', value: tests.length },
      {
        key: 'systematicity',
        label: 'Systematic testing',
        value: computeSystematicity(tests.map(t => Number(t.payload.value))),
        unit: '%',
      },
      { key: 'hypotheses', label: 'Guesses formed', value: hypotheses.length },
      { key: 'predictions', label: 'Predictions right', value: predictionsCorrect },
      { key: 'hints', label: 'Hints used', value: hints.length },
      { key: 'giveUps', label: 'Gave up', value: giveUps.length },
      { key: 'avgSecRound', label: 'Avg seconds per round', value: avgSecondsPerRound, unit: 's' },
    ];

    const trace: TraceStep[] = sorted
      .filter(e =>
        [
          'test_submitted',
          'option_selected',
          'hypothesis_formed',
          'prediction_made',
          'hint_used',
          'hint_requested',
          'give_up_pressed',
          'round_completed',
          'first_instinct',
          'analysis_picked',
        ].includes(e.type)
      )
      .map(e => traceStepFromEvent(e, first.at));

    summaries.push({
      id: sessionId,
      missionId,
      missionName: meta.name,
      missionEmoji: meta.emoji,
      startTime: first.at,
      endTime: last.at,
      durationSeconds,
      roundsAttempted,
      roundsCorrect,
      accuracy,
      hintsUsed: hints.length,
      hypothesesFormed: hypotheses.length,
      predictionsMade: predictions.length,
      predictionsCorrect,
      avgSecondsPerRound,
      avgSecondsPerAction,
      markers,
      trace,
    });
  }

  summaries.sort((a, b) => b.startTime - a.startTime);
  return summaries;
}

function computeSystematicity(values: number[]): number {
  if (values.length < 3) return 0;
  let close = 0;
  for (let i = 1; i < values.length; i++) {
    if (Math.abs(values[i] - values[i - 1]) <= 2) close++;
  }
  return Math.round((close / (values.length - 1)) * 100);
}

function traceStepFromEvent(e: MissionEvent, startAt: number): TraceStep {
  const relativeSeconds = round1((e.at - startAt) / 1000);
  const p = e.payload as Record<string, unknown>;

  switch (e.type) {
    case 'test_submitted':
      return { at: e.at, relativeSeconds, type: e.type, label: `Tested ${p.value}`, detail: `machine said ${p.result}` };
    case 'option_selected':
      return { at: e.at, relativeSeconds, type: e.type, label: `Picked ${p.choice}`, detail: p.wasCorrect ? 'right' : 'wrong' };
    case 'hypothesis_formed':
      return { at: e.at, relativeSeconds, type: e.type, label: 'Formed a guess', detail: String(p.text || '').slice(0, 60) };
    case 'prediction_made':
      return { at: e.at, relativeSeconds, type: e.type, label: `Predicted ${p.predicted}`, detail: `actual ${p.actual} — ${p.correct ? 'right' : 'wrong'}` };
    case 'hint_used':
    case 'hint_requested':
      return { at: e.at, relativeSeconds, type: 'hint', label: 'Asked for hint' };
    case 'give_up_pressed':
      return { at: e.at, relativeSeconds, type: 'give_up', label: 'Gave up on puzzle' };
    case 'first_instinct':
      return { at: e.at, relativeSeconds, type: 'instinct', label: `First instinct: ${String(p.answer).toUpperCase()}`, detail: `${Math.round((p.timeMs as number) / 100) / 10}s to decide` };
    case 'analysis_picked':
      return { at: e.at, relativeSeconds, type: 'analysis', label: `Analysis: ${p.label}`, detail: p.correct ? '✓ correct' : '✗ wrong' };
    case 'round_completed':
      return { at: e.at, relativeSeconds, type: 'complete', label: `Round ${(e.round ?? 0) + 1} ${p.correct ? 'solved' : 'failed'}`, detail: `${p.seconds}s` };
    default:
      return { at: e.at, relativeSeconds, type: e.type, label: e.type };
  }
}
