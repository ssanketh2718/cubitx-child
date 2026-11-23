import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth, type EducationBoard } from './AuthContext';
import { useApp, ANNUAL_SUBSCRIPTION_DAYS } from '../store';

export interface Child {
  id: string;
  name: string;
  class_level: number;
  avatar: string;
  board?: EducationBoard | null;
  created_at?: string;
}

interface ChildContextType {
  activeChild: Child | null;
  setActiveChild: (child: Child) => void;
  clearActiveChild: () => void;
}

const ChildContext = createContext<ChildContextType | null>(null);

const STORAGE_KEY = 'cubitx-active-child-id';

export function ChildProvider({ children }: { children: ReactNode }) {
  const { children: kids } = useAuth();
  const [activeChild, setActiveChildState] = useState<Child | null>(null);

  useEffect(() => {
    if (kids.length === 0) {
      setActiveChildState(null);
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    if (activeChild && !kids.some((k) => k.id === activeChild.id)) {
      setActiveChildState(null);
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    if (activeChild) {
      const updated = kids.find((k) => k.id === activeChild.id);
      if (
        updated &&
        (updated.name !== activeChild.name ||
          updated.class_level !== activeChild.class_level ||
          updated.avatar !== activeChild.avatar ||
          updated.board !== activeChild.board)
      ) {
        setActiveChildState(updated);
      }
      return;
    }

    const savedId = localStorage.getItem(STORAGE_KEY);
    if (savedId) {
      const found = kids.find((k) => k.id === savedId);
      if (found) {
        setActiveChildState(found);
        return;
      }
    }

    if (kids.length === 1) {
      setActiveChildState(kids[0]);
      localStorage.setItem(STORAGE_KEY, kids[0].id);
    }
  }, [kids, activeChild]);

  useEffect(() => {
    if (!activeChild) return;

    const state = useApp.getState();
    const needsSwitch =
      state.activeChildId !== activeChild.id ||
      state.user?.name !== activeChild.name ||
      state.user?.grade !== activeChild.class_level;

    if (needsSwitch) {
      state.setActiveChildProfile(
        {
          id: activeChild.id,
          name: activeChild.name,
          grade: activeChild.class_level,
          createdAt: activeChild.created_at,
        },
        ANNUAL_SUBSCRIPTION_DAYS
      );
    }
  }, [activeChild]);

  const setActiveChild = (child: Child) => {
    setActiveChildState(child);
    localStorage.setItem(STORAGE_KEY, child.id);
  };

  const clearActiveChild = () => {
    setActiveChildState(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <ChildContext.Provider
      value={{ activeChild, setActiveChild, clearActiveChild }}
    >
      {children}
    </ChildContext.Provider>
  );
}

export function useChild() {
  const ctx = useContext(ChildContext);
  if (!ctx) throw new Error('useChild must be inside <ChildProvider>');
  return ctx;
}