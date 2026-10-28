
const MODE_KEY = 'cubitx-dev-mode';
const DAY_KEY = 'cubitx-dev-day';

/**
 * Development mode is permitted only in Vite's development build.
 * A localStorage value must never activate it in production.
 */
export function isDevMode(): boolean {
  if (!import.meta.env.DEV || typeof window === 'undefined') {
    return false;
  }

  try {
    return window.localStorage.getItem(MODE_KEY) === '1';
  } catch {
    return false;
  }
}

export function enableDevMode(): void {
  if (!import.meta.env.DEV || typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(MODE_KEY, '1');
  } catch {
    // Development mode remains disabled if storage is unavailable.
  }
}

export function disableDevMode(): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.removeItem(MODE_KEY);
    window.localStorage.removeItem(DAY_KEY);
  } catch {
    // Nothing else is required if storage is unavailable.
  }
}

/** Returns the developer-forced day, or null if using the natural calendar. */
export function getDevDayOverride(): number | null {
  if (!isDevMode()) return null;

  try {
    const value = window.localStorage.getItem(DAY_KEY);
    if (!value) return null;

    const day = Number(value);

    return Number.isInteger(day) && day >= 1 && day <= 30
      ? day
      : null;
  } catch {
    return null;
  }
}

export function setDevDayOverride(day: number | null): void {
  if (!isDevMode()) return;

  try {
    if (day === null) {
      window.localStorage.removeItem(DAY_KEY);
      return;
    }

    if (Number.isInteger(day) && day >= 1 && day <= 30) {
      window.localStorage.setItem(DAY_KEY, String(day));
    }
  } catch {
    // Development override is optional.
  }
}

export const MOCK_PARENT = {
  id: 'dev-parent',
  email: 'dev@cubitx.in',
  name: 'Dev Parent',
};

export const MOCK_CHILDREN = [
  {
    id: 'dev-child-1',
    name: 'Test Kid',
    class_level: 6,
    avatar: '🦊',
  },
  {
    id: 'dev-child-2',
    name: 'Test Kid 2',
    class_level: 9,
    avatar: '🐼',
  },
];
