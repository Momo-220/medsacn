'use client';

import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { usePwaInstall } from '@/hooks/usePwaInstall';

type PwaInstallButtonProps = {
  label?: string;
  className?: string;
};

/**
 * PWA Install button for Chrome Android.
 * Renders only when installation is available and app is not already installed.
 * Triggers native install prompt on click; hides after accept/dismiss.
 */
export function PwaInstallButton({ label = 'Installer l\'app', className = '' }: PwaInstallButtonProps) {
  const { canInstall, install } = usePwaInstall();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!canInstall) return;
    setLoading(true);
    try {
      await install();
    } finally {
      setLoading(false);
    }
  };

  if (!canInstall) return null;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      aria-label={label}
      className={
        className ||
        'w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-primary text-white font-bold text-lg hover:bg-primary/90 transition-colors shadow-lg disabled:opacity-70'
      }
    >
      <Download className="w-6 h-6 flex-shrink-0" aria-hidden />
      <span>{loading ? '...' : label}</span>
    </button>
  );
}
