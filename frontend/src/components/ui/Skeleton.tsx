'use client';

import React from 'react';

/** Global flag: when true, API errors (timeout/network) do not show toast - backend wake skeleton is shown instead */
export function setBackendWaking(value: boolean) {
  if (typeof window !== 'undefined') {
    (window as any).__MEDISCAN_BACKEND_WAKING__ = value;
  }
}

export function isBackendWaking(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window as any).__MEDISCAN_BACKEND_WAKING__;
}

export interface SkeletonProps {
  className?: string;
  /** Override width (e.g. 'w-12', 'w-full') */
  width?: string;
  /** Override height (e.g. 'h-4', 'h-32') */
  height?: string;
  /** Border radius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full' */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const roundedClasses = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
};

/**
 * Base Skeleton with horizontal shimmer. No external libs, Tailwind + keyframes.
 * Use width/height/rounded to match real content and avoid layout shift.
 */
export function Skeleton({
  className = '',
  width,
  height = 'h-4',
  rounded = 'md',
}: SkeletonProps) {
  return (
    <div
      className={`
        overflow-hidden bg-gray-200 dark:bg-gray-700
        ${roundedClasses[rounded]}
        ${height}
        ${width ?? ''}
        ${className}
      `}
      role="presentation"
      aria-hidden
    >
      <span
        className="block h-full w-full animate-shimmer-bg bg-[length:200%_100%]"
        style={{
          backgroundImage:
            'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%)',
        }}
      />
    </div>
  );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div
      className={`card dark:bg-gray-800 dark:border-gray-700 overflow-hidden ${className}`}
      role="presentation"
    >
      <div className="p-5 space-y-4">
        <Skeleton height="h-10" width="w-2/3" rounded="lg" />
        <Skeleton height="h-4" width="w-full" rounded="md" />
        <Skeleton height="h-4" width="w-5/6" rounded="md" />
        <div className="flex gap-2 pt-2">
          <Skeleton height="h-8" width="w-20" rounded="lg" />
          <Skeleton height="h-8" width="w-24" rounded="lg" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonList({ rows = 4, className = '' }: { rows?: number; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`} role="presentation">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <Skeleton width="w-12" height="h-12" rounded="xl" />
          <div className="flex-1 space-y-2 min-w-0">
            <Skeleton height="h-4" width="w-3/4" rounded="md" />
            <Skeleton height="h-3" width="w-1/2" rounded="md" />
            <Skeleton height="h-3" width="w-1/3" rounded="md" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4, className = '' }: { rows?: number; cols?: number; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 ${className}`} role="presentation">
      <div className="grid gap-px bg-gray-200 dark:bg-gray-700" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-3">
            <Skeleton height="h-4" width="w-full" rounded="md" />
          </div>
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid gap-px bg-gray-200 dark:bg-gray-700"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: cols }).map((_, colIndex) => (
            <div key={colIndex} className="bg-white dark:bg-gray-800 p-3">
              <Skeleton height="h-4" width={colIndex === 0 ? 'w-3/4' : 'w-full'} rounded="md" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/** Full page or section placeholder: header + blocks. Replicates typical page structure. */
export function SkeletonPageSection({ className = '' }: { className?: string }) {
  return (
    <div className={`space-y-6 ${className}`} role="presentation">
      <div className="flex items-center justify-between">
        <Skeleton height="h-8" width="w-48" rounded="lg" />
        <Skeleton height="h-9" width="w-24" rounded="lg" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card dark:bg-gray-800 dark:border-gray-700 p-5 h-32 overflow-hidden">
            <Skeleton width="w-12" height="h-12" rounded="xl" className="mb-4" />
            <Skeleton height="h-8" width="w-16" rounded="md" className="mb-2" />
            <Skeleton height="h-4" width="w-full" rounded="md" />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <Skeleton height="h-6" width="w-40" rounded="md" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <Skeleton width="w-12" height="h-12" rounded="xl" />
            <div className="flex-1 space-y-2">
              <Skeleton height="h-4" width="w-2/3" rounded="md" />
              <Skeleton height="h-3" width="w-1/2" rounded="md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
