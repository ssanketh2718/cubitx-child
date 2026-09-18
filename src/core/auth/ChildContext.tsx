// src/core/auth/ChildContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useApp } from '../store';

interface Child {
  id: string;
  name: string;
  class_level: number;
  avatar: string;
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

  // Restore + reconcile when the children list changes
  useEffect(() => {
    if (kids.length === 0) {
      setActiveChildState(null);
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    // If the currently active child no longer exists, clear
    if (activeChild && !kids.some((k) => k.id === activeChild.id)) {
      setActiveChildState(null);
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    // If nothing active, try to restore from localStorage
    if (!activeChild) {
      const savedId = localStorage.getItem(STORAGE_KEY);
      if (savedId) {
        const found = kids.find((k) => k.id === savedId);
        if (found) {
          setActiveChildState(found);
          return;
        }
      }
      // Auto-select if there's only one child
      if (kids.length === 1) {
        setActiveChildState(kids[0]);
        localStorage.setItem(STORAGE_KEY, kids[0].id);
      }
    }
  }, [kids, activeChild]);

  // Hydrate the Zustand store from the active child
  useEffect(() => {
    if (!activeChild) return;

    const current = useApp.getState().user;
    const needsHydration =
      !current ||
      current.name !== activeChild.name ||
      current.grade !== activeChild.class_level;

    if (needsHydration) {
      useApp.getState().setUser(
        { name: activeChild.name, grade: activeChild.class_level },
        30
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
    <ChildContext.Provider value={{ activeChild, setActiveChild, clearActiveChild }}>
      {children}
    </ChildContext.Provider>
  );
}

export function useChild() {
  const ctx = useContext(ChildContext);
  if (!ctx) throw new Error('useChild must be inside <ChildProvider>');
  return ctx;
}
