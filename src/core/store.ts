import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, MissionEvent, Session } from './sdk/types';

/* ─────────────────────────────────────────────────────────
   DAILY PROGRESS TYPES
   ───────────────────────────────────────────────────────── */

export interface DayProgress {
  unlockedAt: string;
  completedAt: string | null;
  missionsCompleted: string[];
}

interface AppState {
  user: (User & {
    tier: 'foundation' | 'advanced';
    registeredAt: string;
    trialEndsAt: string;
  }) | null;

  days: Record<number, DayProgress>;

  events: MissionEvent[];
  sessions: Session[];

  /* Setup */
  setUser: (
    user: { name: string; grade: number },
    trialDays: number
  ) => void;

  /* Progression */
  completeMission: (missionId: string) => void;
  isMissionDoneToday: (missionId: string) => boolean;
  getActiveDay: () => number;
  getActiveDayProgress: () => DayProgress | null;
  isDayComplete: (day: number) => boolean;
  refreshDayUnlocks: () => void;

  /* Trial */
  isTrialActive: () => boolean;
  getTrialDaysLeft: () => number | null;

  /* Utility */
  getStreak: () => number;
  addEvent: (event: MissionEvent) => void;
  reset: () => void;
}

/* ─────────────────────────────────────────────────────────
   HELPERS
   ───────────────────────────────────────────────────────── */

const todayKey = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const dateKeyOf = (iso: string): string => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const isNewCalendarDay = (pastIso: string): boolean => {
  return todayKey() > dateKeyOf(pastIso);
};

const tierForGrade = (grade: number): 'foundation' | 'advanced' => {
  return grade <= 7 ? 'foundation' : 'advanced';
};

const TOTAL_MISSIONS_PER_DAY = 4;

/* ─────────────────────────────────────────────────────────
   STORE
   ───────────────────────────────────────────────────────── */

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({

      user: null,
      days: {},
      events: [],
      sessions: [],

      /* ─── SETUP ─────────────────────────────────────── */
      setUser: (input, trialDays) => {
        const now = new Date();
        const trialEnds = new Date();
        trialEnds.setDate(trialEnds.getDate() + trialDays);

        set({
          user: {
            name: input.name.trim(),
            grade: input.grade,
            tier: tierForGrade(input.grade),
            createdAt: now.toISOString(),
            registeredAt: now.toISOString(),
            trialEndsAt: trialEnds.toISOString(),
          },
          days: {
            1: {
              unlockedAt: now.toISOString(),
              completedAt: null,
              missionsCompleted: [],
            },
          },
          events: [],
          sessions: [],
        });
      },

      /* ─── PROGRESSION ───────────────────────────────── */
      completeMission: (missionId) => {
        const state = get();
        if (!state.user) return;

        const activeDay = state.getActiveDay();
        const existing = state.days[activeDay] || {
          unlockedAt: new Date().toISOString(),
          completedAt: null,
          missionsCompleted: [],
        };

        if (existing.missionsCompleted.includes(missionId)) return;

        const updatedMissions = [...existing.missionsCompleted, missionId];
        const dayJustCompleted = updatedMissions.length >= TOTAL_MISSIONS_PER_DAY;

        const updatedDays = {
          ...state.days,
          [activeDay]: {
            ...existing,
            missionsCompleted: updatedMissions,
            completedAt: dayJustCompleted
              ? new Date().toISOString()
              : existing.completedAt,
          },
        };

        const nextDay = activeDay + 1;
        if (
          dayJustCompleted &&
          !updatedDays[nextDay] &&
          isNewCalendarDay(updatedDays[activeDay].completedAt!)
        ) {
          updatedDays[nextDay] = {
            unlockedAt: new Date().toISOString(),
            completedAt: null,
            missionsCompleted: [],
          };
        }

        const today = todayKey();
        const sessions = [...state.sessions];
        let todaySession = sessions.find((s) => s.date === today);
        if (!todaySession) {
          todaySession = { id: crypto.randomUUID(), date: today, missionsCompleted: [] };
          sessions.push(todaySession);
        }
        if (!todaySession.missionsCompleted.includes(missionId)) {
          todaySession.missionsCompleted.push(missionId);
        }

        set({ days: updatedDays, sessions });
      },

      isMissionDoneToday: (missionId) => {
        const state = get();
        const active = state.days[state.getActiveDay()];
        return active ? active.missionsCompleted.includes(missionId) : false;
      },

      getActiveDay: () => {
        const days = get().days;
        const nums = Object.keys(days).map(Number);
        return nums.length ? Math.max(...nums) : 1;
      },

      getActiveDayProgress: () => {
        const state = get();
        return state.days[state.getActiveDay()] || null;
      },

      isDayComplete: (day) => {
        const d = get().days[day];
        return !!(d && d.completedAt);
      },

      refreshDayUnlocks: () => {
        const state = get();
        if (!state.user) return;

        const updatedDays = { ...state.days };
        let changed = false;

        for (let d = 1; d < 30; d++) {
          const prev = updatedDays[d];
          const next = updatedDays[d + 1];

          if (prev && prev.completedAt && !next) {
            if (isNewCalendarDay(prev.completedAt)) {
              updatedDays[d + 1] = {
                unlockedAt: new Date().toISOString(),
                completedAt: null,
                missionsCompleted: [],
              };
              changed = true;
            }
          }
        }

        if (changed) {
          set({ days: updatedDays });
        }
      },

      /* ─── TRIAL ─────────────────────────────────────── */
      isTrialActive: () => {
        const user = get().user;
        if (!user) return false;
        return new Date() < new Date(user.trialEndsAt);
      },

      getTrialDaysLeft: () => {
        const user = get().user;
        if (!user) return null;
        const diff = Math.ceil(
          (new Date(user.trialEndsAt).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
        );
        return Math.max(0, diff);
      },

      /* ─── UTILITY ───────────────────────────────────── */
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

      addEvent: (event) =>
        set((s) => ({ events: [...s.events, event].slice(-5000) })),

      reset: () =>
        set({ user: null, days: {}, events: [], sessions: [] }),
    }),
    { name: 'cubitx-v1' }
  )
);