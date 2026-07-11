'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Lock, 
  Eye, 
  Trash2, 
  HelpCircle,
  Stethoscope,
  Globe
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function PrivacyPage() {
  const [lang, setLang] = useState<'fr' | 'en'>('fr');

  const t = {
    title: lang === 'fr' ? 'Politique de Confidentialité' : 'Privacy Policy',
    subtitle: lang === 'fr' ? 'Dernière mise à jour : 16 janvier 2026' : 'Last updated: January 16, 2026',
    backToApp: lang === 'fr' ? "Retour à l'application" : 'Back to App',
    introTitle: lang === 'fr' ? 'Engagement de Confidentialité' : 'Privacy Commitment',
    introText: lang === 'fr' ? 
      "Chez MedScan, votre santé et la confidentialité de vos données sont au cœur de notre démarche. Cette politique explique comment nous recueillons, utilisons, protégeons et gérons vos informations lors de l'utilisation de notre application mobile et web." :
      "At MedScan, your health and data privacy are at the heart of our mission. This policy explains how we collect, use, protect, and manage your information when you use our mobile and web application.",
    contactTitle: lang === 'fr' ? 'Une question sur vos données ?' : 'Any questions about your data?',
    contactDesc: lang === 'fr' ? 'Pour toute demande d\'accès, de modification ou de suppression de vos données, écrivez-nous.' : 'For any request regarding access, modification, or deletion of your data, contact us.',
    contactBtn: lang === 'fr' ? 'Nous contacter' : 'Contact Us',
  };

  const sections = [
    {
      title: lang === 'fr' ? "1. Collecte des données" : "1. Data Collection",
      icon: <Eye className="w-5 h-5 text-primary" />,
      content: lang === 'fr' ? (
        <div className="space-y-3">
          <p>Nous collectons uniquement les données strictement nécessaires au bon fonctionnement de l'application :</p>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li><strong>Données de scan :</strong> Les photos de médicaments que vous soumettez à l'IA Gemini.</li>
            <li><strong>Historique d'analyse :</strong> La liste des médicaments identifiés pour vous permettre d'y accéder hors-ligne.</li>
            <li><strong>Rappels de prise :</strong> Les horaires et configurations des notifications pour vos traitements.</li>
            <li><strong>Identifiants de compte :</strong> Votre adresse e-mail ou identifiant anonyme Firebase Auth.</li>
          </ul>
        </div>
      ) : (
        <div className="space-y-3">
          <p>We only collect data strictly necessary for the application to function correctly:</p>
          <ul className="list-disc list-inside space-y-1.5 ml-2">
            <li><strong>Scan Data:</strong> Photos of medications you submit to the Gemini AI.</li>
            <li><strong>Analysis History:</strong> The list of identified medications for offline access.</li>
            <li><strong>Reminders:</strong> Schedules and configurations of notifications for your treatments.</li>
            <li><strong>Account Identifiers:</strong> Your email address or Firebase Auth anonymous ID.</li>
          </ul>
        </div>
      )
    },
    {
      title: lang === 'fr' ? "2. Utilisation de vos données" : "2. How We Use Your Data",
      icon: <ShieldCheck className="w-5 h-5 text-primary" />,
      content: lang === 'fr' ? (
        <p>
          Vos données personnelles et médicales sont traitées exclusivement pour vous fournir les services de l'application (analyse de médicaments, alertes, historique). <strong>Nous ne vendons, n'échangeons, ni ne louons vos données personnelles ou de santé à des fins publicitaires ou à des tiers.</strong>
        </p>
      ) : (
        <p>
          Your personal and medical data are processed exclusively to provide you with the application services (medication analysis, alerts, history). <strong>We do not sell, trade, or rent your personal or health data for advertising purposes or to any third parties.</strong>
        </p>
      )
    },
    {
      title: lang === 'fr' ? "3. Sécurité et hébergement" : "3. Security & Storage",
      icon: <Lock className="w-5 h-5 text-primary" />,
      content: lang === 'fr' ? (
        <p>
          Toutes vos données sont chiffrées en transit et au repos. Nous utilisons l'infrastructure sécurisée de <strong>Google Cloud et Firebase</strong>. L'accès à vos données est strictement isolé par utilisateur à l'aide de règles de sécurité logicielles strictes (Firestore Rules).
        </p>
      ) : (
        <p>
          All your data is encrypted in transit and at rest. We use the secure infrastructure of <strong>Google Cloud and Firebase</strong>. Access to your data is strictly isolated per user using strict software security rules (Firestore Rules).
        </p>
      )
    },
    {
      title: lang === 'fr' ? "4. Vos Droits & Suppression" : "4. Your Rights & Deletion",
      icon: <Trash2 className="w-5 h-5 text-primary" />,
      content: lang === 'fr' ? (
        <p>
          Conformément au RGPD et aux réglementations sur la vie privée, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Vous pouvez supprimer l'intégralité de vos données d'analyse directement depuis l'écran de profil dans l'application, ou en supprimant votre compte utilisateur.
        </p>
      ) : (
        <p>
          In accordance with GDPR and privacy regulations, you have the right to access, rectify, and delete your data. You can delete all your analysis data directly from the profile screen in the app, or by deleting your user account.
        </p>
      )
    },
    {
      title: lang === 'fr' ? "5. Avertissement médical (Disclaimer)" : "5. Medical Disclaimer",
      icon: <Stethoscope className="w-5 h-5 text-primary" />,
      content: lang === 'fr' ? (
        <p>
          MedScan est un outil d'accompagnement et d'information pharmaceutique basé sur l'Intelligence Artificielle. Les analyses et suggestions ne constituent pas des diagnostics médicaux, des prescriptions ou des avis de professionnels de santé. Consultez toujours un médecin ou un pharmacien pour toute question d'ordre médical.
        </p>
      ) : (
        <p>
          MedScan is an educational and information companion tool based on Artificial Intelligence. Analyses and suggestions do not constitute medical diagnoses, prescriptions, or advice from healthcare professionals. Always consult a doctor or pharmacist for any medical questions.
        </p>
      )
    }
  ];

  return (
    <div className="min-h-screen relative overflow-y-auto px-4 py-8 md:py-16 max-w-4xl mx-auto z-10">
      {/* Header Controls */}
      <div className="flex justify-between items-center mb-10">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-white/40 dark:border-slate-700/40 text-text-primary dark:text-slate-100 hover:bg-primary-light/10 transition-colors shadow-sm text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.backToApp}</span>
        </Link>

        <button 
          onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-white/40 dark:border-slate-700/40 text-text-primary dark:text-slate-100 hover:bg-primary-light/10 transition-colors shadow-sm text-sm"
        >
          <Globe className="w-4 h-4 text-primary" />
          <span className="font-bold">{lang === 'fr' ? 'EN' : 'FR'}</span>
        </button>
      </div>

      {/* Main Privacy Card */}
      <div className="card backdrop-blur-glass p-6 md:p-12 mb-8 relative overflow-hidden">
        {/* Decor */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-40 h-40 bg-badge-greenBg/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center text-center mb-12">
          <div className="p-3 bg-primary/10 rounded-2xl mb-4 border border-primary/20">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text-primary dark:text-slate-100 font-poppins">
            {t.title}
          </h1>
          <p className="text-xs text-text-muted mt-2 font-mono uppercase tracking-wider">
            {t.subtitle}
          </p>
        </div>

        {/* Intro */}
        <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 mb-8 text-text-secondary dark:text-slate-350 text-sm md:text-base leading-relaxed">
          <h2 className="font-bold text-text-primary dark:text-slate-100 mb-2">{t.introTitle}</h2>
          <p>{t.introText}</p>
        </div>

        {/* Accordions / Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <motion.div 
              key={index}
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.08 }}
              className="p-5 md:p-6 rounded-2xl border border-white/50 dark:border-slate-800/80 bg-background-secondary/30 dark:bg-slate-900/10 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm">
                  {section.icon}
                </div>
                <h2 className="font-bold text-text-primary dark:text-slate-100 text-base md:text-lg font-poppins">
                  {section.title}
                </h2>
              </div>
              <div className="text-text-secondary dark:text-slate-300 text-sm leading-relaxed pl-1 md:pl-2">
                {section.content}
              </div>
            </motion.div>
          ))}
        </div>

        <hr className="border-t border-primary/10 dark:border-slate-800/80 my-10" />

        {/* Contact Block */}
        <div className="bg-background-secondary/50 dark:bg-slate-900/40 p-6 rounded-2xl border border-white/40 dark:border-slate-850 text-center max-w-lg mx-auto">
          <HelpCircle className="w-8 h-8 text-primary mx-auto mb-3" />
          <h3 className="font-bold text-text-primary dark:text-slate-100 font-poppins mb-1.5">
            {t.contactTitle}
          </h3>
          <p className="text-xs text-text-secondary dark:text-slate-350 leading-relaxed mb-4">
            {t.contactDesc}
          </p>
          <a 
            href="mailto:support@medscan.cc?subject=Privacy%20MedScan"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-primary/20 text-text-primary dark:text-slate-200 hover:bg-primary/5 transition-all text-xs font-bold shadow-sm"
          >
            {t.contactBtn}
          </a>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-text-muted dark:text-slate-500 flex flex-col md:flex-row justify-between items-center gap-3">
        <span>© {new Date().getFullYear()} MedScan. All rights reserved.</span>
        <div className="flex gap-4">
          <Link href="/support" className="hover:text-primary transition-colors">Support Center</Link>
          <a href="mailto:support@medscan.cc" className="hover:text-primary transition-colors">Contact</a>
        </div>
      </div>
    </div>
  );
}
