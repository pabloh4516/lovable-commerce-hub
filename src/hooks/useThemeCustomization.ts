import { useState, useEffect, useCallback } from 'react';

export interface ThemeColors {
  id: string;
  name: string;
  primary: string;
  primaryHue: number;
}

export const themePresets: ThemeColors[] = [
  { id: 'blue', name: 'Azul', primary: '221 83% 53%', primaryHue: 221 },
  { id: 'green', name: 'Verde', primary: '142 71% 45%', primaryHue: 142 },
  { id: 'red', name: 'Vermelho', primary: '0 84% 60%', primaryHue: 0 },
  { id: 'purple', name: 'Roxo', primary: '262 83% 58%', primaryHue: 262 },
  { id: 'orange', name: 'Laranja', primary: '24 95% 53%', primaryHue: 24 },
  { id: 'teal', name: 'Turquesa', primary: '173 80% 40%', primaryHue: 173 },
  { id: 'pink', name: 'Rosa', primary: '330 81% 60%', primaryHue: 330 },
  { id: 'indigo', name: 'Índigo', primary: '239 84% 67%', primaryHue: 239 },
];

const THEME_STORAGE_KEY = 'app-theme-color';

export function useThemeCustomization() {
  const [currentTheme, setCurrentTheme] = useState<ThemeColors>(themePresets[0]);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedThemeId = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedThemeId) {
      const savedTheme = themePresets.find(t => t.id === savedThemeId);
      if (savedTheme) {
        setCurrentTheme(savedTheme);
        applyTheme(savedTheme);
      }
    }
  }, []);

  const applyTheme = useCallback((theme: ThemeColors) => {
    const root = document.documentElement;
    
    // Apply primary color
    root.style.setProperty('--primary', theme.primary);
    
    // Update ring color to match
    root.style.setProperty('--ring', theme.primary);
    
    // For dark mode, slightly adjust the color
    const isDark = root.classList.contains('dark');
    if (isDark) {
      // Slightly lighter version for dark mode
      const [h, s, l] = theme.primary.split(' ');
      const adjustedL = Math.min(parseInt(l) + 10, 70);
      root.style.setProperty('--primary', `${h} ${s} ${adjustedL}%`);
    }
  }, []);

  const setTheme = useCallback((theme: ThemeColors) => {
    setCurrentTheme(theme);
    applyTheme(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme.id);
  }, [applyTheme]);

  // Re-apply theme when dark mode changes
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          applyTheme(currentTheme);
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, [currentTheme, applyTheme]);

  return {
    currentTheme,
    setTheme,
    themePresets,
  };
}
