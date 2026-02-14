'use client';

import React from 'react';

export function Loading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
      <div className="w-16 h-16 border-4 border-primary-light border-t-primary rounded-full animate-spin" />
      {text && (
        <p className="mt-4 text-text-secondary">{text}</p>
      )}
    </div>
  );
}

export function OrganicWaveLoader({ text = 'Analyzing...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px]">
      <div className="relative w-32 h-32">
        <div className="absolute inset-0 border-4 border-accent rounded-full opacity-30" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-accent rounded-full" />
        </div>
      </div>
      <p className="mt-8 text-text-primary font-medium">{text}</p>
      <p className="mt-2 text-text-secondary text-sm">This may take a few seconds</p>
    </div>
  );
}

