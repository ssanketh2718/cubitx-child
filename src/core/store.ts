import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, MissionEvent, Session, Tier } from './sdk/types';

interface AppState {
  user: User | null;
  trialEndsAt: string | null;
  paid: boolean;
  events: MissionEvent[];
  sessions: Session[];

  setUser: (user: User, trialEndsAt: string) => void;
  addEvent: (event: MissionEvent) => void;
  completeMission: (missionId: string) => void;
  isMissionDoneToday: (missionId: string) => boolean;
  getStreak: () => number;
  reset: () => void;
}

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      trialEndsAt: null,
      paid: false,
      events: [],
      sessions: [],

      setUser: (user, trialEndsAt) => set({ user, trialEndsAt }),

      addEvent: (event) =>
        set((s) => ({ events: [...s.events, event].slice(-5000) })),

      completeMission: (missionId) => {
        const today = todayKey();
        const sessions = [...get().sessions];
        let todaySession = sessions.find((s) => s.date === today);
        if (!todaySession) {
          todaySession = {
            id: crypto.randomUUID(),
            date: today,
            missionsCompleted: [],
          };
          sessions.push(todaySession);
        }
        if (!todaySession.missionsCompleted.includes(missionId)) {
          todaySession.missionsCompleted.push(missionId);
        }
        set({ sessions });
      },

      isMissionDoneToday: (missionId) => {
        const today = todayKey();
        const todaySession = get().sessions.find((s) => s.date === today);
        return todaySession?.missionsCompleted.includes(missionId) ?? false;
      },

      getStreak: () => {
        const sessions = get().sessions;
        if (!sessions.length) return 0;
        const dates = new Set(sessions.map((s) => s.date));
        let streak = 0;
        const d = new Date();
        while (true) {
          const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          if (dates.has(k)) {
            streak++;
            d.setDate(d.getDate() - 1);
          } else break;
        }
        return streak;
      },

      reset: () =>
        set({
          user: null,
          trialEndsAt: null,
          paid: false,
          events: [],
          sessions: [],
        }),
    }),
    {
      name: 'cubitx-v1',
      version: 2,
      migrate: (persistedState: any) => {
        if (persistedState?.user && !persistedState.user.tier) {
          const grade = persistedState.user.grade || 5;
          persistedState.user.tier = grade <= 7 ? 'foundation' : 'advanced';
        }
        return persistedState;
      },
    }
  )
);

/* Helper: derive tier from grade */
export function deriveTier(grade: number): Tier {
  return grade <= 7 ? 'foundation' : 'advanced';
}
