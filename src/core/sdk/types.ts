/* =========================================================
   CubitX SDK Types (v9.0 Annual Architecture)
   ========================================================= */

import type React from 'react';

export type DomainKey =
  | 'hypothesis'
  | 'transitive'
  | 'pattern'
  | 'deduction'
  | 'articulation'
  | 'causality';

export type Tier = 'foundation' | 'advanced';
export type CurriculumTier = 1 | 2 | 3 | 'foundation' | 'builder' | 'explorer';

export interface MetricWeight {
  fn: string;
  weight: number;
}

export interface MissionContext {
  missionId: string;
  sessionId: string;
  tier: Tier;
  emit: (
    type: string,
    payload?: Record<string, unknown>,
    round?: number
  ) => void;
  onComplete: () => void;
}

export interface MissionSpec {
  id: string;
  name: string;
  emoji: string;
  domain: DomainKey;
  domainName: string;
  sub: string;
  measures: MetricWeight[];
  idealTests?: (round: number) => number;
  maxTests?: (round: number) => number;
  tiers: Tier[];
  Component: React.ComponentType<{ ctx: MissionContext }>;
}

export interface MissionEvent {
  type: string;
  missionId: string;
  sessionId: string;
  round: number;
  at: number;
  payload: Record<string, unknown>;
}

export interface User {
  name: string;
  grade: number;
  tier: Tier;
  createdAt: string;
}

export interface Session {
  id: string;
  date: string;
  missionsCompleted: string[];
}

/* ─── v9.0 Mission & Socratic Authoring Contracts ─────────── */

export interface MissionChoiceOption {
  id: string;
  tag: string;
  label: string;
  isCorrect?: boolean;
  socraticCounter?: string;
}

export interface MissionClue {
  id: string;
  label: string;
  detail: string;
  isCausal: boolean;
}

export interface MissionChallengeCard {
  strength: 'strong' | 'weak' | 'decoy';
  headline: string;
  prompt: string;
}

export interface MissionStageSpec {
  id: string;
  title: string;
  phenomenonTag: string;
  difficultyLevel: 1 | 2 | 3 | 4 | 5;
  isFarTransfer?: boolean;
  hookPrompt: string;
  question: string;
  clues: MissionClue[];
  options: MissionChoiceOption[];
  challengeCard?: MissionChallengeCard;
  hints: [string, string, string];
  sceneKeywords: string[];
  causalKeywords: string[];
  decorativeKeywords: string[];
  mechanismKeywords: string[];
}

export interface DayConfig {
  day: number;
  title: string;
  theme?: string;
  items: MissionStageSpec[];
}