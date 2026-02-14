'use client';

import React from 'react';
import { X, Gem, AlertCircle, Heart } from 'lucide-react';
import { useCredits } from '@/contexts/CreditsContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface CreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: 'scan' | 'chat';
  cost: number;
}

export function CreditsModal({ isOpen, onClose, action, cost }: CreditsModalProps) {
  const { credits, addCredits } = useCredits();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();

  if (!isOpen) return null;

  const isTrial = user?.isAnonymous;

  const handleAddCredits = async (amount: number) => {
    try {
      // Validation côté client
      if (!amount || amount <= 0) {
        const { showError } = await import('@/components/ui/ErrorToast');
        showError({ message: 'Le montant doit être supérieur à 0', type: 'error', title: 'Montant invalide' });
        return;
      }
      
      await addCredits(amount);
      // Le modal se ferme automatiquement après succès
      onClose();
    } catch (error: any) {
      // L'erreur sera automatiquement affichée via l'intercepteur API
      console.error('Erreur lors de l\'ajout de crédits:', error);
    }
  };

  const actionName = action === 'scan' ? 'scanner un médicament' : 'utiliser le chat IA';
  const actionNameCapitalized = action === 'scan' ? 'Scanner' : 'Chatter';

  if (isTrial) {
    return (
      <div className="fixed inset-0 bg-black/50 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-md w-full shadow-xl border border-gray-200 dark:border-gray-700">
          <div className="flex justify-end mb-2">
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <X className="w-5 h-5 text-text-secondary dark:text-gray-300" />
            </button>
          </div>
          <div className="text-center pt-2">
            <div className="inline-flex w-12 h-12 rounded-full bg-primary/10 dark:bg-blue-900/30 items-center justify-center mb-4">
              <Heart className="w-6 h-6 text-primary dark:text-blue-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-semibold text-text-primary dark:text-gray-100 mb-2">
              {t('upgradeTitle')}
            </h3>
            <p className="text-sm text-text-secondary dark:text-gray-400 leading-relaxed mb-6">
              {t('upgradeMessage')}
            </p>
            <button
              type="button"
              onClick={() => { onClose(); signOut(); }}
              className="w-full py-3 rounded-xl font-semibold bg-primary text-white hover:opacity-95 transition-all"
            >
              {t('upgradeCta')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 text-sm text-text-secondary dark:text-gray-400 hover:underline"
            >
              {t('back')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 dark:bg-black/90 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-md w-full shadow-2xl border-2 border-orange-200 dark:border-orange-800/50 animate-pulse-slow">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 dark:from-yellow-500 dark:to-orange-600 flex items-center justify-center shadow-lg animate-pulse">
              <Gem className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-bold text-text-primary dark:text-gray-100">
              Crédits insuffisants
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <X className="w-5 h-5 text-text-secondary dark:text-gray-300" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/30 dark:to-yellow-900/30 rounded-2xl p-5 border-2 border-orange-300 dark:border-orange-700/50 shadow-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-base font-bold text-text-primary dark:text-gray-100 mb-2">
                  Vous n'avez pas assez de gemmes
                </p>
                <p className="text-sm text-text-secondary dark:text-gray-300 leading-relaxed">
                  Pour {actionName}, il vous faut <span className="font-bold text-lg text-orange-600 dark:text-orange-400">{cost} gemmes</span>.
                  <br />
                  Vous avez actuellement <span className="font-bold text-lg text-primary dark:text-blue-400">{credits} gemmes</span>.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-text-primary dark:text-gray-200">
              Ajouter des gemmes (Mode développement)
            </p>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleAddCredits(10)}
                className="px-4 py-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 dark:from-blue-900/30 dark:to-blue-800/20 border-2 border-primary/30 dark:border-blue-600/40 text-center hover:border-primary dark:hover:border-blue-500 hover:shadow-lg transition-all"
              >
                <div className="text-xl font-bold text-primary dark:text-blue-400">+10</div>
                <div className="text-xs text-text-secondary dark:text-gray-400 mt-1">Gemmes</div>
              </button>
              <button
                onClick={() => handleAddCredits(50)}
                className="px-4 py-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 dark:from-blue-900/30 dark:to-blue-800/20 border-2 border-primary/30 dark:border-blue-600/40 text-center hover:border-primary dark:hover:border-blue-500 hover:shadow-lg transition-all"
              >
                <div className="text-xl font-bold text-primary dark:text-blue-400">+50</div>
                <div className="text-xs text-text-secondary dark:text-gray-400 mt-1">Gemmes</div>
              </button>
              <button
                onClick={() => handleAddCredits(100)}
                className="px-4 py-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 dark:from-blue-900/30 dark:to-blue-800/20 border-2 border-primary/30 dark:border-blue-600/40 text-center hover:border-primary dark:hover:border-blue-500 hover:shadow-lg transition-all"
              >
                <div className="text-xl font-bold text-primary dark:text-blue-400">+100</div>
                <div className="text-xs text-text-secondary dark:text-gray-400 mt-1">Gemmes</div>
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-text-secondary dark:text-gray-300 font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
