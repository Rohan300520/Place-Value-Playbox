import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
// Fix: Corrected import path for types
import type { Theme } from '../types';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('placeValueTheme') as Theme | null;
      if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
        setTheme(savedTheme);
      } else {
        // Fallback for first-time users or if localStorage is weird
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
      }
    } catch (e) {
      console.error("Could not access localStorage, defaulting to light theme.", e);
      setTheme('light');
    }
  }, []);

  useEffect(() => {
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${theme}-theme`);
    try {
      localStorage.setItem('placeValueTheme', theme);
    } catch (e) {
      console.error("Could not write theme to localStorage.", e);
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
