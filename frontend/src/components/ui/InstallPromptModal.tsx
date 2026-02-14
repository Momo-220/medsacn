'use client';

import React from 'react';
import { Smartphone, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface InstallPromptModalProps {
  isOpen: boolean;
  onYes: () => void;
  onNo: () => void;
}

export function InstallPromptModal({ isOpen, onYes, onNo }: InstallPromptModalProps) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-sm w-full p-6 relative">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4">
            <Smartphone className="w-8 h-8 text-primary dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-text-primary dark:text-gray-100 mb-2">
            {t('installPromptTitle')}
          </h3>
          <p className="text-text-secondary dark:text-gray-400 text-sm mb-6">
            {t('installPromptMessage')}
          </p>
          <div className="flex gap-3 w-full">
            <button
              onClick={onNo}
              className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-text-secondary dark:text-gray-300 font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {t('installPromptNo')}
            </button>
            <button
              onClick={onYes}
              className="flex-1 px-4 py-3 rounded-xl bg-primary dark:bg-blue-500 text-white font-semibold hover:bg-primary/90 dark:hover:bg-blue-600 transition-colors"
            >
              {t('installPromptYes')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
