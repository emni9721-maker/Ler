import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { AppTheme } from '../types';

interface ThemeContextType {
  theme: AppTheme;
  isAmoled: boolean;
  toggleTheme: () => void;
  setTheme: (theme: AppTheme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'midnight',
  isAmoled: false,
  toggleTheme: () => {},
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: AppTheme;
  onThemeChange?: (newTheme: AppTheme) => void;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialTheme,
  onThemeChange,
}) => {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    if (initialTheme) return initialTheme;
    try {
      const saved = localStorage.getItem('zero_theme');
      if (saved === 'amoled' || saved === 'midnight') return saved;
    } catch {
      // ignore
    }
    return 'midnight';
  });

  const applyTheme = (newTheme: AppTheme) => {
    try {
      localStorage.setItem('zero_theme', newTheme);
    } catch {
      // ignore
    }
    document.documentElement.setAttribute('data-theme', newTheme);
    document.body.setAttribute('data-theme', newTheme);
  };

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    onThemeChange?.(newTheme);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'midnight' ? 'amoled' : 'midnight';
    setTheme(nextTheme);
  };

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const value = {
    theme,
    isAmoled: theme === 'amoled',
    toggleTheme,
    setTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
