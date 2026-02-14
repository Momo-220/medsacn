'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';

interface AskNameScreenProps {
  onComplete: () => void;
}

const USER_NAME_STORAGE_KEY = 'mediscan_user_name';

export function AskNameScreen({ onComplete }: AskNameScreenProps) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleSubmit = (event?: React.FormEvent) => {
    if (event) event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed.length < 2) return;

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(USER_NAME_STORAGE_KEY, trimmed);
    }

    onComplete();
  };

  const isDisabled = name.trim().length < 2;

  React.useEffect(() => {
    // Focus automatique sur l'input au chargement
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className="min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-background dark:bg-gray-900 flex flex-col items-center justify-center px-4 sm:px-6 py-12 pt-[max(3rem,env(safe-area-inset-top))] pb-[max(3rem,env(safe-area-inset-bottom))]">
      <div className="w-full max-w-sm text-center">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 rounded-2xl overflow-hidden mb-5 bg-white dark:bg-gray-800 flex items-center justify-center shadow-lg">
            <Image
              src="/logo.png"
              alt="MediScan"
              width={80}
              height={80}
              className="object-contain"
              priority
            />
          </div>
          <h1 
            className="font-poppins text-3xl font-bold text-text-primary dark:text-gray-100 leading-snug cursor-text"
            onClick={() => inputRef.current?.focus()}
          >
            {t('askNameTitle')}{' '}
            <span className="relative inline-block min-w-[4ch]">
              {name ? (
                <span className="text-primary dark:text-blue-400">{name}</span>
              ) : (
                <span className="text-text-secondary dark:text-gray-500">...</span>
              )}
              <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="absolute inset-0 bg-transparent border-none outline-none text-3xl font-bold text-primary dark:text-blue-400 opacity-0 w-full"
                style={{ 
                  caretColor: 'currentColor',
                  border: 'none',
                  borderBottom: 'none',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  boxShadow: 'none',
                  background: 'transparent',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  appearance: 'none'
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && name.trim().length >= 2) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
            </span>
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <button
            type="submit"
            disabled={isDisabled}
            className="w-full py-3 rounded-xl font-semibold text-base bg-primary text-white hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-60 disabled:pointer-events-none mt-6"
          >
            {t('askNameButton')}
          </button>
        </form>
      </div>
    </div>
  );
}

