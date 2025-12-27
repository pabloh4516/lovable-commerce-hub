import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'pos-sidebar-hidden';

export function useFullscreen() {
  const [isSidebarHidden, setIsSidebarHidden] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'true';
  });
  
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);

  // Save preference to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(isSidebarHidden));
  }, [isSidebarHidden]);

  // Listen for native fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsNativeFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarHidden(prev => !prev);
  }, []);

  const showSidebar = useCallback(() => {
    setIsSidebarHidden(false);
  }, []);

  const hideSidebar = useCallback(() => {
    setIsSidebarHidden(true);
  }, []);

  const toggleNativeFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  }, []);

  const enterNativeFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  }, []);

  const exitNativeFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Exit fullscreen error:', error);
    }
  }, []);

  return {
    isSidebarHidden,
    isNativeFullscreen,
    toggleSidebar,
    showSidebar,
    hideSidebar,
    toggleNativeFullscreen,
    enterNativeFullscreen,
    exitNativeFullscreen,
  };
}
