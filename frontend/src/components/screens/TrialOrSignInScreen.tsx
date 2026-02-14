'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { apiClient } from '@/lib/api/client';
import { getDeviceId } from '@/lib/device';
import { analytics } from '@/lib/analytics';

interface TrialOrSignInScreenProps {
  onTryApp: () => void;
  onSignIn: () => void;
}

export function TrialOrSignInScreen({ onTryApp, onSignIn }: TrialOrSignInScreenProps) {
  const { t } = useLanguage();
  const { signInAnonymously } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTryApp = async () => {
    setError(null);
    setLoading(true);
    try {
      const deviceId = getDeviceId();
      const { can_use_trial } = await apiClient.checkTrial(deviceId);
      if (!can_use_trial) {
        setError(t('trialNotAvailable'));
        setLoading(false);
        return;
      }
      await signInAnonymously();
      await apiClient.registerTrial(deviceId);
      analytics.trialStart();
      onTryApp();
    } catch {
      setError(t('trialNotAvailable'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-white dark:bg-gray-950 flex flex-col items-center justify-center px-4 sm:px-8 py-12 pt-[max(3rem,env(safe-area-inset-top))] pb-[max(3rem,env(safe-area-inset-bottom))]">
      <div className="w-full max-w-xs text-center">
        <div className="mb-12">
          <div className="w-24 h-24 rounded-2xl overflow-hidden mx-auto mb-6 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
            <Image src="/logo.png" alt="MediScan" width={96} height={96} className="object-contain" priority />
          </div>
          <h1 className="font-poppins text-xl font-bold text-gray-900 dark:text-white">
            {t('trialOrSignInTitle')}
          </h1>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 font-medium">
            {t('trialOrSignInTagline')}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-amber-500/15 text-amber-800 dark:text-amber-200 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleTryApp}
          disabled={loading}
          className="w-full py-4 rounded-2xl font-semibold text-base bg-primary text-white hover:opacity-95 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none shadow-lg shadow-primary/25"
        >
          {loading ? '...' : t('tryApp')}
        </button>

        <button
          type="button"
          onClick={onSignIn}
          className="mt-5 text-sm text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-blue-400 transition-colors"
        >
          {t('signInOrRegister')}
        </button>
      </div>
    </div>
  );
}
