import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
// Fix: Corrected import path for types
import type { Language } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem('placeValueLanguage') as Language | null;
      if (savedLanguage && ['en', 'hi', 'kn'].includes(savedLanguage)) {
        setLanguageState(savedLanguage);
      }
    } catch (e) {
      console.error("Could not access localStorage, defaulting to English.", e);
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('placeValueLanguage', lang);
      document.documentElement.lang = lang;
    } catch (e) {
      console.error("Could not write language to localStorage.", e);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
