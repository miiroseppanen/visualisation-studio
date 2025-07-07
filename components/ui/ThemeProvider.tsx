'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'system' | 'pastel';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark' | 'pastel';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark' | 'pastel'>('light');

  // Set theme on mount and listen for system changes
  useEffect(() => {
    const persisted = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    let initial: Theme = 'system';
    if (persisted === 'light' || persisted === 'dark' || persisted === 'system' || persisted === 'pastel') {
      initial = persisted;
    }
    setThemeState(initial);
    applyTheme(initial);
  }, []);

  // Listen for system theme changes if in system mode
  useEffect(() => {
    if (theme !== 'system') return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      applyTheme('system');
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
    }
    applyTheme(newTheme);
  };

  function applyTheme(theme: Theme) {
    const root = window.document.documentElement;
    
    // Remove all theme classes first
    root.classList.remove('dark', 'theme-pastel');
    
    let resolved: 'light' | 'dark' | 'pastel' = 'light';
    
    if (theme === 'dark') {
      root.classList.add('dark');
      resolved = 'dark';
    } else if (theme === 'light') {
      // No classes needed for light theme (default)
      resolved = 'light';
    } else if (theme === 'pastel') {
      root.classList.add('theme-pastel');
      resolved = 'pastel';
    } else {
      // system
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        root.classList.add('dark');
        resolved = 'dark';
      } else {
        resolved = 'light';
      }
    }
    
    setResolvedTheme(resolved);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
} 