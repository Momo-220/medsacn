'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Shield, 
  Globe,
  Moon,
  HelpCircle,
  FileText,
  Info,
  ChevronRight,
  ArrowLeft,
  Sun,
  Monitor,
  Smartphone,
  Download,
  ChevronLeft
} from 'lucide-react';
import { useNavigation } from '@/lib/navigation/NavigationContext';
import { NotificationService } from '@/lib/notifications';
import { SettingsToggle } from '@/components/ui/SettingsToggle';
import { SettingsModal } from '@/components/ui/SettingsModal';
import { PwaInstallButton } from '@/components/ui/PwaInstallButton';
import { usePwaInstall } from '@/hooks/usePwaInstall';
import { getDeferredPrompt, triggerPwaInstall } from '@/lib/pwa-install';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import type { TranslationKey } from '@/lib/i18n/translations';

export function SettingsScreen() {
  const { goBack, navigateTo } = useNavigation();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { canInstall } = usePwaInstall();
  
  // États
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [installChoice, setInstallChoice] = useState<'choice' | 'android' | 'ios'>('choice');
  const [iosCarouselIndex, setIosCarouselIndex] = useState(0);
  const [iosImageError, setIosImageError] = useState(false);
  const [showIosImageFullscreen, setShowIosImageFullscreen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  const IOS_STEPS = [
    // Images réelles placées dans /public/install-ios (format story 9:16)
    { instruction: 'installIOSStep1', image: '/install-ios/1.jpg' },
    { instruction: 'installIOSStep2', image: '/install-ios/2.jpg' },
    { instruction: 'installIOSStep3', image: '/install-ios/3.jpg' },
    { instruction: 'installIOSStep4', image: '/install-ios/4.jpg' },
    { instruction: 'installIOSStep5', image: '/install-ios/5.jpg' },
  ];

  const handleOpenIosImage = () => setShowIosImageFullscreen(true);

  // Détecter la plateforme
  useEffect(() => {
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
    setIsAndroid(/Android/.test(ua));
  }, []);

  // Vérifier l'état des notifications au chargement
  useEffect(() => {
    const checkNotifications = async () => {
      const enabled = NotificationService.isNotificationEnabled();
      setNotificationsEnabled(enabled);
    };
    checkNotifications();
  }, []);


  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      // Activer les notifications
      const granted = await NotificationService.initialize();
      setNotificationsEnabled(granted);
      if (!granted) {
        const { showError } = await import('@/components/ui/ErrorToast');
        showError({
          title: 'Notifications refusées',
          message: 'Autorisez les notifications dans les paramètres de votre navigateur pour recevoir les rappels.',
          type: 'warning'
        });
      }
    } else {
      // Désactiver les notifications (on ne peut pas vraiment les désactiver, juste informer)
      setNotificationsEnabled(false);
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    setTheme(newTheme);
    setShowThemeModal(false);
  };

  const handleLanguageChange = (newLanguage: 'fr' | 'en' | 'ar' | 'tr') => {
    setLanguage(newLanguage);
    setShowLanguageModal(false);
  };
  
  const getLanguageLabel = () => {
    switch (language) {
      case 'fr': return 'Français';
      case 'en': return 'English';
      case 'ar': return 'العربية';
      case 'tr': return 'Türkçe';
      default: return 'Français';
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-background pb-[calc(2rem+env(safe-area-inset-bottom))] pt-[env(safe-area-inset-top)]">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto pt-8 pb-6">
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-semibold">{t('back')}</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
          {t('settingsTitle')}
        </h1>
        <p className="text-text-secondary text-sm">
          {t('settingsDescription')}
        </p>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-4 pb-8">
        {/* Notifications */}
        <div className="card p-6">
          <h3 className="text-base font-bold text-text-primary mb-4">
            {t('notifications')}
          </h3>
          <div className="space-y-3">
            <SettingsToggle
              enabled={notificationsEnabled}
              onToggle={handleNotificationToggle}
              label={t('medicationReminders')}
              description={t('medicationRemindersDesc')}
            />
          </div>
        </div>

        {/* Installer l'app sur mobile — le bouton Installer n'apparaît que dans le modal quand l'utilisateur choisit Android */}
        <div className="card p-6">
          <h3 className="text-base font-bold text-text-primary mb-4 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary" />
            {t('installOnMobile')}
          </h3>
          <div className="space-y-3">
            <SettingItem
              icon={<Download className="w-5 h-5 text-primary" />}
              label={t('installHowTo')}
              description={t('installDesc')}
              onClick={() => { setShowInstallModal(true); setInstallChoice(isAndroid ? 'android' : isIOS ? 'ios' : 'choice'); setIosCarouselIndex(0); }}
            />
          </div>
        </div>

        {/* Confidentialité */}
        <div className="card p-6">
          <h3 className="text-base font-bold text-text-primary mb-4">
            {t('privacy')}
          </h3>
          <div className="space-y-3">
            <SettingItem
              icon={<Shield className="w-5 h-5 text-primary" />}
              label={t('authentication')}
              description={t('authenticationDesc')}
              onClick={() => navigateTo('profile')}
            />
          </div>
        </div>

        {/* Apparence */}
        <div className="card p-6">
          <h3 className="text-base font-bold text-text-primary mb-4">
            {t('appearance')}
          </h3>
          <div className="space-y-3">
            <SettingItem
              icon={<Moon className="w-5 h-5 text-primary" />}
              label={t('theme')}
              description={t('themeDesc')}
              value={theme === 'light' ? t('light') : theme === 'dark' ? t('dark') : t('auto')}
              onClick={() => setShowThemeModal(true)}
            />
            <SettingItem
              icon={<Globe className="w-5 h-5 text-primary" />}
              label={t('language')}
              description={t('languageDesc')}
              value={getLanguageLabel()}
              onClick={() => setShowLanguageModal(true)}
            />
          </div>
        </div>

        {/* À propos */}
        <div className="card p-6">
          <h3 className="text-base font-bold text-text-primary mb-4">
            {t('about')}
          </h3>
          <div className="space-y-3">
            <SettingItem
              icon={<HelpCircle className="w-5 h-5 text-primary" />}
              label={t('helpSupport')}
              description={t('helpSupportDesc')}
              onClick={() => setShowHelpModal(true)}
            />
            <SettingItem
              icon={<FileText className="w-5 h-5 text-primary" />}
              label={t('terms')}
              onClick={() => setShowTermsModal(true)}
            />
            <SettingItem
              icon={<FileText className="w-5 h-5 text-primary" />}
              label={t('privacyPolicy')}
              onClick={() => setShowPrivacyModal(true)}
            />
            <SettingItem
              icon={<Info className="w-5 h-5 text-primary" />}
              label={t('version')}
              value="1.0.0"
            />
          </div>
        </div>
      </div>

      {/* Modal Install App */}
      <SettingsModal
        isOpen={showInstallModal}
        onClose={() => { setShowInstallModal(false); setInstallChoice('choice'); }}
        title={installChoice === 'choice' ? t('installModalTitle') : installChoice === 'android' ? t('installAndroidTitle') : t('installIOSTitle')}
      >
        <div className="space-y-6">
          {/* Étape 1 : Choix Android / iPhone */}
          {installChoice === 'choice' && (
            <div className="space-y-4">
              <p className="text-sm text-text-secondary text-center">
                {t('installChoosePlatform')}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setInstallChoice('android')}
                  className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-green-500/50 bg-green-500/10 hover:bg-green-500/20 transition-colors"
                >
                  <div className="w-16 h-16 rounded-2xl bg-green-500/30 flex items-center justify-center p-2">
                    <img src="/logos/android.svg" alt="Android" className="w-full h-full object-contain" aria-hidden />
                  </div>
                  <span className="font-bold text-text-primary">{t('installSelectAndroid')}</span>
                </button>
                <button
                  onClick={() => setInstallChoice('ios')}
                  className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-gray-600/50 bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gray-700 flex items-center justify-center p-2">
                    <img src="/logos/apple.svg" alt="Apple" className="w-full h-full object-contain text-white" aria-hidden />
                  </div>
                  <span className="font-bold text-text-primary">{t('installSelectiPhone')}</span>
                </button>
              </div>
            </div>
          )}

          {/* Étape 2 : Android - Bouton d'installation direct */}
          {installChoice === 'android' && (
            <div className="space-y-4">
              <button
                onClick={() => setInstallChoice('choice')}
                className="flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('back')}
              </button>
              <p className="text-sm text-text-secondary">{t('installAndroidPrereq')}</p>
              {canInstall ? (
                <PwaInstallButton label={t('installButton')} className="w-full flex items-center justify-center gap-2 py-5 px-6 rounded-xl bg-primary text-white font-bold text-lg hover:bg-primary/90 transition-colors shadow-lg" />
              ) : (
                <>
                  <button
                    type="button"
                    onClick={async () => {
                      const hadPrompt = !!getDeferredPrompt();
                      const outcome = await triggerPwaInstall();
                      if (!hadPrompt) {
                        const msg = `${t('installAndroidStep1')}\n\n${t('installAndroidStep3')}`;
                        if (typeof window !== 'undefined' && window.alert) window.alert(msg);
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 py-5 px-6 rounded-xl bg-primary text-white font-bold text-lg hover:bg-primary/90 transition-colors shadow-lg"
                    aria-label={t('installButton')}
                  >
                    <Download className="w-6 h-6 flex-shrink-0" aria-hidden />
                    {t('installButton')}
                  </button>
                  <p className="text-sm text-text-secondary p-4 bg-background-secondary rounded-xl">
                    {t('installAndroidStep1')}<br /><br />
                    {t('installAndroidStep3')}
                  </p>
                </>
              )}
            </div>
          )}

          {/* Étape 2 : iPhone - Carousel images + instructions */}
          {installChoice === 'ios' && (
            <div className="space-y-4 flex flex-col items-stretch">
              <button
                onClick={() => setInstallChoice('choice')}
                className="flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('back')}
              </button>
              <p className="text-sm text-text-secondary">{t('installIOSImportant')}</p>
              
              {/* Carousel */}
              <div className="relative max-w-xs sm:max-w-sm w-full mx-auto">
                <div className="aspect-[9/16] max-h-[320px] rounded-2xl overflow-hidden bg-background-secondary relative">
                  <button
                    type="button"
                    onClick={handleOpenIosImage}
                    className="w-full h-full cursor-pointer"
                  >
                    <img
                      key={iosCarouselIndex}
                      src={IOS_STEPS[iosCarouselIndex].image}
                      alt={`Étape ${iosCarouselIndex + 1}`}
                      className="w-full h-full object-cover object-top"
                      onLoad={() => setIosImageError(false)}
                      onError={() => setIosImageError(true)}
                    />
                  </button>
                  {/* Fallback si image non trouvée - place tes images dans /public/install-ios/step1.png à step5.png */}
                  {iosImageError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-background-secondary">
                      <span className="text-4xl font-bold text-primary/50 mb-2">{iosCarouselIndex + 1}/5</span>
                      <p className="text-sm text-text-secondary text-center"><strong>{t(IOS_STEPS[iosCarouselIndex].instruction as TranslationKey)}</strong></p>
                    </div>
                  )}
                </div>
                
                {/* Navigation carousel */}
                <div className="flex items-center justify-between mt-3">
                  <button
                    onClick={() => { setIosCarouselIndex((i) => Math.max(0, i - 1)); setIosImageError(false); }}
                    disabled={iosCarouselIndex === 0}
                    className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center disabled:opacity-30"
                  >
                    <ChevronLeft className="w-5 h-5 text-primary" />
                  </button>
                  <span className="text-sm font-semibold text-text-secondary">
                    {iosCarouselIndex + 1} / {IOS_STEPS.length}
                  </span>
                  <button
                    onClick={() => { setIosCarouselIndex((i) => Math.min(IOS_STEPS.length - 1, i + 1)); setIosImageError(false); }}
                    disabled={iosCarouselIndex === IOS_STEPS.length - 1}
                    className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center disabled:opacity-30"
                  >
                    <ChevronRight className="w-5 h-5 text-primary" />
                  </button>
                </div>
                
                {/* Instruction actuelle */}
                <p className="mt-3 text-sm font-medium text-text-primary text-center p-3 bg-primary/5 rounded-xl">
                  <strong>{t(IOS_STEPS[iosCarouselIndex].instruction as TranslationKey)}</strong>
                </p>
              </div>

              {/* Lightbox image dans l'app */}
              {showIosImageFullscreen && (
                <div
                  className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4"
                  onClick={() => setShowIosImageFullscreen(false)}
                >
                  <button
                    type="button"
                    onClick={() => setShowIosImageFullscreen(false)}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl"
                    aria-label="Fermer"
                  >
                    ×
                  </button>
                  <img
                    src={IOS_STEPS[iosCarouselIndex].image}
                    alt={`Étape ${iosCarouselIndex + 1}`}
                    className="max-h-[90vh] max-w-full object-contain"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </SettingsModal>

      {/* Modals */}
      <SettingsModal
        isOpen={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        title={`${t('theme')} - ${t('settingsTitle')}`}
      >
        <div className="space-y-2">
          <ThemeOption
            icon={<Sun className="w-5 h-5" />}
            label={t('light')}
            selected={theme === 'light'}
            onClick={() => handleThemeChange('light')}
          />
          <ThemeOption
            icon={<Moon className="w-5 h-5" />}
            label={t('dark')}
            selected={theme === 'dark'}
            onClick={() => handleThemeChange('dark')}
          />
          <ThemeOption
            icon={<Monitor className="w-5 h-5" />}
            label={t('auto')}
            selected={theme === 'auto'}
            onClick={() => handleThemeChange('auto')}
          />
        </div>
      </SettingsModal>

      <SettingsModal
        isOpen={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        title={`${t('language')} - ${t('settingsTitle')}`}
      >
        <div className="space-y-2">
          <LanguageOption
            label="Français"
            code="fr"
            flag="🇫🇷"
            selected={language === 'fr'}
            onClick={() => handleLanguageChange('fr')}
          />
          <LanguageOption
            label="English"
            code="en"
            flag="🇬🇧"
            selected={language === 'en'}
            onClick={() => handleLanguageChange('en')}
          />
          <LanguageOption
            label="العربية"
            code="ar"
            flag="🇸🇦"
            selected={language === 'ar'}
            onClick={() => handleLanguageChange('ar')}
          />
          <LanguageOption
            label="Türkçe"
            code="tr"
            flag="🇹🇷"
            selected={language === 'tr'}
            onClick={() => handleLanguageChange('tr')}
          />
        </div>
      </SettingsModal>

      <SettingsModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        title={t('helpSupport')}
      >
        <div className="space-y-4 text-text-secondary text-sm">
          <p>
            {language === 'fr' && 'Besoin d\'aide ? Voici quelques ressources utiles :'}
            {language === 'en' && 'Need help? Here are some useful resources:'}
            {language === 'ar' && 'هل تحتاج مساعدة؟ إليك بعض الموارد المفيدة:'}
            {language === 'tr' && 'Yardıma mı ihtiyacınız var? İşte bazı faydalı kaynaklar:'}
          </p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>{language === 'fr' ? 'Comment scanner un médicament' : language === 'en' ? 'How to scan a medication' : language === 'ar' ? 'كيفية مسح الدواء' : 'İlaç nasıl taranır'}</li>
            <li>{language === 'fr' ? 'Gérer vos rappels' : language === 'en' ? 'Manage your reminders' : language === 'ar' ? 'إدارة التذكيرات' : 'Hatırlatıcılarınızı yönetin'}</li>
            <li>{language === 'fr' ? 'Utiliser l\'assistant IA' : language === 'en' ? 'Use the AI assistant' : language === 'ar' ? 'استخدام المساعد الذكي' : 'Yapay zeka asistanını kullanın'}</li>
            <li>{language === 'fr' ? 'Problèmes de notifications' : language === 'en' ? 'Notification issues' : language === 'ar' ? 'مشاكل الإشعارات' : 'Bildirim sorunları'}</li>
          </ul>
          <p className="pt-4 text-text-primary font-semibold border-t border-glass-border/30">
            {language === 'fr' ? 'Contact :' : language === 'en' ? 'Contact:' : language === 'ar' ? 'التواصل:' : 'İletişim:'} support@medscan.cc
          </p>
          <div className="pt-2 flex justify-end">
            <a 
              href="/support" 
              target="_blank" 
              className="text-primary hover:underline font-semibold flex items-center gap-1 text-xs"
            >
              <span>{language === 'fr' ? 'Ouvrir le centre de support' : 'Open Support Center'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </SettingsModal>

      <SettingsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        title={t('terms')}
      >
        <div className="space-y-4 text-text-secondary text-sm max-h-96 overflow-y-auto">
          <p className="font-semibold text-text-primary">
            {language === 'fr' ? 'Dernière mise à jour : 16 janvier 2026' : language === 'en' ? 'Last updated: January 16, 2026' : language === 'ar' ? 'آخر تحديث: 16 يناير 2026' : 'Son güncelleme: 16 Ocak 2026'}
          </p>
          <div className="space-y-3">
            <p>
              <strong>{language === 'fr' ? '1. Acceptation des conditions' : language === 'en' ? '1. Acceptance of terms' : language === 'ar' ? '1. قبول الشروط' : '1. Şartların kabulü'}</strong><br />
              {t('termsAcceptMediScan')}
            </p>
            <p>
              <strong>{language === 'fr' ? '2. Utilisation de l\'application' : language === 'en' ? '2. Use of the application' : language === 'ar' ? '2. استخدام التطبيق' : '2. Uygulamanın kullanımı'}</strong><br />
              {language === 'fr' ? 'L\'application est destinée à un usage informatif uniquement. Elle ne remplace pas un avis médical professionnel.' : language === 'en' ? 'The application is for informational purposes only. It does not replace professional medical advice.' : language === 'ar' ? 'التطبيق مخصص للأغراض المعلوماتية فقط. لا يحل محل الاستشارة الطبية المهنية.' : 'Uygulama yalnızca bilgilendirme amaçlıdır. Profesyonel tıbbi tavsiyenin yerini almaz.'}
            </p>
            <p>
              <strong>{language === 'fr' ? '3. Responsabilité' : language === 'en' ? '3. Liability' : language === 'ar' ? '3. المسؤولية' : '3. Sorumluluk'}</strong><br />
              {language === 'fr' ? 'Nous ne sommes pas responsables des décisions médicales prises sur la base des informations fournies par l\'application.' : language === 'en' ? 'We are not responsible for medical decisions made based on information provided by the application.' : language === 'ar' ? 'نحن غير مسؤولين عن القرارات الطبية المتخذة بناءً على المعلومات المقدمة من التطبيق.' : 'Uygulama tarafından sağlanan bilgilere dayanarak alınan tıbbi kararlardan sorumlu değiliz.'}
            </p>
            <p>
              <strong>{language === 'fr' ? '4. Propriété intellectuelle' : language === 'en' ? '4. Intellectual property' : language === 'ar' ? '4. الملكية الفكرية' : '4. Fikri mülkiyet'}</strong><br />
              {language === 'fr' ? 'Tous les contenus de l\'application sont protégés par le droit d\'auteur.' : language === 'en' ? 'All content in the application is protected by copyright.' : language === 'ar' ? 'جميع محتويات التطبيق محمية بحقوق النشر.' : 'Uygulamadaki tüm içerik telif hakkıyla korunmaktadır.'}
            </p>
          </div>
        </div>
      </SettingsModal>

      <SettingsModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        title={t('privacyPolicy')}
      >
        <div className="space-y-4 text-text-secondary text-sm max-h-96 overflow-y-auto">
          <p className="font-semibold text-text-primary">
            {language === 'fr' ? 'Dernière mise à jour : 16 janvier 2026' : language === 'en' ? 'Last updated: January 16, 2026' : language === 'ar' ? 'آخر تحديث: 16 يناير 2026' : 'Son güncelleme: 16 Ocak 2026'}
          </p>
          <div className="space-y-3">
            <p>
              <strong>{language === 'fr' ? '1. Collecte de données' : language === 'en' ? '1. Data collection' : language === 'ar' ? '1. جمع البيانات' : '1. Veri toplama'}</strong><br />
              {language === 'fr' ? 'Nous collectons uniquement les données nécessaires au fonctionnement de l\'application (scans, rappels, historique).' : language === 'en' ? 'We only collect data necessary for the application to function (scans, reminders, history).' : language === 'ar' ? 'نجمع فقط البيانات الضرورية لعمل التطبيق (المسح، التذكيرات، السجل).' : 'Yalnızca uygulamanın çalışması için gerekli verileri topluyoruz (taramalar, hatırlatıcılar, geçmiş).'}
            </p>
            <p>
              <strong>{language === 'fr' ? '2. Utilisation des données' : language === 'en' ? '2. Use of data' : language === 'ar' ? '2. استخدام البيانات' : '2. Verilerin kullanımı'}</strong><br />
              {language === 'fr' ? 'Vos données sont utilisées uniquement pour vous fournir les services de l\'application.' : language === 'en' ? 'Your data is used only to provide you with the application\'s services.' : language === 'ar' ? 'تُستخدم بياناتك فقط لتزويدك بخدمات التطبيق.' : 'Verileriniz yalnızca size uygulama hizmetlerini sunmak için kullanılır.'}
            </p>
            <p>
              <strong>{language === 'fr' ? '3. Sécurité' : language === 'en' ? '3. Security' : language === 'ar' ? '3. الأمان' : '3. Güvenlik'}</strong><br />
              {language === 'fr' ? 'Vos données sont chiffrées et stockées de manière sécurisée.' : language === 'en' ? 'Your data is encrypted and stored securely.' : language === 'ar' ? 'بياناتك مشفرة ومخزنة بشكل آمن.' : 'Verileriniz şifrelenir ve güvenli bir şekilde saklanır.'}
            </p>
            <p>
              <strong>{language === 'fr' ? '4. Partage de données' : language === 'en' ? '4. Data sharing' : language === 'ar' ? '4. مشاركة البيانات' : '4. Veri paylaşımı'}</strong><br />
              {language === 'fr' ? 'Nous ne partageons pas vos données avec des tiers sans votre consentement.' : language === 'en' ? 'We do not share your data with third parties without your consent.' : language === 'ar' ? 'لا نشارك بياناتك مع أطراف ثالثة دون موافقتك.' : 'Verilerinizi onayınız olmadan üçüncü taraflarla paylaşmayız.'}
            </p>
            <p>
              <strong>{language === 'fr' ? '5. Vos droits' : language === 'en' ? '5. Your rights' : language === 'ar' ? '5. حقوقك' : '5. Haklarınız'}</strong><br />
              {language === 'fr' ? 'Vous pouvez à tout moment demander l\'accès, la modification ou la suppression de vos données.' : language === 'en' ? 'You can request access, modification or deletion of your data at any time.' : language === 'ar' ? 'يمكنك في أي وقت طلب الوصول إلى بياناتك أو تعديلها أو حذفها.' : 'Verilerinize erişim, değişiklik veya silme talebinde istediğiniz zaman bulunabilirsiniz.'}
            </p>
          </div>
          <div className="pt-3 border-t border-glass-border/30 flex justify-end">
            <a 
              href="/privacy" 
              target="_blank" 
              className="text-primary hover:underline font-semibold flex items-center gap-1 text-xs"
            >
              <span>{language === 'fr' ? 'Ouvrir la page complète' : 'Open Full Page'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </SettingsModal>
    </div>
  );
}

function SettingItem({ 
  icon, 
  label, 
  description,
  value,
  onClick
}: { 
  icon: React.ReactNode; 
  label: string; 
  description?: string;
  value?: string;
  onClick?: () => void;
}) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 hover:bg-background-secondary rounded-lg transition-colors"
    >
      <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm font-semibold text-text-primary">{label}</p>
        {description && (
          <p className="text-xs text-text-secondary mt-0.5">{description}</p>
        )}
      </div>
      {value ? (
        <span className="text-sm text-text-secondary">{value}</span>
      ) : (
        <ChevronRight className="w-5 h-5 text-text-secondary" />
      )}
    </button>
  );
}

function ThemeOption({
  icon,
  label,
  selected,
  onClick
}: {
  icon: React.ReactNode;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
        selected 
          ? 'border-primary bg-primary/10' 
          : 'border-border hover:border-primary/50'
      }`}
    >
      <div className="text-primary">{icon}</div>
      <span className="flex-1 text-left font-semibold text-text-primary">{label}</span>
      {selected && (
        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-white" />
        </div>
      )}
    </button>
  );
}

function LanguageOption({
  label,
  code,
  flag,
  selected,
  onClick
}: {
  label: string;
  code: string;
  flag: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
        selected 
          ? 'border-primary bg-primary/10' 
          : 'border-border hover:border-primary/50'
      }`}
    >
      <span className="text-lg font-bold">{flag}</span>
      <span className="flex-1 text-left font-semibold text-text-primary">{label}</span>
      {selected && (
        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-white" />
        </div>
      )}
    </button>
  );
}
