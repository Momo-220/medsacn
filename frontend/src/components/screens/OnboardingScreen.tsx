'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ChevronRight, ArrowRight, Scan, MessageCircle, Bell, BookOpen, ShieldCheck } from 'lucide-react';

interface OnboardingScreenProps {
  onComplete: () => void;
}

/** Parse "|mot impact|" syntax: returns JSX with impactful words in font-poppins + primary color */
function RichTitle({ raw }: { raw: string }) {
  const parts = raw.split('|');
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="font-poppins text-primary dark:text-blue-400">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

const SLIDE_ICONS = [
  <Scan key="scan" className="w-16 h-16 text-primary" strokeWidth={1.5} />,
  <MessageCircle key="chat" className="w-16 h-16 text-primary" strokeWidth={1.5} />,
  <Bell key="bell" className="w-16 h-16 text-primary" strokeWidth={1.5} />,
  <BookOpen key="book" className="w-16 h-16 text-primary" strokeWidth={1.5} />,
  <ShieldCheck key="shield" className="w-16 h-16 text-primary" strokeWidth={1.5} />,
];

const SLIDE_COLORS = [
  'from-blue-500/20 to-cyan-500/20',
  'from-violet-500/20 to-fuchsia-500/20',
  'from-orange-500/20 to-amber-500/20',
  'from-emerald-500/20 to-teal-500/20',
  'from-rose-500/20 to-pink-500/20',
];

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const { t } = useLanguage();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  const slides = [
    { title: t('onboardingTitle1'), desc: t('onboardingDesc1'), icon: SLIDE_ICONS[0], bg: SLIDE_COLORS[0] },
    { title: t('onboardingTitle2'), desc: t('onboardingDesc2'), icon: SLIDE_ICONS[1], bg: SLIDE_COLORS[1] },
    { title: t('onboardingTitle3'), desc: t('onboardingDesc3'), icon: SLIDE_ICONS[2], bg: SLIDE_COLORS[2] },
    { title: t('onboardingTitle4'), desc: t('onboardingDesc4'), icon: SLIDE_ICONS[3], bg: SLIDE_COLORS[3] },
    { title: t('onboardingTitle5'), desc: t('onboardingDesc5'), icon: SLIDE_ICONS[4], bg: SLIDE_COLORS[4] },
  ];

  const isLast = current === slides.length - 1;

  const goNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setDirection('right');
      setCurrent((prev) => prev + 1);
    }
  };

  const goSkip = () => onComplete();

  const slide = slides[current];

  return (
    <div className="min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-background dark:bg-gray-900 flex flex-col relative transition-colors">
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${slide.bg} transition-all duration-500 pointer-events-none`} />

      {/* Skip button */}
      {!isLast && (
        <div className="absolute top-12 right-6 z-20">
          <button
            onClick={goSkip}
            className="text-sm font-medium text-text-secondary dark:text-gray-400 hover:text-text-primary dark:hover:text-gray-200 transition-colors py-2 px-3"
          >
            {t('onboardingSkip')}
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pt-20 pb-8 relative z-10">
        {/* Icon / Illustration area */}
        <div className="mb-10 relative" key={current}>
          {/* Glow circle */}
          <div className={`absolute inset-0 -m-8 rounded-full bg-gradient-to-br ${slide.bg} blur-2xl opacity-60`} />
          <div className="relative w-40 h-40 flex items-center justify-center">
            <div className="w-32 h-32 rounded-3xl bg-white/80 dark:bg-gray-800/80 flex items-center justify-center shadow-lg animate-fade-in">
              {slide.icon}
            </div>
          </div>
        </div>

        {/* Title - double typographie */}
        <h2 className="text-[28px] leading-tight font-bold text-center text-text-primary dark:text-gray-100 mb-4 max-w-xs animate-fade-in">
          <RichTitle raw={slide.title} />
        </h2>

        {/* Description */}
        <p className="text-base text-center text-text-secondary dark:text-gray-400 max-w-xs leading-relaxed animate-fade-in">
          {slide.desc}
        </p>
      </div>

      {/* Bottom section */}
      <div className="relative z-10 px-8 pb-12">
        {/* Dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-8 h-2.5 bg-primary dark:bg-blue-400'
                  : 'w-2.5 h-2.5 bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={goNext}
          className="w-full py-4 bg-gradient-to-r from-primary to-primary/80 text-white rounded-2xl font-semibold text-base flex items-center justify-center gap-2 hover:opacity-95 hover:shadow-button transition-all duration-200 active:scale-[0.98]"
        >
          {isLast ? t('onboardingGetStarted') : t('onboardingNext')}
          {isLast ? <ArrowRight className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
