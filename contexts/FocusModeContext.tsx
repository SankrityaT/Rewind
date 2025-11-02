'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type FocusMode = 'study' | 'job' | 'meeting' | 'browse' | null;

interface FocusModeContextType {
  focusMode: FocusMode;
  setFocusMode: (mode: FocusMode) => void;
}

const FocusModeContext = createContext<FocusModeContextType | undefined>(undefined);

export function FocusModeProvider({ children }: { children: ReactNode }) {
  const [focusMode, setFocusModeState] = useState<FocusMode>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('focusMode');
    if (saved && saved !== 'null') {
      setFocusModeState(saved as FocusMode);
    }
  }, []);

  // Save to localStorage when changed
  const setFocusMode = (mode: FocusMode) => {
    setFocusModeState(mode);
    if (mode) {
      localStorage.setItem('focusMode', mode);
    } else {
      localStorage.removeItem('focusMode');
    }
  };

  return (
    <FocusModeContext.Provider value={{ focusMode, setFocusMode }}>
      {children}
    </FocusModeContext.Provider>
  );
}

export function useFocusMode() {
  const context = useContext(FocusModeContext);
  if (context === undefined) {
    throw new Error('useFocusMode must be used within a FocusModeProvider');
  }
  return context;
}
