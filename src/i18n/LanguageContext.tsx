'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '@/src/i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    // Load language from localStorage or browser preference on client
    const savedLanguage = (typeof window !== 'undefined'
      ? (localStorage.getItem('language') as Language | null)
      : null) as Language | null;
    const browserLanguage =
      typeof navigator !== 'undefined' && navigator.language.startsWith('fr')
        ? 'fr'
        : 'en';
    setLanguageState(savedLanguage || browserLanguage);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
