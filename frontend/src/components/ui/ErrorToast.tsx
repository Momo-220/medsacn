'use client';

import React, { useEffect, useState } from 'react';
import { X, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { ErrorInfo } from '@/lib/errors/errorTranslator';
import { useLanguage } from '@/contexts/LanguageContext';
import type { TranslationKey } from '@/lib/i18n/translations';

interface ErrorToastProps {
  error: ErrorInfo;
  onClose: () => void;
  duration?: number;
}

export function ErrorToast({ error, onClose, duration = 5000 }: ErrorToastProps) {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  const title = error.titleKey ? t(error.titleKey as TranslationKey) : error.title;
  const message = error.messageKey ? t(error.messageKey as TranslationKey) : error.message;
  const actionLabel = error.actionKey ? t(error.actionKey as TranslationKey) : error.action;

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);

    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getIcon = () => {
    switch (error.type) {
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />;
      case 'info':
        return <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />;
      default:
        return <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />;
    }
  };

  const getBgColor = () => {
    switch (error.type) {
      case 'error':
        return 'bg-white dark:bg-gray-800 border-red-300 dark:border-red-700 shadow-red-500/20';
      case 'warning':
        return 'bg-white dark:bg-gray-800 border-yellow-300 dark:border-yellow-700 shadow-yellow-500/20';
      case 'info':
        return 'bg-white dark:bg-gray-800 border-blue-300 dark:border-blue-700 shadow-blue-500/20';
      default:
        return 'bg-white dark:bg-gray-800 border-red-300 dark:border-red-700 shadow-red-500/20';
    }
  };

  return (
    <div
      className={`
        fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] max-w-lg w-[90%] sm:w-full
        ${getBgColor()}
        border-2 rounded-2xl shadow-2xl p-6
        backdrop-blur-md
        transition-all duration-300 ease-in-out
        ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
      `}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
            {getIcon()}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {title}
            </h4>
          )}
          <p className="text-base text-gray-700 dark:text-gray-200 leading-relaxed font-medium">
            {message}
          </p>
          {actionLabel && (
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              {actionLabel}
            </button>
          )}
        </div>

        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="flex-shrink-0 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>
    </div>
  );
}

interface ErrorToastContainerProps {
  children: React.ReactNode;
}

interface ToastItem {
  id: string;
  error: ErrorInfo;
}

export function ErrorToastContainer({ children }: ErrorToastContainerProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const showError = (event: CustomEvent<ErrorInfo>) => {
      const error = event.detail;
      const id = `toast-${Date.now()}-${Math.random()}`;
      
      setToasts((prev) => [...prev, { id, error }]);
    };

    window.addEventListener('showError' as any, showError as EventListener);
    
    return () => {
      window.removeEventListener('showError' as any, showError as EventListener);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <>
      {children}
      <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center p-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto"
          >
            <ErrorToast
              error={toast.error}
              onClose={() => removeToast(toast.id)}
              duration={toast.error.type === 'error' ? 8000 : 6000}
            />
          </div>
        ))}
      </div>
    </>
  );
}

export function showError(error: any) {
  if (typeof window === 'undefined') return;
  
  import('@/lib/errors/errorTranslator').then(({ errorTranslator }) => {
    const errorInfo = errorTranslator.translate(error);
    const event = new CustomEvent('showError', { detail: errorInfo });
    window.dispatchEvent(event);
  }).catch((e) => {
    console.error('Erreur lors du chargement du traducteur d\'erreurs:', e);
  });
}
