'use client';

import React from 'react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/lib/i18n/translations';

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
];

interface LanguageSelectionScreenProps {
  onComplete: () => void;
}

export function LanguageSelectionScreen({ onComplete }: LanguageSelectionScreenProps) {
  const { setLanguage, t } = useLanguage();

  const handleSelect = (code: Language) => {
    setLanguage(code);
    onComplete();
  };

  return (
    <div className="min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-background dark:bg-gray-900 flex flex-col items-center justify-center px-4 sm:px-6 py-12 pt-[max(3rem,env(safe-area-inset-top))] pb-[max(3rem,env(safe-area-inset-bottom))] relative transition-colors">
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-72 h-72 rounded-full bg-primary/10 dark:bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-72 h-72 rounded-full bg-primary/5 dark:bg-primary/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-12">
          <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-card border border-gray-100 dark:border-gray-700/50 mb-5 bg-white dark:bg-gray-800 flex items-center justify-center ring-2 ring-primary/10">
            <Image src="/logo.png" alt="MediScan" width={80} height={80} className="object-contain" priority />
          </div>
          <h1 className="font-poppins text-2xl font-bold text-text-primary dark:text-gray-100 tracking-tight">
            MediScan
          </h1>
        </div>

        <p className="text-center text-lg text-text-secondary dark:text-gray-400 mb-8 font-medium">
          {t('onboardingChooseLanguage')}
        </p>

        {/* Language cards */}
        <div className="grid grid-cols-2 gap-4">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className="flex flex-col items-center gap-3 py-6 px-4 rounded-2xl bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 shadow-card hover:border-primary dark:hover:border-primary/70 hover:shadow-card-hover transition-all duration-200 active:scale-95"
            >
              <span className="text-4xl">{lang.flag}</span>
              <span className="font-semibold text-text-primary dark:text-gray-100 text-sm">
                {lang.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
