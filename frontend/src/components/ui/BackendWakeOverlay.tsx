'use client';

import { useState, useEffect, useRef } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888';
const SHOW_DELAY_MS = 3000;
const PING_TIMEOUT_MS = 90000;
const PING_INTERVAL_MS = 2500;

export function BackendWakeOverlay() {
  const [backendReady, setBackendReady] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [fading, setFading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let cancelled = false;

    timerRef.current = setTimeout(() => {
      if (!cancelled && !backendReady) setShowOverlay(true);
    }, SHOW_DELAY_MS);

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
              setBackendReady(true);
              setFading(true);
              setTimeout(() => { if (!cancelled) setShowOverlay(false); }, 600);
            }
            return;
          }
        } catch {
          // backend pas encore prêt
        }
        await new Promise((r) => setTimeout(r, PING_INTERVAL_MS));
      }
    };

    pingBackend();

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [backendReady]);

  if (!showOverlay) return null;

  return (
    <div
      className={`
        fixed inset-0 z-[9998] flex items-center justify-center
        transition-opacity duration-500 ease-out
        ${fading ? 'opacity-0 pointer-events-none' : 'opacity-100'}
      `}
    >
      {/* Glassmorphism layer */}
      <div className="absolute inset-0 bg-white/40 dark:bg-gray-900/50 backdrop-blur-xl" />

      {/* Spinner discret */}
      <div className="relative z-10">
        <div className="w-12 h-12 rounded-full border-[3px] border-primary/20 border-t-primary animate-spin" />
      </div>
    </div>
  );
}
