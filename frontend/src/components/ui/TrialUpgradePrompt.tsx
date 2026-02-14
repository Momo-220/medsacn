'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { Heart } from 'lucide-react';

interface TrialUpgradePromptProps {
  onSignUp: () => void;
  className?: string;
  /** Variante compacte (carte) ou pleine (bloc principal) */
  variant?: 'card' | 'full';
}

/**
 * Message calme et posé pour inviter l'utilisateur en mode essai à créer un compte.
 * Jouer sur l'émotion sans être agressif.
 */
export function TrialUpgradePrompt({ onSignUp, className = '', variant = 'card' }: TrialUpgradePromptProps) {
  const { t } = useLanguage();
  const { user } = useAuth();

  if (!user?.isAnonymous) return null;

  const content = (
    <div className="text-center">
      <div className="inline-flex w-12 h-12 rounded-full bg-primary/10 dark:bg-blue-900/30 items-center justify-center mb-4">
        <Heart className="w-6 h-6 text-primary dark:text-blue-400" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-semibold text-text-primary dark:text-gray-100 mb-2">
        {t('upgradeTitle')}
      </h3>
      <p className="text-sm text-text-secondary dark:text-gray-400 leading-relaxed mb-6 max-w-sm mx-auto">
        {t('upgradeMessage')}
      </p>
      <button
        type="button"
        onClick={onSignUp}
        className="w-full max-w-xs mx-auto py-3 rounded-xl font-semibold text-base bg-primary text-white hover:opacity-95 active:scale-[0.98] transition-all"
      >
        {t('upgradeCta')}
      </button>
    </div>
  );

  if (variant === 'full') {
    return (
      <div className={`flex flex-col items-center justify-center py-12 px-6 ${className}`}>
        <div className="w-full max-w-md">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className={`card dark:bg-gray-800 dark:border-gray-700 p-6 ${className}`}>
      {content}
    </div>
  );
}
