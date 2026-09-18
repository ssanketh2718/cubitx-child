import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, MissionEvent, Session } from './sdk/types';

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

  setUser: (
    user: { name: string; grade: number },
    trialDays: number
  ) => void;

  completeMission: (missionId: string) => void;
  isMissionDoneToday: (missionId: string) => boolean;
  getActiveDay: () => number;
  getActiveDayProgress: () => DayProgress | null;
  isDayComplete: (day: number) => boolean;
  isDayCalendarUnlocked: (day: number) => boolean;
  refreshDayUnlocks: () => void;

  isTrialActive: () => boolean;
  getTrialDaysLeft: () => number | null;

  getStreak: () => number;
  addEvent: (event: MissionEvent) => void;
  reset: () => void;
}

const todayKey = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const tierForGrade = (grade: number): 'foundation' | 'advanced' => {
  return grade <= 7 ? 'foundation' : 'advanced';
};

/**
 * Number of missions the child must complete to finish a day.
 * Both tiers require all 5 mission types.
 */
const MISSIONS_PER_DAY = 5;

const MAX_DAYS = 30;

/**
 * Number of calendar days between two dates, using local midnight boundaries.
 * 0 if same day, 1 if next day, etc.
 */
const daysBetweenMidnights = (fromIso: string, to: Date = new Date()): number => {
  const from = new Date(fromIso);
  from.setHours(0, 0, 0, 0);
  const target = new Date(to);
  target.setHours(0, 0, 0, 0);
  return Math.floor((target.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
};

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      days: {},
      events: [],
      sessions: [],

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
        const dayJustCompleted = updatedMissions.length >= MISSIONS_PER_DAY;

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

      /**
       * The day the child is currently working on.
       * = smallest non-completed day.
       * If that day is not yet calendarly unlocked, returns the previous day
       * so Home shows "Day N complete. Come back tomorrow."
       */
      getActiveDay: () => {
        const state = get();
        if (!state.user) return 1;

        for (let n = 1; n <= MAX_DAYS; n++) {
          const day = state.days[n];
          const isCompleted = !!(day && day.completedAt);
          if (isCompleted) continue;

          // Found the smallest non-completed day.
          if (state.isDayCalendarUnlocked(n)) {
            return n;
          }

          // Not calendarly unlocked yet. Return the last completed day
          // so Home shows "come back tomorrow" instead of "locked".
          return Math.max(1, n - 1);
        }

        return MAX_DAYS;
      },

      getActiveDayProgress: () => {
        const state = get();
        return state.days[state.getActiveDay()] || null;
      },

      isDayComplete: (day) => {
        const d = get().days[day];
        return !!(d && d.completedAt);
      },

      /**
       * Day N is calendarly unlocked if at least (N-1) full calendar days
       * have passed since registration.
       * Day 1 is always unlocked on signup day.
       */
      isDayCalendarUnlocked: (day) => {
        const user = get().user;
        if (!user) return false;
        return daysBetweenMidnights(user.registeredAt) >= day - 1;
      },

      /**
       * Kept for backward compatibility — Home.tsx calls it on mount.
       * Days are computed on-demand now, so nothing to refresh.
       */
      refreshDayUnlocks: () => {
        // no-op
      },

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
