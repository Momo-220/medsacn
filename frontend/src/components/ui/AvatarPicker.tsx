'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AVATAR_PATHS, getAvatarFullUrl } from '@/lib/avatars';

interface AvatarPickerProps {
  currentPhotoURL: string | null;
  onSelect: (photoURL: string) => void;
  onClose?: () => void;
  showCloseButton?: boolean;
}

function getPathFromPhotoURL(photoURL: string | null): string | null {
  if (!photoURL) return null;
  const match = AVATAR_PATHS.find((p) => photoURL === getAvatarFullUrl(p) || photoURL.endsWith(p));
  return match ?? null;
}

export function AvatarPicker({ currentPhotoURL, onSelect, onClose, showCloseButton }: AvatarPickerProps) {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<string | null>(() => getPathFromPhotoURL(currentPhotoURL));

  const handleConfirm = () => {
    if (selected) {
      const fullUrl = selected.startsWith('http') ? selected : getAvatarFullUrl(selected);
      onSelect(fullUrl);
    }
    onClose?.();
  };

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-text-primary dark:text-gray-100 mb-4 text-center">
        {t('chooseAvatar')}
      </h3>
      <div className="grid grid-cols-4 gap-3 mb-6">
        {AVATAR_PATHS.map((path) => {
          const fullUrl = getAvatarFullUrl(path);
          const isSelected = selected === path || selected === fullUrl;
          return (
            <button
              key={path}
              type="button"
              onClick={() => setSelected(path)}
              className={`relative w-full aspect-square rounded-2xl overflow-hidden border-2 transition-all bg-gray-100 dark:bg-gray-700 flex items-center justify-center ${
                isSelected
                  ? 'border-primary ring-2 ring-primary/30'
                  : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <img
                src={path}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </button>
          );
        })}
      </div>
      <div className="flex gap-3">
        {showCloseButton && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-text-primary dark:text-gray-200 font-semibold"
          >
            {t('back')}
          </button>
        )}
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!selected}
          className="flex-1 py-3 rounded-xl bg-primary text-white font-semibold hover:opacity-95 disabled:opacity-50"
        >
          {t('confirm')}
        </button>
      </div>
    </div>
  );
}
