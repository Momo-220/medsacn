'use client';

import React, { useState, useEffect } from 'react';
import { Lightbulb, Bell, Clock, Pill } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { apiClient } from '@/lib/api/client';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Language } from '@/lib/i18n/translations';

interface NextReminder {
  name: string;
  time: string;
  dosage: string;
}

interface HealthTip {
  title: string;
  description: string;
  icon: string;
}

// Tips traduits selon la langue
const getHealthTips = (language: Language): HealthTip[] => {
  if (language === 'en') {
    return [
      { title: "Hydration", description: "Drink a large glass of water with your medications to facilitate absorption", icon: "💧" },
      { title: "Optimal timing", description: "Take your medications at fixed times to maintain a constant level", icon: "⏰" },
      { title: "Storage", description: "Keep your medications away from light and moisture", icon: "🌡️" },
      { title: "Interactions", description: "Avoid alcohol and grapefruit with most medications", icon: "⚠️" },
      { title: "Expiration", description: "Always check the expiration date before taking a medication", icon: "📅" },
      { title: "Dosage", description: "Never double the dose if you missed a dose", icon: "💊" },
      { title: "Side effects", description: "Note any unusual effects and consult your pharmacist", icon: "📝" },
      { title: "Food", description: "Some medications are taken with meals, others on an empty stomach", icon: "🍽️" },
      { title: "Sun", description: "Some antibiotics increase sun sensitivity, protect yourself", icon: "☀️" },
      { title: "Driving", description: "Check if your medications can impair alertness", icon: "🚗" },
      { title: "Pregnancy", description: "Always consult before taking medication while pregnant", icon: "🤰" },
      { title: "Breastfeeding", description: "Some medications pass into breast milk", icon: "🍼" },
      { title: "Children", description: "Never give adult medications to children", icon: "👶" },
      { title: "Elderly", description: "Doses often need to be adjusted with age", icon: "👴" },
      { title: "Antibiotics", description: "Always complete the treatment even if you feel better", icon: "🦠" },
      { title: "Painkillers", description: "Do not exceed 3g of paracetamol per day", icon: "💊" },
      { title: "Aspirin", description: "Never give aspirin to children without medical advice", icon: "⛔" },
      { title: "Ibuprofen", description: "Take with meals to protect the stomach", icon: "🍔" },
      { title: "Vitamins", description: "Fat-soluble vitamins (A,D,E,K) are taken with a fatty meal", icon: "🥑" },
      { title: "Iron", description: "Iron is taken on an empty stomach with orange juice (vitamin C)", icon: "🍊" },
      { title: "Calcium", description: "Space calcium and iron intake by at least 2 hours", icon: "🥛" },
      { title: "Probiotics", description: "Take them 2 hours after antibiotics to preserve flora", icon: "🦠" },
      { title: "Antihistamines", description: "May cause drowsiness, avoid driving", icon: "😴" },
      { title: "Cortisone", description: "Take in the morning to respect natural rhythm", icon: "🌅" },
      { title: "Antihypertensives", description: "Always take them at the same time", icon: "❤️" },
      { title: "Diabetes", description: "Monitor your blood sugar regularly", icon: "📊" },
      { title: "Anticoagulants", description: "Avoid high-risk impact sports", icon: "🩸" },
      { title: "Statins", description: "Generally taken in the evening", icon: "🌙" },
      { title: "Omeprazole", description: "Take 30 minutes before meals", icon: "⏱️" },
      { title: "Levothyroxine", description: "On an empty stomach, 30 minutes before breakfast", icon: "🦋" },
      { title: "Pill", description: "Take it at a fixed time for optimal effectiveness", icon: "💊" },
      { title: "Inhalers", description: "Rinse your mouth after use", icon: "💨" },
      { title: "Eye drops", description: "Wait 5 minutes between two different eye drops", icon: "👁️" },
      { title: "Patches", description: "Change location with each application", icon: "🩹" },
      { title: "Suppositories", description: "Keep them cool", icon: "❄️" },
      { title: "Syrups", description: "Use the provided dispenser, not a spoon", icon: "🥄" },
      { title: "Capsules", description: "Do not open them, swallow them whole", icon: "💊" },
      { title: "Tablets", description: "Some can be cut, others cannot", icon: "✂️" },
      { title: "Effervescent", description: "Wait for complete dissolution before drinking", icon: "🫧" },
      { title: "Sublingual", description: "Let it melt under the tongue, do not swallow", icon: "👅" },
      { title: "Storage", description: "The bathroom is not ideal (humidity)", icon: "🚿" },
      { title: "Travel kit", description: "Keep medications in their box with the leaflet", icon: "✈️" },
      { title: "Time zone", description: "Gradually adjust the time of intake", icon: "🌍" },
      { title: "Generics", description: "Same effectiveness as brand name, reduced price", icon: "💰" },
      { title: "Prescription", description: "Keep your prescriptions for 3 years", icon: "📄" },
      { title: "Pharmacist", description: "Don't hesitate to ask all your questions", icon: "👨‍⚕️" },
      { title: "Doctor", description: "Inform them of all your current treatments", icon: "🩺" },
      { title: "Self-medication", description: "Maximum 5 days without medical advice", icon: "⏳" },
      { title: "Recycling", description: "Return expired medications to pharmacy", icon: "♻️" },
      { title: "Emergencies", description: "In case of overdose, call 15 immediately", icon: "🚨" }
    ];
  }
  
  // Français (par défaut)
  return [
    { title: "Hydratation", description: "Buvez un grand verre d'eau avec vos médicaments pour faciliter l'absorption", icon: "💧" },
    { title: "Timing optimal", description: "Prenez vos médicaments à heures fixes pour maintenir un niveau constant", icon: "⏰" },
    { title: "Conservation", description: "Conservez vos médicaments à l'abri de la lumière et de l'humidité", icon: "🌡️" },
    { title: "Interactions", description: "Évitez l'alcool et le pamplemousse avec la plupart des médicaments", icon: "⚠️" },
    { title: "Péremption", description: "Vérifiez toujours la date de péremption avant de prendre un médicament", icon: "📅" },
    { title: "Posologie", description: "Ne doublez jamais la dose si vous avez oublié une prise", icon: "💊" },
    { title: "Effets secondaires", description: "Notez tout effet inhabituel et consultez votre pharmacien", icon: "📝" },
    { title: "Alimentation", description: "Certains médicaments se prennent pendant les repas, d'autres à jeun", icon: "🍽️" },
    { title: "Soleil", description: "Certains antibiotiques augmentent la sensibilité au soleil, protégez-vous", icon: "☀️" },
    { title: "Conduite", description: "Vérifiez si vos médicaments peuvent altérer la vigilance", icon: "🚗" },
    { title: "Grossesse", description: "Consultez toujours avant de prendre un médicament enceinte", icon: "🤰" },
    { title: "Allaitement", description: "Certains médicaments passent dans le lait maternel", icon: "🍼" },
    { title: "Enfants", description: "Ne donnez jamais de médicaments adultes aux enfants", icon: "👶" },
    { title: "Personnes âgées", description: "Les doses doivent souvent être adaptées avec l'âge", icon: "👴" },
    { title: "Antibiotiques", description: "Terminez toujours le traitement même si vous vous sentez mieux", icon: "🦠" },
    { title: "Antidouleurs", description: "Ne dépassez pas 3g de paracétamol par jour", icon: "💊" },
    { title: "Aspirine", description: "Ne donnez jamais d'aspirine aux enfants sans avis médical", icon: "⛔" },
    { title: "Ibuprofène", description: "À prendre pendant les repas pour protéger l'estomac", icon: "🍔" },
    { title: "Vitamines", description: "Les vitamines liposolubles (A,D,E,K) se prennent avec un repas gras", icon: "🥑" },
    { title: "Fer", description: "Le fer se prend à jeun avec du jus d'orange (vitamine C)", icon: "🍊" },
    { title: "Calcium", description: "Espacez la prise de calcium et de fer de 2 heures minimum", icon: "🥛" },
    { title: "Probiotiques", description: "Prenez-les 2h après les antibiotiques pour préserver la flore", icon: "🦠" },
    { title: "Antihistaminiques", description: "Peuvent causer de la somnolence, évitez de conduire", icon: "😴" },
    { title: "Cortisone", description: "À prendre le matin pour respecter le rythme naturel", icon: "🌅" },
    { title: "Antihypertenseurs", description: "Prenez-les toujours à la même heure", icon: "❤️" },
    { title: "Diabète", description: "Surveillez votre glycémie régulièrement", icon: "📊" },
    { title: "Anticoagulants", description: "Évitez les sports à risque de choc", icon: "🩸" },
    { title: "Statines", description: "Se prennent généralement le soir", icon: "🌙" },
    { title: "Oméprazole", description: "À prendre 30 minutes avant le repas", icon: "⏱️" },
    { title: "Lévothyrox", description: "À jeun, 30 minutes avant le petit-déjeuner", icon: "🦋" },
    { title: "Pilule", description: "Prenez-la à heure fixe pour une efficacité optimale", icon: "💊" },
    { title: "Inhalateurs", description: "Rincez-vous la bouche après usage", icon: "💨" },
    { title: "Collyres", description: "Attendez 5 minutes entre deux collyres différents", icon: "👁️" },
    { title: "Patchs", description: "Changez l'emplacement à chaque application", icon: "🩹" },
    { title: "Suppositoires", description: "Conservez-les au frais", icon: "❄️" },
    { title: "Sirops", description: "Utilisez la dosette fournie, pas une cuillère", icon: "🥄" },
    { title: "Gélules", description: "Ne les ouvrez pas, avalez-les entières", icon: "💊" },
    { title: "Comprimés", description: "Certains peuvent être coupés, d'autres non", icon: "✂️" },
    { title: "Effervescents", description: "Attendez la dissolution complète avant de boire", icon: "🫧" },
    { title: "Sublinguaux", description: "Laissez fondre sous la langue, ne pas avaler", icon: "👅" },
    { title: "Stockage", description: "La salle de bain n'est pas idéale (humidité)", icon: "🚿" },
    { title: "Trousse voyage", description: "Gardez les médicaments dans leur boîte avec la notice", icon: "✈️" },
    { title: "Décalage horaire", description: "Adaptez progressivement l'heure de prise", icon: "🌍" },
    { title: "Génériques", description: "Même efficacité que le princeps, prix réduit", icon: "💰" },
    { title: "Ordonnance", description: "Conservez vos ordonnances pendant 3 ans", icon: "📄" },
    { title: "Pharmacien", description: "N'hésitez pas à lui poser toutes vos questions", icon: "👨‍⚕️" },
    { title: "Médecin", description: "Informez-le de tous vos traitements en cours", icon: "🩺" },
    { title: "Automédication", description: "Maximum 5 jours sans avis médical", icon: "⏳" },
    { title: "Recyclage", description: "Rapportez vos médicaments périmés en pharmacie", icon: "♻️" },
    { title: "Urgences", description: "En cas de surdosage, appelez le 15 immédiatement", icon: "🚨" }
  ];
};

