const KEY = 'cubitx-dev-mode';

export function isDevMode(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(KEY) === '1';
}

export function enableDevMode(): void {
  localStorage.setItem(KEY, '1');
}

export function disableDevMode(): void {
  localStorage.removeItem(KEY);
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
