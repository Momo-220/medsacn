'use client';

import React, { useState, useEffect } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ScanningScreenProps {
  previewUrl: string | null;
}

export function ScanningScreen({ previewUrl }: ScanningScreenProps) {
  const { t } = useLanguage();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  useEffect(() => {
    const steps = [
      { progress: 10, text: t('uploadingImage') },
      { progress: 25, text: t('analyzingImage') },
      { progress: 45, text: t('detectingText') },
      { progress: 60, text: t('identifyingMedication') },
      { progress: 75, text: t('extractingInfo') },
      { progress: 85, text: t('aiProcessing') },
      { progress: 95, text: t('finalizing') },
    ];

    let currentStepIndex = 0;
    let currentProgress = 0;
    
    const interval = setInterval(() => {
      if (currentStepIndex < steps.length) {
        const step = steps[currentStepIndex];
        currentProgress = step.progress;
        setProgress(step.progress);
        setCurrentStep(step.text);
        currentStepIndex++;
      } else {
        if (currentProgress < 99) {
          currentProgress = Math.min(currentProgress + 1, 99);
          setProgress(currentProgress);
        }
      }
    }, 800);

    return () => clearInterval(interval);
  }, [t]);

  return (
    <div className="fixed inset-0 bg-background dark:bg-gray-900 z-50 flex flex-col items-center justify-center px-6 transition-colors">
      <div className="w-full max-w-md">
        {/* Image Preview with Modern Frame */}
        <div className="relative mb-8">
          {previewUrl && (
            <div className="relative">
              {/* Outer Glow Effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent blur-xl dark:from-blue-500/20 dark:via-blue-400/10 -z-10"></div>
              
              {/* Main Frame with Glassmorphism */}
              <div className="relative rounded-3xl overflow-hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-6 shadow-2xl border border-white/50 dark:border-gray-700/50 transition-all duration-500">
                {/* Animated Border Gradient */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary via-blue-400 to-primary opacity-0 dark:from-blue-500 dark:via-blue-400 dark:to-blue-500 animate-pulse-gradient -z-10" style={{
                  backgroundSize: '200% 200%',
                  animation: 'gradient-shift 3s ease infinite'
                }}></div>
                
                {/* Image Container */}
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 p-4">
                  <img
                    src={previewUrl}
                    alt={t('scanning')}
                    className="w-full h-64 object-contain rounded-xl relative z-0"
                  />
                  
                  {/* Corner Frame Markers - Enhanced Design */}
                  <div className="absolute top-2 left-2 w-8 h-8 border-t-[3px] border-l-[3px] border-primary dark:border-blue-400 rounded-tl-xl z-20 shadow-lg"></div>
                  <div className="absolute top-2 right-2 w-8 h-8 border-t-[3px] border-r-[3px] border-primary dark:border-blue-400 rounded-tr-xl z-20 shadow-lg"></div>
                  <div className="absolute bottom-2 left-2 w-8 h-8 border-b-[3px] border-l-[3px] border-primary dark:border-blue-400 rounded-bl-xl z-20 shadow-lg"></div>
                  <div className="absolute bottom-2 right-2 w-8 h-8 border-b-[3px] border-r-[3px] border-primary dark:border-blue-400 rounded-br-xl z-20 shadow-lg"></div>
                  
                  {/* Scanning Line Animation */}
                  <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none z-10">
                    <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-primary/60 to-transparent animate-scan-line dark:via-blue-400/60" style={{
                      animation: 'scan-line 2s linear infinite'
                    }}></div>
                  </div>
                  
                  {/* Lottie Animation Overlay - Subtle */}
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl opacity-30 pointer-events-none">
                    <div className="w-full h-full">
                      <DotLottieReact
                        src="https://lottie.host/5d4d048b-9b68-48a3-a8b9-0b5994a3cb82/eM8TKAb7Pr.lottie"
                        loop
                        autoplay
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full space-y-3">
          {/* Progress Text */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-text-primary dark:text-gray-100">
              {currentStep || t('analyzing')}
            </p>
            <p className="text-sm font-bold text-primary dark:text-blue-400">
              {progress}%
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-background-secondary dark:bg-gray-700 rounded-full h-3 overflow-hidden transition-colors">
            <div 
              className="h-full bg-gradient-to-r from-primary to-[#3B7FD4] dark:from-blue-500 dark:to-blue-600 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
