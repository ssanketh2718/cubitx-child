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
  // v9.0 Assessment & Socratic metadata
  question?: string;
  sceneKeywords?: string[];
  causalKeywords?: string[];
  decorativeKeywords?: string[];
  mechanismKeywords?: string[];
  isCorrect?: boolean;
  decoyCaught?: boolean;
  challengeStrength?: 'strong' | 'weak' | 'decoy';
  revisedFromText?: string;
  confidenceBefore?: number;
  confidenceAfter?: number;
  isFarTransfer?: boolean;
}

export type CubitXUser = User & {
  childId?: string;
  supabaseId?: string;
  registeredAt: string;
  trialEndsAt: string;
};

export interface ChildLocalData {
  childId: string;
  user: CubitXUser;
  days: Record<number, DayProgress>;
  events: MissionEvent[];
  sessions: Session[];
  responses: Record<string, SavedResponse>;
}

interface AppState {
  parentSupabaseId: string | null;
  activeChildId: string | null;
  childBuckets: Record<string, ChildLocalData>;

  // Active child mirrored slices (preserved for backwards compatibility)
  user: CubitXUser | null;
  days: Record<number, DayProgress>;
  events: MissionEvent[];
  sessions: Session[];
  responses: Record<string, SavedResponse>;

  devDayOverride: number | null;
  setDevDayOverride: (day: number | null) => void;

  /** Preferred: isolate local progress per immutable child ID (365-day annual horizon) */
  setActiveChildProfile: (
    child: { id: string; name: string; grade: number },
    planDays?: number
  ) => void;
  getChildBucket: (childId: string) => ChildLocalData | null;

  /** Legacy guest/onboarding helper (uses a transient 'guest-local' bucket) */
  setUser: (user: { name: string; grade: number }, planDays?: number) => void;
  setSupabaseId: (id: string) => void;

  completeItem: (itemId: string, requiredCount: number) => Promise<void>;
  completeMission: (missionId: string, requiredCount?: number) => void;
  isItemDoneToday: (itemId: string) => boolean;

  saveResponse: (
    itemKey: string,
    data: Omit<SavedResponse, 'itemKey' | 'submittedAt'>
  ) => Promise<void>;
  getResponse: (itemKey: string) => SavedResponse | null;

  getActiveDay: () => number;
  getActiveDayProgress: () => DayProgress | null;
  isDayComplete: (day: number) => boolean;
  isDayCalendarUnlocked: (day: number) => boolean;
  refreshDayUnlocks: () => void;

  isTrialActive: () => boolean;
  getTrialDaysLeft: () => number | null;
  /** @deprecated V1.2 prohibits streak pressure. Retained only for legacy callers. */
  getStreak: () => number;
  addEvent: (event: MissionEvent) => void;
  reset: () => void;
}

const GUEST_BUCKET_ID = 'guest-local';
export const ANNUAL_SUBSCRIPTION_DAYS = 365;
const MAX_DAYS = ANNUAL_SUBSCRIPTION_DAYS;
const DEV_DAY_KEY = 'cubitx-dev-day';

const todayKey = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
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

const readDevDay = (): number | null => {
  if (typeof window === 'undefined') return null;

  const v = window.localStorage.getItem(DEV_DAY_KEY);
  if (!v) return null;

  const n = Number(v);
  return Number.isFinite(n) && n >= 1 && n <= MAX_DAYS ? n : null;
};

const writeDevDay = (day: number | null): void => {
  if (typeof window === 'undefined') return;

  if (day === null) {
    window.localStorage.removeItem(DEV_DAY_KEY);
  } else {
    window.localStorage.setItem(DEV_DAY_KEY, String(day));
  }
};

