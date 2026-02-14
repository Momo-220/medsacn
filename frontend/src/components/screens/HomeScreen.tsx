'use client';

import React, { useState, useEffect } from 'react';
import { User, Gem, Pill } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useNavigation } from '@/lib/navigation/NavigationContext';
import { useCredits } from '@/contexts/CreditsContext';
import { CreditsModal } from '@/components/ui/CreditsModal';
import { HealthDashboard } from '@/components/features/HealthDashboard';
import { MedicationReminders } from '@/components/features/MedicationReminders';
import { HealthTipsCard } from '@/components/features/HealthTipsCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { translateCategory, formatSimpleDate } from '@/lib/i18n/utils';
import type { Language } from '@/lib/i18n/translations';

const USER_NAME_STORAGE_KEY = 'mediscan_user_name';

interface ScanItemProps {
  medication: string;
  type: string;
  time: string;
  timeDetail: string;
  image?: string | null;
}

function ScanItem({ medication, type, time, timeDetail, image }: ScanItemProps) {
  const { language } = useLanguage();
  const translatedType = translateCategory(type, language);
  
  return (
    <div className="card dark:bg-gray-800 dark:border-gray-700 p-4 flex items-center gap-4 hover:shadow-lg transition-shadow">
      <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={medication}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <Pill className={`w-5 h-5 text-primary dark:text-blue-400 ${image ? 'hidden' : ''}`} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-text-primary dark:text-gray-100 mb-1 truncate">
          {medication}
        </h3>
        <p className="text-sm text-text-secondary dark:text-gray-400 mb-1">
          {translatedType}
        </p>
        <div className="flex items-center gap-2 text-xs text-text-muted dark:text-gray-500">
          <span>{time}</span>
          <span>•</span>
          <span>{timeDetail}</span>
        </div>
      </div>
    </div>
  );
}

export function HomeScreen() {
  const { user } = useAuth();
  const { navigateTo } = useNavigation();
  const { credits, loading } = useCredits();
  const { t, language } = useLanguage();
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [localName, setLocalName] = useState<string | null>(null);

  // Écouter l'événement pour ouvrir le modal
  useEffect(() => {
    const handleOpenModal = () => setShowCreditsModal(true);
    window.addEventListener('openCreditsModal', handleOpenModal);
    return () => window.removeEventListener('openCreditsModal', handleOpenModal);
  }, []);

  // Charger le prénom stocké localement (mode essai)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(USER_NAME_STORAGE_KEY);
    if (stored) {
      setLocalName(stored);
    }
  }, []);

  const displayName = user?.displayName || localName || '';

  // Charger les scans récents depuis l'API
  const [recentScans, setRecentScans] = useState<Array<{
    medication: string;
    type: string;
    date: Date;
    time: string;
    image?: string | null;
  }>>([]);
  const [loadingScans, setLoadingScans] = useState(false);

  const { getIdToken } = useAuth();

  useEffect(() => {
    const loadRecentScans = async () => {
      if (!user) return;
      if (user.isAnonymous) {
        setRecentScans([]);
        setLoadingScans(false);
        return;
      }
      try {
        setLoadingScans(true);
        const { apiClient } = await import('@/lib/api/client');
        
        const token = await getIdToken();
        if (token) {
          apiClient.setAuthToken(token);
        }
        
        const history = await apiClient.getHistory(5, 1);
        const scans = history.scans.map((scan: any) => ({
          medication: scan.medication_name || 'Médicament',
          type: scan.category || 'autre',
          date: new Date(scan.scanned_at || Date.now()),
          time: new Date(scan.scanned_at || Date.now()).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          image: scan.image_url,
        }));
        setRecentScans(scans);
      } catch (error) {
        console.error('Erreur lors du chargement des scans:', error);
        setRecentScans([]);
      } finally {
        setLoadingScans(false);
      }
    };

    loadRecentScans();
  }, [user]);

  return (
    <div className="min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-background dark:bg-gray-900 pb-[calc(8rem+env(safe-area-inset-bottom))] pt-[env(safe-area-inset-top)] relative z-10 transition-colors">
      {/* Header - Responsive : texte | gemmes | avatar avec espacement */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-8 pb-6">
        <div className="flex items-start justify-between gap-3 sm:gap-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary dark:text-gray-100">
              {new Date().getHours() < 12 ? t('goodMorning') : t('goodEvening')}
            </h1>
            <p className="text-lg sm:text-xl font-semibold text-purple-600 dark:text-purple-400 mt-0.5 truncate">
              {displayName}
            </p>
            <p className="text-text-secondary dark:text-gray-300 text-sm mt-1">
              {t('howDoYouFeel')}
            </p>
          </div>
          {/* Badge gemmes - espacement clair avant l'avatar */}
          {!loading && (
            <button
              onClick={() => {
                const event = new CustomEvent('openCreditsModal');
                window.dispatchEvent(event);
              }}
              className="flex-shrink-0 flex items-center gap-1.5 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 px-3 py-2 sm:px-4 sm:py-2 rounded-full border border-yellow-400/30 hover:from-yellow-400/30 hover:to-orange-500/30 transition-colors dark:border-yellow-500/50 dark:from-yellow-500/20 dark:to-orange-600/20"
              title={t('clickToAddCredits')}
            >
              <Gem className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" strokeWidth={2.5} />
              <span className="text-sm font-bold text-yellow-700 dark:text-yellow-300 tabular-nums">{credits}</span>
            </button>
          )}
          {/* Avatar / Profil */}
          <button 
            onClick={() => navigateTo('profile')}
            className="flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-primary/10 dark:bg-gray-800 hover:bg-primary/20 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
          >
            {!user?.isAnonymous && user?.photoURL ? (
              <img
                src={user.photoURL}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-7 h-7 text-text-primary dark:text-gray-100" />
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
        {/* Health Tips */}
        <HealthTipsCard />

        {/* Health Dashboard */}
        <HealthDashboard />

        {/* Medication Reminders */}
        <MedicationReminders />

        {/* Recent Scans Section - En bas */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-text-primary dark:text-gray-100">
              {t('recentScans')}
            </h2>
            <button
              onClick={() => navigateTo('pharmacy')}
              className="text-sm text-primary dark:text-blue-400 font-semibold hover:underline"
            >
              {t('seeAll')}
            </button>
          </div>

          <div className="space-y-3">
            {loadingScans ? (
              <div className="card p-4 text-center text-text-secondary dark:text-gray-400">
                {t('loading') || 'Chargement...'}
              </div>
            ) : recentScans.length > 0 ? (
              recentScans.map((scan, index) => (
                <ScanItem
                  key={index}
                  medication={scan.medication}
                  type={scan.type}
                  time={formatSimpleDate(scan.date, language)}
                  timeDetail={scan.time}
                  image={scan.image}
                />
              ))
            ) : (
              <div className="card p-4 text-center text-text-secondary dark:text-gray-400">
                {t('noRecentScans') || 'Aucun scan récent'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Credits Modal */}
      <CreditsModal
        isOpen={showCreditsModal}
        onClose={() => setShowCreditsModal(false)}
        action="scan"
        cost={5}
      />
    </div>
  );
}
