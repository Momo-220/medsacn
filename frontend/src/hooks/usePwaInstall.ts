'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getDeferredPrompt,
  triggerPwaInstall,
  isAppInstalled,
  type BeforeInstallPromptEvent,
} from '@/lib/pwa-install';

/**
 * Hook for PWA Install button (Chrome Android).
 * - canInstall: true when beforeinstallprompt has fired and app is not installed.
 * - install(): triggers native prompt; after accept/dismiss, canInstall becomes false.
 */
export function usePwaInstall(): {
  canInstall: boolean;
  install: () => Promise<'accepted' | 'dismissed'>;
  isInstalled: boolean;
} {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(() =>
    typeof window !== 'undefined' ? getDeferredPrompt() : null
  );

  useEffect(() => {
    const sync = () => setPrompt(getDeferredPrompt());
    window.addEventListener('pwa-install-available', sync);
    sync();
    return () => window.removeEventListener('pwa-install-available', sync);
  }, []);

  const isInstalled = isAppInstalled();
  const canInstall = !isInstalled && !!prompt;

  const install = useCallback(async (): Promise<'accepted' | 'dismissed'> => {
    const result = await triggerPwaInstall();
    return result;
  }, []);

  return { canInstall, install, isInstalled };
}
