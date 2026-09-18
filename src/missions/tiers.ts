import type { Tier } from '../core/sdk/types';
import type { CurriculumTier } from './types';

/** Class 5-7 = foundation, Class 8-10 = advanced */
export function sdkTierForClass(classLevel: number): Tier {
  return classLevel <= 7 ? 'foundation' : 'advanced';
}

/** Map SDK tier ('foundation'|'advanced') to folder tier (1|2). */
export function curriculumTierFrom(sdkTier: Tier): CurriculumTier {
  return sdkTier === 'foundation' ? 1 : 2;
}