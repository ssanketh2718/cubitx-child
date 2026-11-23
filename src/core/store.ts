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

  user: CubitXUser | null;
  days: Record<number, DayProgress>;
  events: MissionEvent[];
  sessions: Session[];
  responses: Record<string, SavedResponse>;

  devDayOverride: number | null;
  setDevDayOverride: (day: number | null) => void;

  setActiveChildProfile: (
    child: { id: string; name: string; grade: number; createdAt?: string },
    planDays?: number
  ) => void;
  getChildBucket: (childId: string) => ChildLocalData | null;

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

  /** Returns which annual day (1..365) today's calendar date corresponds to since joining */
  getCalendarDaySinceJoining: () => number;
  /** Returns the current playable Day (starts at Day 1 on joining date, advances sequentially) */
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
  if (Number.isNaN(from.getTime())) return 0;
  from.setHours(0, 0, 0, 0);

  const target = new Date(to);
  target.setHours(0, 0, 0, 0);

  return Math.max(
    0,
    Math.floor((target.getTime() - from.getTime()) / (1000 * 60 * 60 * 24))
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
  parentSupabaseId: string | null,
  joinedAtIso?: string
): ChildLocalData {
  const joined = joinedAtIso ? new Date(joinedAtIso) : new Date();
  const validJoined = Number.isNaN(joined.getTime()) ? new Date() : joined;
  const planEnds = new Date(validJoined);
  planEnds.setDate(planEnds.getDate() + planDays);

  const tier: Tier = sdkTierForClass(grade);

  return {
    childId,
    user: {
      childId,
      name: name.trim(),
      grade,
      tier,
      createdAt: validJoined.toISOString(),
      registeredAt: validJoined.toISOString(),
      trialEndsAt: planEnds.toISOString(),
      supabaseId: parentSupabaseId ?? undefined,
    },
    days: {
      1: {
        unlockedAt: validJoined.toISOString(),
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

        // Anchor joining date: preserve earliest recorded joining date
        const anchorJoinedAt =
          existingBucket?.user?.registeredAt ||
          child.createdAt ||
          new Date().toISOString();

        const targetBucket: ChildLocalData = existingBucket
          ? {
              ...existingBucket,
              user: {
                ...existingBucket.user,
                childId: child.id,
                name: child.name.trim(),
                grade: child.grade,
                tier: nextTier,
                registeredAt: anchorJoinedAt,
                supabaseId:
                  state.parentSupabaseId ?? existingBucket.user.supabaseId,
              },
              days: {
                1: {
                  unlockedAt: anchorJoinedAt,
                  completedAt: null,
                  itemsCompleted: [],
                },
                ...existingBucket.days,
              },
            }
          : createFreshBucket(
              child.id,
              child.name,
              child.grade,
              planDays,
              state.parentSupabaseId,
              anchorJoinedAt
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

        const updatedDays: Record<number, DayProgress> = {
          ...state.days,
          [activeDay]: {
            ...existing,
            itemsCompleted: updatedItems,
            completedAt: dayJustCompleted
              ? new Date().toISOString()
              : existing.completedAt,
          },
        };

        // Pre-seed next day entry when current day completes
        if (dayJustCompleted && activeDay + 1 <= MAX_DAYS && !updatedDays[activeDay + 1]) {
          updatedDays[activeDay + 1] = {
            unlockedAt: new Date().toISOString(),
            completedAt: null,
            itemsCompleted: [],
          };
        }

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

      getCalendarDaySinceJoining: () => {
        const user = get().user;
        if (!user) return 1;
        const elapsed = daysBetweenMidnights(user.registeredAt);
        return Math.min(MAX_DAYS, Math.max(1, elapsed + 1));
      },

      getActiveDay: () => {
        const state = get();
        if (!state.user) return 1;

        if (isDevMode()) {
          const override = readDevDay();
          if (override !== null) return override;
        }

        // Joining date = Day 1. Child plays sequentially starting from Day 1,
        // never skipping an uncompleted day even if multiple calendar days elapsed.
        for (let n = 1; n <= MAX_DAYS; n++) {
          const dayRecord = state.days[n];
          if (dayRecord && dayRecord.completedAt) continue;
          return n;
        }

        return MAX_DAYS;
      },

      getActiveDayProgress: () =>
        get().days[get().getActiveDay()] || null,

      isDayComplete: (day) =>
        !!(get().days[day] && get().days[day].completedAt),

      isDayCalendarUnlocked: (day) => {
        const state = get();
        const user = state.user;
        if (!user) return false;
        if (day <= 1) return true;
        if (isDevMode()) return true;

        // Edge case 1: Calendar days since joining must have reached `day`
        const calendarReached =
          daysBetweenMidnights(user.registeredAt) >= day - 1;
        if (!calendarReached) return false;

        // Edge case 2: Previous day must be completed so child never skips Day 1
        return state.isDayComplete(day - 1);
      },

      refreshDayUnlocks: () => {
        const state = get();
        if (!state.user) return;
        const activeDay = state.getActiveDay();
        if (!state.days[activeDay]) {
          set({
            days: {
              ...state.days,
              [activeDay]: {
                unlockedAt: new Date().toISOString(),
                completedAt: null,
                itemsCompleted: [],
              },
            },
          });
        }
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