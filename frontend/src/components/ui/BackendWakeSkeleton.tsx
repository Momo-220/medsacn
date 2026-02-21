'use client';

import { useState, useEffect, useRef } from 'react';
import { setBackendWaking } from '@/components/ui/Skeleton';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888';
const PING_TIMEOUT_MS = 90000;
const PING_INTERVAL_MS = 2500;

/**
 * Pas d'overlay ni de cartes ajoutées : on ne fait que le ping backend et on positionne
 * __MEDISCAN_BACKEND_WAKING__ pour éviter l'alerte timeout. La home s'affiche avec ses
 * vrais composants en état chargement (shimmer sur les mêmes blocs).
 */
export function BackendWakeSkeleton() {
  const [backendReady, setBackendReady] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let cancelled = false;
    setBackendWaking(true);

    const pingBackend = async () => {
      const deadline = Date.now() + PING_TIMEOUT_MS;

      while (!cancelled && Date.now() < deadline) {
        try {
          abortRef.current = new AbortController();
          const res = await fetch(`${API_URL}/health`, {
            signal: abortRef.current.signal,
            cache: 'no-store',
          });
          if (res.ok) {
            if (!cancelled) {
              setBackendWaking(false);
              setBackendReady(true);
            }
            return;
          }
        } catch {
          // backend pas encore prêt
        }
        await new Promise((r) => setTimeout(r, PING_INTERVAL_MS));
      }
      if (!cancelled) setBackendWaking(false);
    };

    pingBackend();

    return () => {
      cancelled = true;
      setBackendWaking(false);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [backendReady]);

  return null;
}
