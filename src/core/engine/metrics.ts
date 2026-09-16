import type { MissionEvent } from '../sdk/types';

export function systematicity(events: MissionEvent[]): number | null {
  const tests = events
    .filter((e) => e.type === 'test_submitted')
    .map((e) => e.payload.value as number)
    .filter((v) => typeof v === 'number');
  if (tests.length < 3) return null;
  let close = 0;
  for (let i = 1; i < tests.length; i++) {
    if (Math.abs(tests[i] - tests[i - 1]) <= 2) close++;
  }
  return Math.round((100 * close) / (tests.length - 1));
}
