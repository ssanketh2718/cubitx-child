export type DomainKey =
  | 'hypothesis'
  | 'transitive'
  | 'pattern'
  | 'deduction'
  | 'articulation';

export interface MetricWeight {
  fn: string;
  weight: number;
}

export interface MissionContext {
  missionId: string;
  sessionId: string;
  emit: (type: string, payload?: Record<string, unknown>, round?: number) => void;
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
  createdAt: string;
}

export interface Session {
  id: string;
  date: string;
  missionsCompleted: string[];
}