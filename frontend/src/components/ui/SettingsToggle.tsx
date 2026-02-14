'use client';

import React from 'react';

interface SettingsToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  label: string;
  description?: string;
}

export function SettingsToggle({ enabled, onToggle, label, description }: SettingsToggleProps) {
  return (
    <div className="flex items-center justify-between p-3 hover:bg-background-secondary rounded-lg transition-colors">
      <div className="flex-1">
        <p className="text-sm font-semibold text-text-primary">{label}</p>
        {description && (
          <p className="text-xs text-text-secondary mt-0.5">{description}</p>
        )}
      </div>
      <button
        onClick={() => onToggle(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-primary' : 'bg-gray-300'
        }`}
        role="switch"
        aria-checked={enabled}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
