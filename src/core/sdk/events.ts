import type { MissionEvent } from './types';
import { useApp } from '../store';

export function emitEvent(
  type: string,
  missionId: string,
  sessionId: string,
  round: number,
  payload: Record<string, unknown> = {}
) {
  const event: MissionEvent = {
    type,
    missionId,
    sessionId,
    round,
    at: Date.now(),
    payload,
  };

  useApp.getState().addEvent(event);

  if (import.meta.env.DEV) {
    console.log('[event]', type, payload);
  }
}