function createFreshBucket(
  childId: string,
  name: string,
  grade: number,
  planDays: number,
  parentSupabaseId: string | null
): ChildLocalData {
  const now = new Date();
  const planEnds = new Date();
  planEnds.setDate(planEnds.getDate() + planDays);

  const tier: Tier = sdkTierForClass(grade);

  return {
    childId,
    user: {
      childId,
      name: name.trim(),
      grade,
      tier,
      createdAt: now.toISOString(),
      registeredAt: now.toISOString(),
      trialEndsAt: planEnds.toISOString(),
      supabaseId: parentSupabaseId ?? undefined,
    },
    days: {
      1: {
        unlockedAt: now.toISOString(),
        completedAt: null,
        itemsCompleted: [],
      },
    },
    events: [],
    sessions: [],
    responses: {},
  };
}

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      parentSupabaseId: null,
      activeChildId: null,
      childBuckets: {},

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
        set((state) => ({
          parentSupabaseId: id,
          user: state.user ? { ...state.user, supabaseId: id } : null,
        }));
      },

      setActiveChildProfile: (child, planDays = ANNUAL_SUBSCRIPTION_DAYS) => {
        const state = get();
        const buckets = { ...state.childBuckets };

        // Persist any live state for the previously active child before switching
        if (state.activeChildId && state.user) {
          buckets[state.activeChildId] = {
            childId: state.activeChildId,
            user: state.user,
            days: state.days,
            events: state.events,
            sessions: state.sessions,
            responses: state.responses,
          };
        }

        const existingBucket = buckets[child.id];
        const nextTier: Tier = sdkTierForClass(child.grade);

        const targetBucket: ChildLocalData = existingBucket
          ? {
              ...existingBucket,
              user: {
                ...existingBucket.user,
                childId: child.id,
                name: child.name.trim(),
                grade: child.grade,
                tier: nextTier,
                supabaseId:
                  state.parentSupabaseId ?? existingBucket.user.supabaseId,
              },
            }
          : createFreshBucket(
              child.id,
              child.name,
              child.grade,
              planDays,
              state.parentSupabaseId
            );

        buckets[child.id] = targetBucket;

        set({
          activeChildId: child.id,
          childBuckets: buckets,
          user: targetBucket.user,
          days: targetBucket.days,
          events: targetBucket.events,
          sessions: targetBucket.sessions,
          responses: targetBucket.responses,
        });
      },

      getChildBucket: (childId) => {
        const state = get();
        if (state.activeChildId === childId && state.user) {
          return {
            childId,
            user: state.user,
            days: state.days,
            events: state.events,
            sessions: state.sessions,
            responses: state.responses,
          };
        }
        return state.childBuckets[childId] ?? null;
      },

      setUser: (input, planDays = ANNUAL_SUBSCRIPTION_DAYS) => {
        const state = get();
        const bucketId = state.activeChildId ?? GUEST_BUCKET_ID;

        if (
          state.user &&
          state.activeChildId === bucketId &&
          state.user.name === input.name.trim() &&
          state.user.grade === input.grade
        ) {
          return;
        }

        get().setActiveChildProfile(
          { id: bucketId, name: input.name, grade: input.grade },
          planDays
        );
      },

      completeItem: async (itemId, requiredCount) => {
        const state = get();
        if (!state.user) return;

        const bucketId = state.activeChildId ?? GUEST_BUCKET_ID;
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
        const sessions = state.sessions.map((s) => ({
          ...s,
          missionsCompleted: [...s.missionsCompleted],
        }));

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

        const updatedBucket: ChildLocalData = {
          childId: bucketId,
          user: state.user,
          days: updatedDays,
          events: state.events,
          sessions,
          responses: state.responses,
        };

        set({
          days: updatedDays,
          sessions,
          childBuckets: {
            ...state.childBuckets,
            [bucketId]: updatedBucket,
          },
        });
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
        set((state) => {
          const bucketId = state.activeChildId ?? GUEST_BUCKET_ID;
          const nextResponses: Record<string, SavedResponse> = {
            ...state.responses,
            [itemKey]: {
              ...data,
              itemKey,
              submittedAt: new Date().toISOString(),
            },
          };

          const nextBuckets = state.user
            ? {
                ...state.childBuckets,
                [bucketId]: {
                  childId: bucketId,
                  user: state.user,
                  days: state.days,
                  events: state.events,
                  sessions: state.sessions,
                  responses: nextResponses,
                },
              }
            : state.childBuckets;

          return {
            responses: nextResponses,
            childBuckets: nextBuckets,
          };
        });
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
          const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
            2,
            '0'
          )}-${String(d.getDate()).padStart(2, '0')}`;

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
        set((state) => {
          const bucketId = state.activeChildId ?? GUEST_BUCKET_ID;
          const nextEvents = [...state.events, event].slice(-5000);

          const nextBuckets = state.user
            ? {
                ...state.childBuckets,
                [bucketId]: {
                  childId: bucketId,
                  user: state.user,
                  days: state.days,
                  events: nextEvents,
                  sessions: state.sessions,
                  responses: state.responses,
                },
              }
            : state.childBuckets;

          return {
            events: nextEvents,
            childBuckets: nextBuckets,
          };
        }),

      reset: () =>
        set({
          parentSupabaseId: null,
          activeChildId: null,
          childBuckets: {},
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
        activeChildId: state.activeChildId,
        childBuckets: state.childBuckets,
        user: state.user,
        days: state.days,
        events: state.events,
        sessions: state.sessions,
        responses: state.responses,
      }),
    }
  )
);