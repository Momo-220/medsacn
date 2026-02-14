'use client';

import React, { useRef, useEffect, useState } from 'react';
import { ArrowLeft, ThumbsUp, Share2, Settings, ChevronLeft, ChevronRight, Bell, X, Clock, Calendar as CalendarIcon, Repeat } from 'lucide-react';
import { ScanResult, MedicationSuggestion } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { AlertTriangle, Info, Pill, Calendar, Package, FlaskConical, FileText, Shield, Droplet, Thermometer } from 'lucide-react';
import { useNavigation } from '@/lib/navigation/NavigationContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useHealth } from '@/contexts/HealthContext';
import { apiClient } from '@/lib/api/client';
import { translateCategory } from '@/lib/i18n/utils';
import { CustomTimePicker } from '@/components/ui/CustomTimePicker';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import type { Language, TranslationKey } from '@/lib/i18n/translations';

interface ScanResultScreenProps {
  result: ScanResult;
}

export function ScanResultScreen({ result }: ScanResultScreenProps) {
  const { goBack, navigateTo } = useNavigation();
  const { t, language } = useLanguage();
  const { refreshStats } = useHealth();
  const carouselRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const [suggestions, setSuggestions] = useState<MedicationSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  
  // État pour le modal de rappel
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderForm, setReminderForm] = useState({
    medication_name: result.medication_name || '',
    dosage: result.dosage || '',
    time: '08:00',
    frequency: 'daily' as 'daily' | 'twice' | 'three-times' | 'custom',
  });
  const [reminderCreating, setReminderCreating] = useState(false);
  const [reminderSuccess, setReminderSuccess] = useState(false);

  const confidenceColor = {
    high: 'text-green-600 bg-green-50',
    medium: 'text-yellow-600 bg-yellow-50',
    low: 'text-orange-600 bg-orange-50',
  };

  // Fetch suggestions when category and language are available
  useEffect(() => {
    // Vérifier que category et packaging_language sont présents et non vides
    const hasCategory = result.category && result.category.trim() !== '';
    const hasLanguage = result.packaging_language && result.packaging_language.trim() !== '';
    
    if (hasCategory && hasLanguage) {
      console.log('✅ Fetching suggestions with:', {
        category: result.category,
        language: result.packaging_language,
        medication_name: result.medication_name,
        generic_name: result.generic_name,
        indications: result.indications,
        active_ingredient: result.active_ingredient
      });
      
      setLoadingSuggestions(true);
      apiClient.getSuggestions(
        result.category || 'antidouleur', 
        result.packaging_language || 'fr', 
        5,
        result.medication_name,
        result.generic_name,
        result.indications,
        result.active_ingredient
      )
        .then((data) => {
          console.log('✅ Suggestions received:', data);
          const suggestionsList = data.suggestions || [];
          console.log('📊 Suggestions count:', suggestionsList.length);
          setSuggestions(suggestionsList);
          
          if (suggestionsList.length === 0) {
            console.warn('⚠️ No suggestions returned from API');
          }
        })
        .catch((error) => {
          // Ne logger que les vraies erreurs (pas les 200 avec réparation réussie)
          if (error.response?.status && error.response.status >= 400) {
            const errorDetail = error.response?.data?.detail || error.message;
            
            // Si c'est une erreur 429 (quota dépassé), afficher un message spécifique
            if (error.response?.status === 429) {
              console.warn('⚠️ Quota Gemini dépassé - suggestions non disponibles');
            } else if (error.response?.status === 500) {
              // Erreur serveur - logger pour debug mais ne pas spammer
              console.warn('⚠️ Erreur serveur lors de la récupération des suggestions:', errorDetail);
            } else {
              console.error('❌ Failed to fetch suggestions:', error);
              console.error('❌ Error details:', errorDetail);
            }
          } else {
            // Erreur réseau ou autre - logger normalement
            console.error('❌ Failed to fetch suggestions:', error.message);
          }
          
          setSuggestions([]);
        })
        .finally(() => {
          setLoadingSuggestions(false);
        });
    } else {
      console.warn('⚠️ Cannot fetch suggestions - missing data:', {
        category: result.category,
        language: result.packaging_language,
        hasCategory,
        hasLanguage
      });
    }
  }, [result.category, result.packaging_language, result.medication_name, result.generic_name]);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 320; // Width of card + gap
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const scrollSuggestions = (direction: 'left' | 'right') => {
    if (suggestionsRef.current) {
      const scrollAmount = 280; // Width of suggestion card + gap
      suggestionsRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Créer un rappel pour ce médicament
  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    setReminderCreating(true);
    
    try {
      await apiClient.createReminder({
        medication_name: reminderForm.medication_name,
        dosage: reminderForm.dosage,
        time: reminderForm.time,
        frequency: reminderForm.frequency,
      });
      
      // Rafraîchir les stats du dashboard
      await refreshStats();
      
      setReminderSuccess(true);
      setTimeout(() => {
        setShowReminderModal(false);
        setReminderSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Erreur lors de la création du rappel:', error);
      alert(t('reminderCreateError') || 'Erreur lors de la création du rappel');
    } finally {
      setReminderCreating(false);
    }
  };

  // Helper function pour vérifier si une valeur existe et n'est pas vide
  const hasValue = (value: any): boolean => {
    if (!value) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  };

  // Collect all cards data (excluding image - it's always on top)
  const cards = [
    (result.active_ingredient || result.excipients) && { type: 'composition', data: result },
    hasValue(result.indications) && { type: 'indications', data: result.indications },
    hasValue(result.posology || result.usage_instructions) && { type: 'posology', data: result.posology || result.usage_instructions },
    hasValue(result.contraindications) && { type: 'contraindications', data: result.contraindications },
    hasValue(result.precautions) && { type: 'precautions', data: result.precautions },
    hasValue(result.side_effects) && { type: 'side_effects', data: result.side_effects },
    hasValue(result.interactions) && { type: 'interactions', data: result.interactions },
    hasValue(result.overdose) && { type: 'overdose', data: result.overdose },
    hasValue(result.storage) && { type: 'storage', data: result.storage },
    hasValue(result.additional_info) && { type: 'additional_info', data: result.additional_info },
    hasValue(result.warnings) && { type: 'warnings', data: result.warnings },
  ].filter(Boolean) as Array<{ type: string; data: any }>;

  return (
    <div className="min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-background dark:bg-gray-900 pb-[calc(8rem+env(safe-area-inset-bottom))] pt-[env(safe-area-inset-top)]">
      {/* Header - Responsive */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-8 pb-6 flex items-center gap-4">
        <button
          onClick={goBack}
          className="p-2 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-text-primary dark:text-gray-100" />
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary dark:text-gray-100">
          {t('scanResult')}
        </h1>
      </div>

      {/* Content - Responsive */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
        {/* Medication Image - Always on Top */}
        {result.image_url && (
          <div className="card dark:bg-gray-800 p-4">
            <img
              src={result.image_url}
              alt={result.medication_name}
              className="w-full h-64 object-contain rounded-xl"
            />
          </div>
        )}

        {/* Medication Header */}
        <div>
          <div className="flex items-start justify-between mb-2">
            <div>
              <h2 className="text-3xl font-bold text-text-primary dark:text-gray-100 mb-1">
                {result.medication_name}
              </h2>
              {result.generic_name && (
                <p className="text-primary dark:text-blue-400 font-semibold text-base mt-1">
                  {result.generic_name}
                </p>
              )}
            </div>
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                confidenceColor[result.confidence]
              }`}
            >
              {result.confidence === 'high' && t('high')}
              {result.confidence === 'medium' && t('medium')}
              {result.confidence === 'low' && t('low')}
            </span>
          </div>

          {/* Basic Info */}
          <div className="flex flex-wrap gap-4 text-sm text-text-secondary dark:text-gray-400">
            {result.dosage && (
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4" />
                <span>{result.dosage}</span>
              </div>
            )}
            {result.form && (
              <div className="capitalize">
                {result.form}
              </div>
            )}
            {result.manufacturer && (
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span>{result.manufacturer}</span>
              </div>
            )}
            {result.expiry_date && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Exp: {result.expiry_date}</span>
              </div>
            )}
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={() => scrollCarousel('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-text-primary dark:text-gray-100" />
          </button>
          <button
            onClick={() => scrollCarousel('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-text-primary dark:text-gray-100" />
          </button>

          {/* Carousel */}
          <div
            ref={carouselRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {cards.map((card, index) => (
              <div key={index} className="flex-shrink-0 w-[300px]">
                {renderCard(card.type, card.data, result, t)}
              </div>
            ))}
          </div>
        </div>

        {/* Suggestions Section */}
        {result.category && result.packaging_language && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-text-primary dark:text-gray-100">
                {t('suggestions')}
              </h3>
              {suggestions.length > 0 && (
                <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                  {suggestions.length} résultats
                </span>
              )}
            </div>

            {loadingSuggestions ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-text-secondary dark:text-gray-400">{t('loadingSuggestions')}</p>
                <div className="relative w-8 h-8">
                  <div className="absolute top-0 left-0 w-full h-full border-2 border-primary/20 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-full h-full border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
            ) : suggestions.length > 0 ? (
              <div className="relative">
                {/* Navigation Buttons */}
                {suggestions.length > 1 && (
                  <>
                    <button
                      onClick={() => scrollSuggestions('left')}
                      className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-text-primary dark:text-gray-100" />
                    </button>
                    <button
                      onClick={() => scrollSuggestions('right')}
                      className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-text-primary dark:text-gray-100" />
                    </button>
                  </>
                )}

                {/* Suggestions Carousel */}
                <div
                  ref={suggestionsRef}
                  className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {suggestions.map((suggestion, index) => (
                    <div key={`${suggestion.id}-${index}`} className="flex-shrink-0 w-[260px]">
                      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
                        <CardContent className="flex-1 flex flex-col p-4">
                          {/* Nom du médicament */}
                          <h4 className="text-sm font-bold text-text-primary mb-2 line-clamp-2">
                            {suggestion.name}
                          </h4>
                          
                          {/* Badges : Dosage + Forme + Catégorie */}
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {suggestion.dosage && (
                              <span className="text-[10px] font-semibold text-white bg-primary px-2 py-1 rounded-full">
                                {suggestion.dosage}
                              </span>
                            )}
                            {suggestion.form && (
                              <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
                                {suggestion.form}
                              </span>
                            )}
                            {suggestion.category && (
                              <span className="text-[10px] font-semibold text-text-secondary dark:text-gray-300 bg-background-secondary dark:bg-gray-700 px-2 py-1 rounded-full">
                                {translateCategory(suggestion.category, language)}
                              </span>
                            )}
                          </div>
                          
                          {/* Indications thérapeutiques */}
                          {suggestion.indications && (
                            <div className="mb-3 p-2 bg-primary/5 rounded-lg border border-primary/10">
                              <p className="text-[11px] text-text-primary leading-relaxed">
                                {suggestion.indications}
                              </p>
                            </div>
                          )}
                          
                          {/* Description/Présentation */}
                          {(suggestion.description || suggestion.presentation) && (
                            <p className="text-xs text-text-secondary line-clamp-2 mb-2">
                              {suggestion.description || suggestion.presentation}
                            </p>
                          )}
                          
                          {/* Composition (principe actif) */}
                          {suggestion.composition && suggestion.composition !== suggestion.name && (
                            <p className="text-[10px] text-text-muted mt-auto pt-2 border-t border-background-secondary">
                              PA: {suggestion.composition}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            ) : !loadingSuggestions && suggestions.length === 0 && (
              <div className="text-center py-8 text-text-secondary dark:text-gray-400">
                <p className="text-sm">{t('noSuggestions')}</p>
              </div>
            )}
          </div>
        )}
        

        {/* Medical Disclaimer */}
        <div className="p-4 bg-primary-light rounded-xl">
          <p className="text-sm text-text-primary">
            {result.disclaimer}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="ghost"
            className="flex-1"
            icon={<ThumbsUp className="w-5 h-5" />}
          >
            {t('useful') || 'Utile'}
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            icon={<Bell className="w-5 h-5" />}
            onClick={() => setShowReminderModal(true)}
          >
            {t('addReminder') || 'Ajouter un rappel'}
          </Button>
          <Button
            variant="ghost"
            className="flex-1"
            icon={<Share2 className="w-5 h-5" />}
          >
            {t('share') || 'Partager'}
          </Button>
        </div>
      </div>

      {/* Modal de création de rappel */}
      {showReminderModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl transition-colors">
            {reminderSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-text-primary dark:text-gray-100 mb-2">
                  {t('reminderCreated') || 'Rappel créé !'}
                </h3>
                <p className="text-text-secondary dark:text-gray-400">
                  {t('reminderCreatedDesc') || 'Vous serez notifié pour prendre votre médicament.'}
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                      <Bell className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h3 className="text-xl font-bold text-text-primary dark:text-gray-100">
                      {t('addReminder') || 'Ajouter un rappel'}
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowReminderModal(false)}
                    className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4 text-text-secondary dark:text-gray-400" />
                  </button>
                </div>

                <form onSubmit={handleCreateReminder} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-text-primary dark:text-gray-100 mb-2">
                      {t('medicationName') || 'Nom du médicament'}
                    </label>
                    <input
                      type="text"
                      value={reminderForm.medication_name}
                      onChange={(e) => setReminderForm({ ...reminderForm, medication_name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-text-primary dark:text-gray-100 placeholder:text-text-muted dark:placeholder:text-gray-500 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text-primary dark:text-gray-100 mb-2">
                      {t('dosage') || 'Dosage'}
                    </label>
                    <input
                      type="text"
                      value={reminderForm.dosage}
                      onChange={(e) => setReminderForm({ ...reminderForm, dosage: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-text-primary dark:text-gray-100 placeholder:text-text-muted dark:placeholder:text-gray-500 transition-colors"
                      placeholder="ex: 500 mg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text-primary dark:text-gray-100 mb-2">
                      {t('time') || 'Heure de prise'}
                    </label>
                    <CustomTimePicker
                      value={reminderForm.time}
                      onChange={(time) => setReminderForm({ ...reminderForm, time })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text-primary dark:text-gray-100 mb-2">
                      {t('frequency') || 'Fréquence'}
                    </label>
                    <CustomDropdown
                      value={reminderForm.frequency}
                      onChange={(frequency) => setReminderForm({ ...reminderForm, frequency: frequency as any })}
                      options={[
                        {
                          value: 'daily',
                          label: t('daily') || '1 fois par jour',
                          icon: <CalendarIcon className="w-4 h-4" />,
                        },
                        {
                          value: 'twice',
                          label: t('twice') || '2 fois par jour',
                          icon: <Repeat className="w-4 h-4" />,
                        },
                        {
                          value: 'three-times',
                          label: t('threeTimes') || '3 fois par jour',
                          icon: <Repeat className="w-4 h-4" />,
                        },
                      ]}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowReminderModal(false)}
                      className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-text-secondary dark:text-gray-300 font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      {t('cancel') || 'Annuler'}
                    </button>
                    <button
                      type="submit"
                      disabled={reminderCreating}
                      className="flex-1 px-4 py-3 rounded-xl bg-primary dark:bg-blue-500 text-white font-semibold hover:bg-primary/90 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {reminderCreating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          {t('creating') || 'Création...'}
                        </>
                      ) : (
                        <>
                          <Bell className="w-4 h-4" />
                          {t('create') || 'Créer'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-[30px] left-6 right-6 max-w-2xl mx-auto">
        <div className="relative">
          <div className="relative bg-white rounded-[40px] h-[85px] shadow-[0_10px_40px_rgba(26,59,93,0.06)]">
            <div className="flex items-center justify-around h-full px-6 relative z-10">
              <NavItem icon="home" active={false} onClick={() => goBack()} />
              <NavItem icon="search" active={false} />
              <div className="w-[68px]"></div>
              <NavItem icon="bell" active={false} />
              <NavItem icon="settings" active={false} />
            </div>
            <svg
              className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
              width="100"
              height="30"
              viewBox="0 0 100 30"
              preserveAspectRatio="none"
              style={{ filter: 'drop-shadow(0 -2px 8px rgba(26, 59, 93, 0.06))' }}
            >
              <path
                d="M 0 30 L 0 20 C 20 20, 30 10, 50 10 C 70 10, 80 20, 100 20 L 100 30 Z"
                fill="white"
              />
            </svg>
          </div>
          <button
            onClick={() => navigateTo('scan')}
            className="absolute left-1/2 -translate-x-1/2 -top-[34px] w-[68px] h-[68px] bg-gradient-to-r from-[#5B9FED] to-[#3B7FD4] rounded-full shadow-[0_4px_20px_rgba(91,159,237,0.4)] flex items-center justify-center z-20"
          >
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </nav>
    </div>
  );
}

function renderCard(type: string, data: any, result: ScanResult, t: (key: TranslationKey) => string) {
  const cardHeight = "h-[400px]"; // Fixed height for all cards

  // Helper pour convertir string ou array en array de lignes
  const toArray = (value: any): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      return value
        .split('\n')
        .map((v) => v.trim())
        .filter((v) => v.length > 0);
    }
    return [];
  };

  switch (type) {
    case 'composition':
      return (
        <Card className={cardHeight + " flex flex-col dark:bg-gray-800 dark:border-gray-700 transition-colors"}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-primary dark:text-blue-400" />
              <CardTitle className="text-lg font-bold text-text-primary dark:text-gray-100">{t('composition')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 flex-1 overflow-y-auto">
            {result.active_ingredient && (
              <div>
                <p className="text-sm font-bold text-primary dark:text-blue-400 mb-1">{t('activeIngredient')}:</p>
                <p className="text-text-secondary dark:text-gray-300 text-sm">{result.active_ingredient}</p>
              </div>
            )}
            {result.excipients && (
              <div>
                <p className="text-sm font-bold text-primary dark:text-blue-400 mb-1">{t('excipients')}:</p>
                <p className="text-text-secondary dark:text-gray-300 text-sm">{result.excipients}</p>
              </div>
            )}
          </CardContent>
        </Card>
      );

    case 'indications':
      return (
        <Card className={cardHeight + " flex flex-col dark:bg-gray-800 dark:border-gray-700 transition-colors"}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-primary dark:text-blue-400" />
              <CardTitle className="text-lg font-bold text-text-primary dark:text-gray-100">{t('indications')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            <p className="text-text-secondary dark:text-gray-300 text-sm leading-relaxed">
              {data.split(/(\b(?:pour|traitement|symptômes|maladie|fièvre|douleur|infection)\b)/gi).map((part: string, i: number) => {
                const isKeyword = /^(?:pour|traitement|symptômes|maladie|fièvre|douleur|infection)$/i.test(part.trim());
                return isKeyword ? (
                  <span key={i} className="text-primary dark:text-blue-400 font-semibold">{part}</span>
                ) : (
                  <span key={i}>{part}</span>
                );
              })}
            </p>
          </CardContent>
        </Card>
      );

    case 'posology':
      // Vérifier si c'est un message d'erreur
      const isError = typeof data === 'string' && (
        data.includes('Erreur') || 
        data.includes('erreur') || 
        data.includes('Erreur lors de l\'analyse')
      );
      
      return (
        <Card className={cardHeight + " flex flex-col dark:bg-gray-800 dark:border-gray-700 transition-colors"}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary dark:text-blue-400" />
              <CardTitle className="text-lg font-bold text-text-primary dark:text-gray-100">{t('posology')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            {isError ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <AlertTriangle className="w-12 h-12 text-orange-500 dark:text-orange-400 mb-3" />
                <p className="text-orange-600 dark:text-orange-400 font-semibold mb-2">{t('infoNotAvailable') || 'Information non disponible'}</p>
                <p className="text-text-secondary dark:text-gray-300 text-sm">
                  {data}
                </p>
              </div>
            ) : (
              <p className="text-text-secondary dark:text-gray-300 text-sm leading-relaxed">
                {typeof data === 'string' ? data.split(/(\b(?:prendre|dose|fois|jour|comprimé|gélule|mg|ml|avant|après|repas)\b)/gi).map((part: string, i: number) => {
                  const isKeyword = /^(?:prendre|dose|fois|jour|comprimé|gélule|mg|ml|avant|après|repas)$/i.test(part.trim());
                  return isKeyword ? (
                    <span key={i} className="text-primary dark:text-blue-400 font-semibold">{part}</span>
                  ) : (
                    <span key={i}>{part}</span>
                  );
                }) : String(data)}
              </p>
            )}
          </CardContent>
        </Card>
      );

    case 'contraindications':
      return (
        <Card className={cardHeight + " flex flex-col border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 transition-colors"}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <CardTitle className="text-lg font-bold text-red-700 dark:text-red-300">{t('contraindications')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            <ul className="space-y-3">
              {toArray(data).map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm text-text-secondary dark:text-gray-300">
                  <span className="text-red-600 dark:text-red-400 mt-0.5 font-bold text-base">•</span>
                  <span className="flex-1">
                    {item.split(/(\b(?:ne pas|interdit|contre-indiqué|éviter|déconseillé|risque|danger)\b)/gi).map((part: string, j: number) => {
                      const isKeyword = /^(?:ne pas|interdit|contre-indiqué|éviter|déconseillé|risque|danger)$/i.test(part.trim());
                      return isKeyword ? (
                        <span key={j} className="text-red-600 dark:text-red-400 font-bold">{part}</span>
                      ) : (
                        <span key={j}>{part}</span>
                      );
                    })}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      );

    case 'precautions':
      return (
        <Card className={cardHeight + " flex flex-col border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 transition-colors"}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <CardTitle className="text-lg font-bold text-blue-700 dark:text-blue-300">{t('precautions')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            <p className="text-text-secondary dark:text-gray-300 text-sm leading-relaxed">
              {data.split(/(\b(?:attention|prudence|surveillance|risque|éviter|précaution)\b)/gi).map((part: string, i: number) => {
                const isKeyword = /^(?:attention|prudence|surveillance|risque|éviter|précaution)$/i.test(part.trim());
                return isKeyword ? (
                  <span key={i} className="text-blue-600 dark:text-blue-400 font-semibold">{part}</span>
                ) : (
                  <span key={i}>{part}</span>
                );
              })}
            </p>
          </CardContent>
        </Card>
      );

    case 'side_effects':
      return (
        <Card className={cardHeight + " flex flex-col border border-orange-200 bg-orange-50"}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <CardTitle className="text-lg font-bold text-orange-700">Effets indésirables</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            <ul className="space-y-3">
              {toArray(data).map((effect: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm text-text-secondary">
                  <span className="text-orange-600 mt-0.5 font-bold text-base">•</span>
                  <span className="flex-1">{effect}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      );

    case 'interactions':
      return (
        <Card className={cardHeight + " flex flex-col"}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg font-bold text-text-primary">Interactions</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            <ul className="space-y-3">
              {toArray(data).map((interaction: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm text-text-secondary">
                  <span className="text-primary mt-0.5 font-bold text-base">•</span>
                  <span className="flex-1">
                    {interaction.split(/(\b(?:éviter|risque|augmentation|diminution|interaction|déconseillé|précaution)\b)/gi).map((part: string, j: number) => {
                      const isKeyword = /^(?:éviter|risque|augmentation|diminution|interaction|déconseillé|précaution)$/i.test(part.trim());
                      return isKeyword ? (
                        <span key={j} className="text-primary font-semibold">{part}</span>
                      ) : (
                        <span key={j}>{part}</span>
                      );
                    })}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      );

    case 'overdose':
      return (
        <Card className={cardHeight + " flex flex-col border border-red-200 bg-red-50"}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <CardTitle className="text-lg font-bold text-red-700">Surdosage</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            <p className="text-text-secondary text-sm leading-relaxed">
              {data.split(/(\b(?:surdosage|danger|risque|symptômes|urgence|appeler|médecin)\b)/gi).map((part: string, i: number) => {
                const isKeyword = /^(?:surdosage|danger|risque|symptômes|urgence|appeler|médecin)$/i.test(part.trim());
                return isKeyword ? (
                  <span key={i} className="text-red-600 font-bold">{part}</span>
                ) : (
                  <span key={i}>{part}</span>
                );
              })}
            </p>
          </CardContent>
        </Card>
      );

    case 'storage':
      return (
        <Card className={cardHeight + " flex flex-col"}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg font-bold text-text-primary">Conservation</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            <p className="text-text-secondary text-sm leading-relaxed">
              {data.split(/(\b(?:température|conservation|réfrigérateur|à l'abri|protéger)\b)/gi).map((part: string, i: number) => {
                const isKeyword = /^(?:température|conservation|réfrigérateur|à l'abri|protéger)$/i.test(part.trim());
                return isKeyword ? (
                  <span key={i} className="text-primary font-semibold">{part}</span>
                ) : (
                  <span key={i}>{part}</span>
                );
              })}
            </p>
          </CardContent>
        </Card>
      );

    case 'warnings':
      return (
        <Card className={cardHeight + " flex flex-col border border-yellow-200 bg-yellow-50"}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <CardTitle className="text-lg font-bold text-yellow-700">Avertissements</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            <ul className="space-y-3">
              {data.map((warning: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm text-text-secondary">
                  <span className="text-yellow-600 mt-0.5 font-bold text-base">•</span>
                  <span className="flex-1">{warning}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      );

    case 'additional_info':
      return (
        <Card className={cardHeight + " flex flex-col"}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg font-bold text-text-primary">Informations</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            <p className="text-text-secondary text-sm leading-relaxed">
              {data}
            </p>
          </CardContent>
        </Card>
      );

    default:
      return null;
  }
}

function NavItem({ icon, active, onClick }: { icon: string; active: boolean; onClick?: () => void }) {
  const iconSize = "w-7 h-7";
  
  const icons = {
    home: (
      <svg 
        className={iconSize} 
        fill={active ? "#1A3B5D" : "none"} 
        stroke={active ? "#1A3B5D" : "rgba(26, 59, 93, 0.25)"} 
        viewBox="0 0 24 24"
        strokeWidth={active ? 0 : 2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    search: (
      <svg 
        className={iconSize} 
        fill="none" 
        stroke="rgba(26, 59, 93, 0.25)" 
        viewBox="0 0 24 24"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    bell: (
      <svg 
        className={iconSize} 
        fill="none" 
        stroke="rgba(26, 59, 93, 0.25)" 
        viewBox="0 0 24 24"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    settings: (
      <Settings 
        className={iconSize} 
        stroke="rgba(26, 59, 93, 0.25)" 
        strokeWidth={2}
      />
    ),
  };

  return (
    <button 
      className="flex flex-col items-center justify-center relative"
      onClick={onClick}
    >
      {icons[icon as keyof typeof icons]}
      {active && (
        <div className="absolute top-[38px] w-1 h-1 rounded-full bg-accent"></div>
      )}
    </button>
  );
}

