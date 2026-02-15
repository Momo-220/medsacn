'use client';

import React, { useState, useEffect } from 'react';
import { 
  Pill, 
  Search,
  Filter,
  Calendar,
  Clock,
  Tag,
  ChevronRight,
  Package,
  AlertCircle,
  ArrowLeft,
  Bell,
  X
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { useHealth } from '@/contexts/HealthContext';
import { getImageUrl } from '@/lib/imageUrl';
import { TrialUpgradePrompt } from '@/components/ui/TrialUpgradePrompt';
import { translateCategory } from '@/lib/i18n/utils';
import { getPharmacyCache, setPharmacyCache, isOnline } from '@/lib/pharmacyCache';
import { ScanResult } from '@/types';
import { ScanResultScreen } from './ScanResultScreen';
import type { Language } from '@/lib/i18n/translations';

interface Medication {
  id: string;
  scan_id: string;
  name: string;
  dosage: string;
  form: string;
  category: string;
  scannedAt: string;
  expiryDate?: string;
  quantity?: number;
  image?: string;
  // Données complètes pour la vue détail
  fullData?: any;
}

export function PharmacyScreen() {
  const { t, language } = useLanguage();
  const { user, getIdToken, signOut } = useAuth();
  const { refreshStats } = useHealth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedication, setSelectedMedication] = useState<ScanResult | null>(null);

  // Charger les médicaments depuis l'API ou le cache (mode hors ligne)
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const mapScansToMeds = (scans: any[]): Medication[] =>
    scans.map((scan: any) => ({
      id: scan.id,
      scan_id: scan.scan_id || scan.id,
      name: scan.medication_name || 'Médicament',
      dosage: scan.dosage || '',
      form: scan.form || '',
      category: scan.category || 'autre',
      scannedAt: new Date(scan.scanned_at || Date.now()).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US'),
      image: scan.image_url,
      fullData: scan,
    }));

  useEffect(() => {
    const loadMedications = async () => {
      if (!user) return;
      if (user.isAnonymous) {
        setMedications([]);
        setLoading(false);
        return;
      }

      const cached = getPharmacyCache(user.uid);

      if (!isOnline()) {
        if (cached?.scans?.length) {
          setMedications(mapScansToMeds(cached.scans));
          setIsOffline(true);
        } else {
          setMedications([]);
          setIsOffline(true);
        }
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setIsOffline(false);
        const { apiClient } = await import('@/lib/api/client');

        const token = await getIdToken();
        if (token) apiClient.setAuthToken(token);

        const history = await apiClient.getHistory(100, 1);
        const meds = mapScansToMeds(history.scans);
        setMedications(meds);
        setPharmacyCache(user.uid, history.scans);

        await refreshStats();
      } catch (error) {
        console.error('Erreur lors du chargement des médicaments:', error);
        if (cached?.scans?.length) {
          setMedications(mapScansToMeds(cached.scans));
          setIsOffline(true);
        } else {
          setMedications([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadMedications();
  }, [user, language, getIdToken, refreshStats]);

  // Ouvrir les détails d'un médicament
  const openMedicationDetails = (med: Medication) => {
    // Convertir les données en format ScanResult
    const scanResult: ScanResult = {
      scan_id: med.scan_id || med.id,
      medication_name: med.name,
      generic_name: med.fullData?.generic_name,
      dosage: med.dosage,
      form: med.form,
      manufacturer: med.fullData?.manufacturer,
      category: med.category,
      packaging_language: med.fullData?.packaging_language || 'fr',
      image_url: med.image,
      confidence: med.fullData?.confidence || 'medium',
      disclaimer: med.fullData?.disclaimer || '⚕️ Ceci est uniquement à titre informatif.',
      analyzed_at: med.fullData?.scanned_at || new Date().toISOString(),
      // Champs de la notice
      active_ingredient: med.fullData?.analysis_data?.active_ingredient,
      excipients: med.fullData?.analysis_data?.excipients,
      indications: med.fullData?.analysis_data?.indications,
      posology: med.fullData?.analysis_data?.posology || med.fullData?.analysis_data?.usage_instructions,
      contraindications: med.fullData?.contraindications || med.fullData?.analysis_data?.contraindications,
      precautions: med.fullData?.analysis_data?.precautions,
      side_effects: med.fullData?.side_effects || med.fullData?.analysis_data?.side_effects,
      interactions: med.fullData?.interactions || med.fullData?.analysis_data?.interactions,
      overdose: med.fullData?.analysis_data?.overdose,
      storage: med.fullData?.analysis_data?.storage,
      warnings: med.fullData?.warnings,
    };
    setSelectedMedication(scanResult);
  };

  // Si un médicament est sélectionné, afficher ses détails
  if (selectedMedication) {
    return (
      <div className="relative">
        <button
          onClick={() => setSelectedMedication(null)}
          className="fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-text-primary dark:text-gray-100" />
        </button>
        <ScanResultScreen result={selectedMedication} />
      </div>
    );
  }

  const filteredMedications = medications.filter(med => {
    return med.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-background dark:bg-gray-900 pb-[calc(8rem+env(safe-area-inset-bottom))] pt-[env(safe-area-inset-top)] transition-colors">
      {/* Header - Responsive */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-8 pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary dark:text-gray-100 mb-2">
          {t('myPharmacy')}
        </h1>
        <p className="text-text-secondary dark:text-gray-400 text-sm">
          {loading ? t('loading') || 'Chargement...' : `${medications.length} ${t('medicationsScanned')}`}
        </p>
        {isOffline && (
          <div className="mt-3 px-3 py-2 rounded-xl bg-amber-500/15 dark:bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs">
            <span className="font-semibold">{t('offlineMode')}</span>
            <span className="ml-1">{t('offlinePharmacyHint')}</span>
          </div>
        )}
      </div>

      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-4">
        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary dark:text-gray-400" />
          <input
            type="text"
            placeholder={t('searchMedications')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 rounded-xl border border-background-secondary dark:border-gray-700 focus:outline-none focus:border-primary dark:focus:border-blue-400 text-sm text-text-primary dark:text-gray-100 placeholder:text-text-secondary dark:placeholder:text-gray-400 transition-colors"
          />
        </div>


        {/* Statistiques rapides - Responsive */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="card dark:bg-gray-800 dark:border-gray-700 p-4 text-center transition-colors">
            <Package className="w-6 h-6 text-primary dark:text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-text-primary dark:text-gray-100 mb-1">
              {medications.length}
            </p>
            <p className="text-xs text-text-secondary dark:text-gray-400">{t('total')}</p>
          </div>
          <div className="card dark:bg-gray-800 dark:border-gray-700 p-4 text-center transition-colors">
            <AlertCircle className="w-6 h-6 text-orange-500 dark:text-orange-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-text-primary dark:text-gray-100 mb-1">
              {medications.filter(m => m.expiryDate).length}
            </p>
            <p className="text-xs text-text-secondary dark:text-gray-400">{t('toRenew')}</p>
          </div>
          <div className="card dark:bg-gray-800 dark:border-gray-700 p-4 text-center transition-colors">
            <Calendar className="w-6 h-6 text-green-500 dark:text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-text-primary dark:text-gray-100 mb-1">
              {medications.filter(m => {
                const d = new Date(m.scannedAt);
                const now = new Date();
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
              }).length}
            </p>
            <p className="text-xs text-text-secondary dark:text-gray-400">{t('thisMonth')}</p>
          </div>
        </div>

        {/* Liste des médicaments */}
        <div className="space-y-3">
          {loading ? (
            <div className="card p-8 text-center text-text-secondary dark:text-gray-400">
              {t('loading') || 'Chargement...'}
            </div>
          ) : user?.isAnonymous ? (
            <TrialUpgradePrompt
              variant="full"
              onSignUp={() => signOut()}
            />
          ) : filteredMedications.length > 0 ? (
            filteredMedications.map((med) => (
              <div 
                key={med.id} 
                className="card dark:bg-gray-800 dark:border-gray-700 p-4 transition-colors cursor-pointer hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]"
                onClick={() => openMedicationDetails(med)}
              >
                <div className="flex items-start gap-4">
                  {/* Image du médicament ou icône par défaut */}
                  <div className="w-14 h-14 rounded-xl bg-primary/10 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {getImageUrl(med.image) ? (
                      <img
                        src={getImageUrl(med.image)!}
                        alt={med.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback sur l'icône si l'image ne charge pas
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <Pill className={`w-6 h-6 text-primary dark:text-blue-400 ${getImageUrl(med.image) ? 'hidden' : ''}`} />
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-text-primary dark:text-gray-100 mb-1">
                          {med.name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-text-secondary dark:text-gray-400">
                          <span>{med.dosage}</span>
                          <span>•</span>
                          <span>{med.form}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-text-secondary dark:text-gray-400 flex-shrink-0" />
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-2 py-1 bg-primary/10 dark:bg-blue-900/30 text-primary dark:text-blue-400 text-xs font-semibold rounded-full">
                        {translateCategory(med.category, language)}
                      </span>
                      {med.quantity && (
                        <span className="px-2 py-1 bg-background-secondary dark:bg-gray-700 text-text-secondary dark:text-gray-300 text-xs font-semibold rounded-full">
                          {med.quantity} {t('units')}
                        </span>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs text-text-secondary dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{med.scannedAt}</span>
                      </div>
                      {med.expiryDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{t('expiryDate')}: {med.expiryDate}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="card dark:bg-gray-800 dark:border-gray-700 p-8 text-center transition-colors">
              <Package className="w-12 h-12 text-text-secondary dark:text-gray-500 mx-auto mb-3 opacity-50" />
              <p className="text-text-secondary dark:text-gray-400">
                {t('noMedicationFound')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
