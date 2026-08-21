'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9 rounded-full bg-brand-gray-100 dark:bg-brand-dark-800 animate-pulse" />;
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="relative flex items-center justify-center w-9 h-9 rounded-full bg-brand-gray-100 hover:bg-brand-gray-200 dark:bg-brand-dark-800 dark:hover:bg-brand-dark-900 transition-colors duration-200"
      aria-label="Toggle Dark Mode"
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-brand-orange-500" />
      ) : (
        <Moon className="w-4 h-4 text-brand-gray-600" />
      )}
    </button>
  );
}
