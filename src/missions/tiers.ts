import type { Tier } from './types';

export function tierForClass(classLevel: number): Tier {
  return classLevel <= 7 ? 1 : 2;
}
