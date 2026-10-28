import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, MissionEvent, Session, Tier } from './sdk/types';
import { sdkTierForClass } from '../missions/tiers';
import { isDevMode } from './auth/devMode';

export interface DayProgress {
  unlockedAt: string;
  completedAt: string | null;
  itemsCompleted: string[];
}

export interface SavedBehaviouralSignals {
  testsBeforeGuess?: number;
  wentBackToTest?: boolean;
  secondsOnItem?: number;
  timeToFirstTapMs?: number;
  backtrackCount?: number;
  changedAnswerCount?: number;
  hintsUsed?: number;
}

export interface SavedResponse {
  itemKey: string;
  engine: string;
  text?: string;
  picked?: number;
  behaviours?: SavedBehaviouralSignals;
  submittedAt: string;
}

type CubitXUser = User & {
  supabaseId?: string;
  registeredAt: string;
  trialEndsAt: string;
};

interface AppState {
  user: CubitXUser | null;
  days: Record<number, DayProgress>;
  events: MissionEvent[];
  sessions: Session[];
  responses: Record<string, SavedResponse>;

  devDayOverride: number | null;
  setDevDayOverride: (day: number | null) => void;
  setUser: (user: { name: string; grade: number }, trialDays: number) => void;
  setSupabaseId: (id: string) => void;

  completeItem: (itemId: string, requiredCount: number) => Promise<void>;
  completeMission: (missionId: string, requiredCount?: number) => void;
  isItemDoneToday: (itemId: string) => boolean;

  saveResponse: (
    itemKey: string,
    data: {
      engine: string;
      text?: string;
      picked?: number;
      behaviours?: SavedBehaviouralSignals;
    }
  ) => Promise<void>;
  getResponse: (itemKey: string) => SavedResponse | null;

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

const daysBetweenMidnights = (
  fromIso: string,
  to: Date = new Date()
): number => {
  const from = new Date(fromIso);
  from.setHours(0, 0, 0, 0);

  const target = new Date(to);
  target.setHours(0, 0, 0, 0);

  return Math.floor(
    (target.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)
  );
};

const MAX_DAYS = 30;
const DEV_DAY_KEY = 'cubitx-dev-day';

const readDevDay = (): number | null => {
  if (typeof window === 'undefined') return null;

  const v = window.localStorage.getItem(DEV_DAY_KEY);
  if (!v) return null;

  const n = Number(v);
  return Number.isFinite(n) && n >= 1 && n <= 30 ? n : null;
};

const writeDevDay = (day: number | null): void => {
  if (typeof window === 'undefined') return;

  if (day === null) {
    window.localStorage.removeItem(DEV_DAY_KEY);
  } else {
    window.localStorage.setItem(DEV_DAY_KEY, String(day));
  }
};

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      days: {},
      events: [],
      sessions: [],
      responses: {},
      devDayOverride: null,

      setDevDayOverride: (day) => {
        writeDevDay(day);
        set({ devDayOverride: day });
      },

      setSupabaseId: (id) => {
        const user = get().user;
        if (user) {
          set({ user: { ...user, supabaseId: id } });
        }
      },

      setUser: (input, trialDays) => {
        const existing = get().user;

        if (
          existing &&
          existing.name === input.name.trim() &&
          existing.grade === input.grade
        ) {
          return;
        }

        const now = new Date();
        const trialEnds = new Date();
        trialEnds.setDate(trialEnds.getDate() + trialDays);

        const tier: Tier = sdkTierForClass(input.grade);

        set({
          user: {
            name: input.name.trim(),
            grade: input.grade,
            tier,
            createdAt: now.toISOString(),
            registeredAt: now.toISOString(),
            trialEndsAt: trialEnds.toISOString(),
            supabaseId: existing?.supabaseId,
          },
          days:
            Object.keys(get().days).length > 0
              ? get().days
              : {
                  1: {
                    unlockedAt: now.toISOString(),
                    completedAt: null,
                    itemsCompleted: [],
                  },
                },
          events: [],
          sessions: [],
          responses: {},
        });
      },

      completeItem: async (itemId, requiredCount) => {
        const state = get();
        if (!state.user) return;

        const activeDay = state.getActiveDay();

        const existing = state.days[activeDay] || {
          unlockedAt: new Date().toISOString(),
          completedAt: null,
          itemsCompleted: [],
        };

        if (existing.itemsCompleted.includes(itemId)) return;

        const updatedItems = [...existing.itemsCompleted, itemId];
        const dayJustCompleted =
          requiredCount > 0 && updatedItems.length >= requiredCount;

        const updatedDays = {
          ...state.days,
          [activeDay]: {
            ...existing,
            itemsCompleted: updatedItems,
            completedAt: dayJustCompleted
              ? new Date().toISOString()
              : existing.completedAt,
          },
        };

        const today = todayKey();
        const sessions = [...state.sessions];

        let todaySession = sessions.find((s) => s.date === today);

        if (!todaySession) {
          todaySession = {
            id: crypto.randomUUID(),
            date: today,
            missionsCompleted: [],
          };
          sessions.push(todaySession);
        }

        if (!todaySession.missionsCompleted.includes(itemId)) {
          todaySession.missionsCompleted.push(itemId);
        }

        set({ days: updatedDays, sessions });
      },

      completeMission: (missionId, requiredCount = 1) => {
        void get().completeItem(missionId, requiredCount);
      },

      isItemDoneToday: (itemId) => {
        const state = get();
        const active = state.days[state.getActiveDay()];
        return active ? active.itemsCompleted.includes(itemId) : false;
      },

      saveResponse: async (itemKey, data) => {
        // Keep responses in local app state while server-side scoring is
        // intentionally disabled. Do not create cloud attempts that cannot
        // be scored, and do not imply that the answer was saved remotely.
        set((s) => ({
          responses: {
            ...s.responses,
            [itemKey]: {
              ...data,
              itemKey,
              submittedAt: new Date().toISOString(),
            },
          },
        }));
      },

      getResponse: (itemKey) => get().responses[itemKey] ?? null,

      getActiveDay: () => {
        const state = get();
        if (!state.user) return 1;

        if (isDevMode()) {
          const override = readDevDay();
          if (override !== null) return override;
        }

        for (let n = 1; n <= MAX_DAYS; n++) {
          const day = state.days[n];
          if (day && day.completedAt) continue;
          if (state.isDayCalendarUnlocked(n)) return n;
          return n;
        }

        return MAX_DAYS;
      },

      getActiveDayProgress: () =>
        get().days[get().getActiveDay()] || null,

      isDayComplete: (day) =>
        !!(get().days[day] && get().days[day].completedAt),

      isDayCalendarUnlocked: (day) => {
        const user = get().user;
        if (!user) return false;
        if (isDevMode()) return true;

        return daysBetweenMidnights(user.registeredAt) >= day - 1;
      },

      refreshDayUnlocks: () => {},

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
          } else {
            break;
          }
        }

        return streak;
      },

      addEvent: (event) =>
        set((s) => ({
          events: [...s.events, event].slice(-5000),
        })),

      reset: () =>
        set({
          user: null,
          days: {},
          events: [],
          sessions: [],
          responses: {},
          devDayOverride: null,
        }),
    }),
    {
      name: 'cubitx-v1',
      partialize: (state) => ({
        user: state.user,
        days: state.days,
        events: state.events,
        sessions: state.sessions,
        responses: state.responses,
      }),
    }
  )
);