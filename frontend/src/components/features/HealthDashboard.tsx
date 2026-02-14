'use client';

import React from 'react';
import { 
  Activity, 
  Pill, 
  TrendingUp, 
  Heart,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useHealth } from '@/contexts/HealthContext';
import { useLanguage } from '@/contexts/LanguageContext';

export function HealthDashboard() {
  const { stats, loading } = useHealth();
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-text-primary dark:text-gray-100">
          {t('healthDashboard') || 'Tableau de Bord Santé'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-5 h-32 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header simple */}
      <div>
        <h2 className="text-xl font-bold text-text-primary dark:text-gray-100">
          {t('healthDashboard') || 'Tableau de Bord Santé'}
        </h2>
      </div>

      {/* Grille de statistiques - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Scans */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 h-full flex flex-col shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 dark:from-blue-500 dark:to-blue-600 flex items-center justify-center mb-4">
            <Activity className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          
          <div className="flex-1">
            <p className="text-3xl font-bold text-text-primary dark:text-gray-100 mb-1">
              {stats.scansThisWeek}
            </p>
            <p className="text-xs text-text-secondary dark:text-gray-400 font-medium">
              {t('scansThisWeek') || 'Scans cette semaine'}
            </p>
          </div>
          
          {stats.scansThisWeek > 0 && (
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400 mt-2">
              <TrendingUp className="w-3 h-3" />
              <span className="text-xs font-semibold">{t('active') || 'Actif'}</span>
            </div>
          )}
        </div>

        {/* Card 2: Médicaments pris */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 h-full flex flex-col shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4">
            <Pill className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          
          <div className="flex-1">
            <p className="text-3xl font-bold text-text-primary dark:text-gray-100 mb-1">
              {stats.medicationsTaken}
            </p>
            <p className="text-xs text-text-secondary dark:text-gray-400 font-medium">
              {t('medicationsTaken') || 'Prises de médicaments'}
            </p>
          </div>
          
          <div className="flex items-center gap-1 text-green-600 dark:text-green-400 mt-2">
            <CheckCircle className="w-3 h-3" />
            <span className="text-xs font-semibold">{t('upToDate') || 'À jour'}</span>
          </div>
        </div>

        {/* Card 3: Observance */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 h-full flex flex-col shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-4">
            <Heart className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          
          <div className="flex-1">
            <p className="text-3xl font-bold text-text-primary dark:text-gray-100 mb-1">
              {stats.adherenceRate}%
            </p>
            <p className="text-xs text-text-secondary dark:text-gray-400 font-medium">
              {t('adherenceRate') || 'Taux d\'observance'}
            </p>
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-green-600 dark:from-green-400 dark:to-green-500 rounded-full"
                style={{ width: `${stats.adherenceRate}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-green-600 dark:text-green-400">{t('excellent') || 'Excellent'}</span>
          </div>
        </div>

        {/* Card 4: Prochain rappel */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 h-full flex flex-col shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500 flex items-center justify-center mb-4">
            <Clock className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          
          <div className="flex-1">
            <p className="text-3xl font-bold text-text-primary dark:text-gray-100 mb-1">
              {stats.nextReminderTime || '--:--'}
            </p>
            <p className="text-xs text-text-secondary dark:text-gray-400 font-medium">
              {t('nextReminder') || 'Prochain rappel'}
            </p>
            {stats.nextReminder && (
              <p className="text-xs text-text-secondary dark:text-gray-400 mt-1">
                {stats.nextReminder}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400 mt-2">
            <AlertCircle className="w-3 h-3" />
            <span className="text-xs font-semibold">
              {stats.pendingReminders} {t('pending') || 'en attente'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
