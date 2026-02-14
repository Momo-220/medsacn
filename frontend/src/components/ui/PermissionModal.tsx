'use client';

import React, { useState } from 'react';
import { X, Camera, Bell, AlertTriangle, CheckCircle, Settings } from 'lucide-react';
import { PermissionsService, PermissionType } from '@/lib/permissions';
import { useLanguage } from '@/contexts/LanguageContext';

interface PermissionModalProps {
  type: PermissionType;
  isOpen: boolean;
  onClose: () => void;
  onPermissionGranted: () => void;
}

export function PermissionModal({ type, isOpen, onClose, onPermissionGranted }: PermissionModalProps) {
  const { t, language } = useLanguage();
  const [status, setStatus] = useState<'asking' | 'requesting' | 'granted' | 'denied'>('asking');
  const [showInstructions, setShowInstructions] = useState(false);

  if (!isOpen) return null;

  const config = {
    camera: {
      icon: Camera,
      title: language === 'fr' ? 'Accès à la caméra' : 'Camera Access',
      description: language === 'fr' 
        ? 'Pour scanner vos médicaments, MedScan a besoin d\'accéder à votre caméra.'
        : 'To scan your medications, MedScan needs access to your camera.',
      benefits: language === 'fr' 
        ? ['Scanner les médicaments en temps réel', 'Identifier rapidement les boîtes', 'Fonctionnement hors-ligne']
        : ['Scan medications in real-time', 'Quickly identify boxes', 'Works offline'],
    },
    notifications: {
      icon: Bell,
      title: language === 'fr' ? 'Notifications' : 'Notifications',
      description: language === 'fr'
        ? 'Activez les notifications pour recevoir vos rappels de médicaments.'
        : 'Enable notifications to receive your medication reminders.',
      benefits: language === 'fr'
        ? ['Rappels de prise de médicaments', 'Ne jamais oublier une dose', 'Notifications personnalisables']
        : ['Medication reminders', 'Never miss a dose', 'Customizable notifications'],
    },
  };

  const current = config[type];
  const Icon = current.icon;

  const handleRequestPermission = async () => {
    setStatus('requesting');
    
    const granted = await PermissionsService.requestPermission(type);
    
    if (granted) {
      setStatus('granted');
      setTimeout(() => {
        onPermissionGranted();
        onClose();
      }, 1500);
    } else {
      setStatus('denied');
      setShowInstructions(true);
    }
  };

  const handleRetry = () => {
    setStatus('asking');
    setShowInstructions(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-primary to-blue-600 p-6 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
            status === 'granted' 
              ? 'bg-green-500' 
              : status === 'denied' 
              ? 'bg-red-500' 
              : 'bg-white/20'
          }`}>
            {status === 'granted' ? (
              <CheckCircle className="w-10 h-10 text-white" />
            ) : status === 'denied' ? (
              <AlertTriangle className="w-10 h-10 text-white" />
            ) : (
              <Icon className="w-10 h-10 text-white" />
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">
            {status === 'granted' 
              ? (language === 'fr' ? 'Permission accordée !' : 'Permission granted!')
              : status === 'denied'
              ? (language === 'fr' ? 'Permission refusée' : 'Permission denied')
              : current.title}
          </h2>
          
          {status === 'asking' && (
            <p className="text-white/80 text-sm">
              {current.description}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {status === 'asking' && (
            <>
              <div className="space-y-3 mb-6">
                {current.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleRequestPermission}
                className="w-full py-4 bg-gradient-to-r from-primary to-blue-600 text-white font-bold rounded-2xl hover:shadow-lg transition-all"
              >
                {language === 'fr' ? 'Autoriser l\'accès' : 'Allow Access'}
              </button>
              
              <button
                onClick={onClose}
                className="w-full mt-3 py-3 text-gray-500 dark:text-gray-400 font-medium hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                {language === 'fr' ? 'Plus tard' : 'Later'}
              </button>
            </>
          )}

          {status === 'requesting' && (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300">
                {language === 'fr' ? 'Demande en cours...' : 'Requesting...'}
              </p>
            </div>
          )}

          {status === 'granted' && (
            <div className="text-center py-4">
              <p className="text-green-600 dark:text-green-400 font-medium">
                {language === 'fr' 
                  ? 'Vous pouvez maintenant utiliser cette fonctionnalité !'
                  : 'You can now use this feature!'}
              </p>
            </div>
          )}

          {status === 'denied' && (
            <div className="space-y-4">
              {showInstructions && (
                <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Settings className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                        {language === 'fr' ? 'Comment activer manuellement :' : 'How to enable manually:'}
                      </p>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        {PermissionsService.getSettingsInstructions(type)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleRetry}
                className="w-full py-4 bg-gradient-to-r from-primary to-blue-600 text-white font-bold rounded-2xl hover:shadow-lg transition-all"
              >
                {language === 'fr' ? 'Réessayer' : 'Try Again'}
              </button>
              
              <button
                onClick={onClose}
                className="w-full py-3 text-gray-500 dark:text-gray-400 font-medium hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                {language === 'fr' ? 'Fermer' : 'Close'}
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