export function HealthTipsCard({ skeleton = false }: { skeleton?: boolean }) {
  const { t, language } = useLanguage();
  const { user, getIdToken } = useAuth();
  const healthTips = getHealthTips(language);

  const [currentTip, setCurrentTip] = useState(0);
  const [nextReminder, setNextReminder] = useState<NextReminder | null>(null);
  const [loadingReminder, setLoadingReminder] = useState(true);

  if (skeleton) {
    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-blue-900/20 dark:to-blue-800/10 rounded-3xl p-4 sm:p-5 border border-primary/20 dark:border-blue-800/30">
          <div className="flex items-start gap-4">
            <Skeleton width="w-12" height="h-12" rounded="xl" className="flex-shrink-0" />
            <div className="flex-1 min-w-0 space-y-2">
              <Skeleton height="h-4" width="w-32" rounded="md" />
              <Skeleton height="h-5" width="w-3/4" rounded="md" />
              <Skeleton height="h-4" width="w-1/2" rounded="md" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/10 rounded-3xl p-4 sm:p-5 border border-green-100/50 dark:border-green-800/30">
          <div className="flex items-start gap-4">
            <Skeleton width="w-12" height="h-12" rounded="xl" className="flex-shrink-0" />
            <div className="flex-1 min-w-0 space-y-2">
              <Skeleton height="h-4" width="w-24" rounded="md" />
              <Skeleton height="h-5" width="w-full" rounded="md" />
              <Skeleton height="h-4" width="w-5/6" rounded="md" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-green-200/50 dark:border-green-800/30">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} height="h-1" width="w-4" rounded="full" />
              ))}
            </div>
            <Skeleton height="h-4" width="w-12" rounded="md" />
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % healthTips.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [healthTips.length]);

  useEffect(() => {
    const loadNextReminder = async () => {
      if (!user || user.isAnonymous) {
        setNextReminder(null);
        setLoadingReminder(false);
        return;
      }
      try {
        const token = await getIdToken();
        if (token) apiClient.setAuthToken(token);
        const response = await apiClient.getReminders(true, 50);
        const reminders = response.reminders || [];
        const activeReminders = reminders.filter((r: any) => r.active);
        const sorted = activeReminders.sort(
          (a: any, b: any) => new Date(a.next_dose).getTime() - new Date(b.next_dose).getTime()
        );
        const first = sorted[0];
        if (first) {
          setNextReminder({
            name: first.medication_name || '',
            time: first.time || new Date(first.next_dose).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            dosage: first.dosage || '',
          });
        } else {
          setNextReminder(null);
        }
      } catch {
        setNextReminder(null);
      } finally {
        setLoadingReminder(false);
      }
    };
    loadNextReminder();
  }, [user]);

  const tip = healthTips[currentTip];

  return (
    <div className="space-y-4">
      {/* Section Rappel de prise */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-blue-900/20 dark:to-blue-800/10 rounded-3xl p-4 sm:p-5 border border-primary/20 dark:border-blue-800/30 transition-colors">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
            <Bell className="w-6 h-6 text-primary dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-text-primary dark:text-gray-100 font-bold text-sm mb-2">
              {t('nextReminderTitle')}
            </h3>
            {loadingReminder ? (
              <p className="text-text-secondary dark:text-gray-400 text-sm animate-pulse">
                {t('loading') || 'Chargement...'}
              </p>
            ) : nextReminder ? (
              <>
                <p className="text-text-primary dark:text-gray-100 font-semibold text-base mb-2">
                  {nextReminder.name}
                </p>
                <div className="flex items-center gap-3 text-text-secondary dark:text-gray-400 text-xs">
                  <span className="flex items-center gap-1.5 bg-white/60 dark:bg-gray-700/60 px-2 py-1 rounded-lg">
                    <Clock className="w-3.5 h-3.5" />
                    {nextReminder.time}
                  </span>
                  {nextReminder.dosage && (
                    <span className="flex items-center gap-1.5 bg-white/60 dark:bg-gray-700/60 px-2 py-1 rounded-lg">
                      <Pill className="w-3.5 h-3.5" />
                      {nextReminder.dosage}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <p className="text-text-secondary dark:text-gray-400 text-sm">
                {t('noReminderScheduled')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Section Astuce santé */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/10 rounded-3xl p-4 sm:p-5 border border-green-100/50 dark:border-green-800/30 relative overflow-hidden transition-colors">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-800/30 dark:to-emerald-800/20 flex items-center justify-center flex-shrink-0 text-2xl">
            {tip.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-green-600 dark:text-green-400" />
              <h3 className="text-text-primary dark:text-gray-100 font-bold text-sm">
                {t('healthTip')}
              </h3>
            </div>
            <h4 className="text-text-primary dark:text-gray-100 font-semibold text-base mb-1">
              {tip.title}
            </h4>
            <p className="text-text-secondary dark:text-gray-300 text-sm leading-relaxed">
              {tip.description}
            </p>
          </div>
        </div>
        
        {/* Indicateur de progression */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-green-200/50 dark:border-green-800/30">
          <div className="flex gap-1">
            {healthTips.slice(0, 5).map((_, idx) => (
              <div
                key={idx}
                className={`h-1 rounded-full transition-all ${
                  idx === currentTip % 5 ? 'w-6 bg-green-500 dark:bg-green-400' : 'w-1.5 bg-green-200 dark:bg-green-800'
                }`}
              />
            ))}
          </div>
          <span className="text-green-600 dark:text-green-400 text-xs font-medium">
            {currentTip + 1}/{healthTips.length}
          </span>
        </div>
      </div>
    </div>
  );
}
