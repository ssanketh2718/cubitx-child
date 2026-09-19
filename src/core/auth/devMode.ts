const MODE_KEY = 'cubitx-dev-mode';
const DAY_KEY = 'cubitx-dev-day';

export function isDevMode(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(MODE_KEY) === '1';
}

export function enableDevMode(): void {
  localStorage.setItem(MODE_KEY, '1');
}

export function disableDevMode(): void {
  localStorage.removeItem(MODE_KEY);
  localStorage.removeItem(DAY_KEY);
}

/** Returns the developer-forced day, or null if using the natural calendar. */
export function getDevDayOverride(): number | null {
  if (typeof window === 'undefined') return null;
  const v = localStorage.getItem(DAY_KEY);
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 1 && n <= 30 ? n : null;
}

export function setDevDayOverride(day: number | null): void {
  if (day === null) localStorage.removeItem(DAY_KEY);
  else localStorage.setItem(DAY_KEY, String(day));
}

export const MOCK_PARENT = {
  id: 'dev-parent',
  email: 'dev@cubitx.in',
  name: 'Dev Parent',
};

export const MOCK_CHILDREN = [
  { id: 'dev-child-1', name: 'Test Kid', class_level: 6, avatar: '🦊' },
  { id: 'dev-child-2', name: 'Test Kid 2', class_level: 9, avatar: '🐼' },
];
