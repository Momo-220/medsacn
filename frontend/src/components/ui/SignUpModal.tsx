'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignUp: () => void;
}

export function SignUpModal({ isOpen, onClose, onSignUp }: SignUpModalProps) {
  const { t } = useLanguage();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full p-6 shadow-xl">
        <h3 className="text-lg font-bold text-text-primary dark:text-gray-100 mb-2">
          {t('insufficientCredits')}
        </h3>
        <p className="text-sm text-text-secondary dark:text-gray-400 mb-6">
          Connectez-vous ou créez un compte pour continuer à utiliser l&apos;application et obtenir plus de gemmes.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-text-primary dark:text-gray-200 font-semibold"
          >
            {t('cancel')}
          </button>
          <button
            onClick={onSignUp}
            className="flex-1 py-3 rounded-xl bg-primary text-white font-semibold hover:opacity-95"
          >
            {t('signInOrRegister')}
          </button>
        </div>
      </div>
    </div>
  );
}
