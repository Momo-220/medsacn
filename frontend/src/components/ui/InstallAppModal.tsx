'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { SettingsModal } from '@/components/ui/SettingsModal';
import { PwaInstallButton } from '@/components/ui/PwaInstallButton';
import { usePwaInstall } from '@/hooks/usePwaInstall';
import { getDeferredPrompt, triggerPwaInstall } from '@/lib/pwa-install';
import { useLanguage } from '@/contexts/LanguageContext';
import type { TranslationKey } from '@/lib/i18n/translations';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const IOS_STEPS = [
  { instruction: 'installIOSStep1', image: '/install-ios/1.jpg' },
  { instruction: 'installIOSStep2', image: '/install-ios/2.jpg' },
  { instruction: 'installIOSStep3', image: '/install-ios/3.jpg' },
  { instruction: 'installIOSStep4', image: '/install-ios/4.jpg' },
  { instruction: 'installIOSStep5', image: '/install-ios/5.jpg' },
];

export function InstallAppModal({ isOpen, onClose }: InstallAppModalProps) {
  const { t } = useLanguage();
  const { canInstall } = usePwaInstall();
  const [installChoice, setInstallChoice] = useState<'choice' | 'android' | 'ios'>('choice');
  const [iosCarouselIndex, setIosCarouselIndex] = useState(0);
  const [iosImageError, setIosImageError] = useState(false);
  const [showImageFullscreen, setShowImageFullscreen] = useState(false);

  const handleClose = () => {
    setInstallChoice('choice');
    setIosCarouselIndex(0);
    setShowImageFullscreen(false);
    onClose();
  };

  const handleOpenIosImage = () => setShowImageFullscreen(true);

  const title = installChoice === 'choice' ? t('installModalTitle') : installChoice === 'android' ? t('installAndroidTitle') : t('installIOSTitle');

  return (
    <SettingsModal isOpen={isOpen} onClose={handleClose} title={title}>
      <div className="space-y-6">
        {installChoice === 'choice' && (
          <div className="space-y-4">
            <p className="text-sm text-text-secondary text-center">{t('installChoosePlatform')}</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setInstallChoice('android')}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-green-500/50 bg-green-500/10 hover:bg-green-500/20 transition-colors"
              >
                <div className="w-16 h-16 rounded-2xl bg-green-500/30 flex items-center justify-center p-2">
                  <img src="/logos/android.svg" alt="Android" className="w-full h-full object-contain" aria-hidden />
                </div>
                <span className="font-bold text-text-primary">{t('installSelectAndroid')}</span>
              </button>
              <button
                onClick={() => setInstallChoice('ios')}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-gray-600/50 bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
              >
                <div className="w-16 h-16 rounded-2xl bg-gray-700 flex items-center justify-center p-2">
                  <img src="/logos/apple.svg" alt="Apple" className="w-full h-full object-contain text-white" aria-hidden />
                </div>
                <span className="font-bold text-text-primary">{t('installSelectiPhone')}</span>
              </button>
            </div>
          </div>
        )}

        {installChoice === 'android' && (
          <div className="space-y-4">
            <button onClick={() => setInstallChoice('choice')} className="flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm">
              <ArrowLeft className="w-4 h-4" />
              {t('back')}
            </button>
            <p className="text-sm text-text-secondary">{t('installAndroidPrereq')}</p>
            {canInstall ? (
              <PwaInstallButton label={t('installButton')} className="w-full flex items-center justify-center gap-2 py-5 px-6 rounded-xl bg-primary text-white font-bold text-lg hover:bg-primary/90 transition-colors shadow-lg" />
            ) : (
              <>
                <button
                  type="button"
                  onClick={async () => {
                    const hadPrompt = !!getDeferredPrompt();
                    await triggerPwaInstall();
                    if (!hadPrompt && typeof window !== 'undefined' && window.alert) {
                      window.alert(`${t('installAndroidStep1')}\n\n${t('installAndroidStep3')}`);
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 py-5 px-6 rounded-xl bg-primary text-white font-bold text-lg hover:bg-primary/90 transition-colors"
                  aria-label={t('installButton')}
                >
                  <Download className="w-6 h-6 flex-shrink-0" aria-hidden />
                  {t('installButton')}
                </button>
                <p className="text-sm text-text-secondary p-4 bg-background-secondary rounded-xl">
                  {t('installAndroidStep1')}<br /><br />
                  {t('installAndroidStep3')}
                </p>
              </>
            )}
          </div>
        )}

        {installChoice === 'ios' && (
          <div className="space-y-4 flex flex-col items-stretch">
            <button onClick={() => setInstallChoice('choice')} className="flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm">
              <ArrowLeft className="w-4 h-4" />
              {t('back')}
            </button>
            <p className="text-sm text-text-secondary">{t('installIOSImportant')}</p>
            <div className="relative max-w-xs sm:max-w-sm w-full mx-auto">
              <div className="aspect-[9/16] max-h-[320px] rounded-2xl overflow-hidden bg-background-secondary relative">
                <button type="button" onClick={handleOpenIosImage} className="w-full h-full cursor-pointer">
                  <img
                    key={iosCarouselIndex}
                    src={IOS_STEPS[iosCarouselIndex].image}
                    alt={`Étape ${iosCarouselIndex + 1}`}
                    className="w-full h-full object-cover object-top"
                    onLoad={() => setIosImageError(false)}
                    onError={() => setIosImageError(true)}
                  />
                </button>
                {iosImageError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-background-secondary">
                    <span className="text-4xl font-bold text-primary/50 mb-2">{iosCarouselIndex + 1}/5</span>
                    <p className="text-sm text-text-secondary text-center"><strong>{t(IOS_STEPS[iosCarouselIndex].instruction as TranslationKey)}</strong></p>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between mt-3">
                <button
                  onClick={() => { setIosCarouselIndex((i) => Math.max(0, i - 1)); setIosImageError(false); }}
                  disabled={iosCarouselIndex === 0}
                  className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center disabled:opacity-30"
                >
                  <ChevronLeft className="w-5 h-5 text-primary" />
                </button>
                <span className="text-sm font-semibold text-text-secondary">{iosCarouselIndex + 1} / {IOS_STEPS.length}</span>
                <button
                  onClick={() => { setIosCarouselIndex((i) => Math.min(IOS_STEPS.length - 1, i + 1)); setIosImageError(false); }}
                  disabled={iosCarouselIndex === IOS_STEPS.length - 1}
                  className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center disabled:opacity-30"
                >
                  <ChevronRight className="w-5 h-5 text-primary" />
                </button>
              </div>
              <p className="mt-3 text-sm font-medium text-text-primary text-center p-3 bg-primary/5 rounded-xl">
                <strong>{t(IOS_STEPS[iosCarouselIndex].instruction as TranslationKey)}</strong>
              </p>
            </div>

            {/* Lightbox image dans l'app (pas nouvelle page) */}
            {showImageFullscreen && (
              <div
                className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4"
                onClick={() => setShowImageFullscreen(false)}
              >
                <button
                  type="button"
                  onClick={() => setShowImageFullscreen(false)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white"
                  aria-label="Fermer"
                >
                  ×
                </button>
                <img
                  src={IOS_STEPS[iosCarouselIndex].image}
                  alt={`Étape ${iosCarouselIndex + 1}`}
                  className="max-h-[90vh] max-w-full object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </SettingsModal>
  );
}
