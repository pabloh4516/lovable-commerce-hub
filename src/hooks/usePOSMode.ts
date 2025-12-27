import { useState, useCallback, useEffect } from 'react';

export type POSMode = 'quick' | 'detailed';

const STORAGE_KEY = 'pos-mode-preference';

export function usePOSMode() {
  const [mode, setModeState] = useState<POSMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return (saved === 'quick' || saved === 'detailed') ? saved : 'detailed';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const setMode = useCallback((newMode: POSMode) => {
    setModeState(newMode);
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((prev) => prev === 'quick' ? 'detailed' : 'quick');
  }, []);

  return {
    mode,
    setMode,
    toggleMode,
    isQuickMode: mode === 'quick',
    isDetailedMode: mode === 'detailed',
  };
}
