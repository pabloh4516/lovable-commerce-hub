import { Moon, Sun } from 'lucide-react';
import { forwardRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export const ThemeToggle = forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<typeof Button>>(
  function ThemeToggle(props, ref) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="w-9 h-9"
      {...props}
    >
      {isDark ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
      <span className="sr-only">Alternar tema</span>
    </Button>
  );
});

ThemeToggle.displayName = 'ThemeToggle';
