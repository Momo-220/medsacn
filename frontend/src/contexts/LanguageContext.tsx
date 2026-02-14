'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language, TranslationKey } from '@/lib/i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Langues RTL (droite à gauche)
const RTL_LANGUAGES = ['ar'];

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('fr');

  const isRTL = RTL_LANGUAGES.includes(language);

  useEffect(() => {
    // Charger depuis localStorage
    const savedLanguage = localStorage.getItem('language') as Language | null;
    if (savedLanguage && ['fr', 'en', 'ar', 'tr'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    }
  }, []);

  // Mettre à jour la direction du document quand la langue change
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
      document.documentElement.lang = language;
    }
  }, [language, isRTL]);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const t = (key: TranslationKey): string => {
    return translations[language]?.[key] || translations.fr[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
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
