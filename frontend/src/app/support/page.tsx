'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowLeft, 
  HelpCircle, 
  Mail, 
  MessageSquare, 
  ShieldAlert, 
  Bell, 
  Camera, 
  Brain,
  ChevronDown,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// FAQ Items structure
interface FAQItem {
  question: { fr: string; en: string };
  answer: { fr: string; en: string };
  icon: React.ReactNode;
}

const FAQS: FAQItem[] = [
  {
    question: {
      fr: "Comment scanner correctement un médicament ?",
      en: "How do I scan a medication correctly?"
    },
    answer: {
      fr: "Placez le médicament à plat sur une surface bien éclairée. Cadrez l'étiquette ou la boîte contenant le nom du médicament dans l'appareil photo. Notre IA Google Gemini analysera l'image pour l'identifier de façon précise.",
      en: "Place the medication flat on a well-lit surface. Center the label or package containing the medication name in the camera view. Our Google Gemini AI will analyze the image to identify it accurately."
    },
    icon: <Camera className="w-5 h-5 text-primary" />
  },
  {
    question: {
      fr: "Les informations de l'assistant IA sont-elles fiables ?",
      en: "Is the AI assistant's information reliable?"
    },
    answer: {
      fr: "L'assistant MediScan est entraîné sur des données pharmaceutiques validées. Cependant, les réponses de l'IA sont données à titre purement informatif et ne remplacent en aucun cas l'avis de votre médecin ou de votre pharmacien.",
      en: "The MediScan assistant is trained on validated pharmaceutical data. However, the AI's answers are provided for informational purposes only and under no circumstances replace the advice of your doctor or pharmacist."
    },
    icon: <Brain className="w-5 h-5 text-primary" />
  },
  {
    question: {
      fr: "Pourquoi je ne reçois pas les rappels de médicaments ?",
      en: "Why am I not receiving medication reminders?"
    },
    answer: {
      fr: "Pour recevoir des notifications, assurez-vous d'avoir autorisé les notifications dans l'application et dans les réglages système de votre appareil. Sur iOS et Safari, veillez à installer l'application (PWA) sur votre écran d'accueil d'abord.",
      en: "To receive notifications, make sure you have allowed notifications in the app settings and in your device's system settings. On iOS and Safari, be sure to install the web app (PWA) to your home screen first."
    },
    icon: <Bell className="w-5 h-5 text-primary" />
  },
  {
    question: {
      fr: "Mes données personnelles sont-elles protégées ?",
      en: "Are my personal data protected?"
    },
    answer: {
      fr: "Oui, la confidentialité est notre priorité. Vos données sont chiffrées, isolées par compte utilisateur et stockées en toute sécurité avec Firebase. Nous ne vendons ni ne partageons jamais vos informations médicales à des tiers.",
      en: "Yes, privacy is our top priority. Your data is encrypted, isolated by user account, and stored securely with Firebase. We never sell or share your medical information with third parties."
    },
    icon: <ShieldAlert className="w-5 h-5 text-primary" />
  }
];

export default function SupportPage() {
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });

  const t = {
    title: lang === 'fr' ? 'Centre de Support' : 'Support Center',
    subtitle: lang === 'fr' ? 'Un compagnon pharmaceutique serein, intelligent et fiable à vos côtés' : 'A calm, intelligent, and trustworthy pharmaceutical companion by your side',
    backToApp: lang === 'fr' ? "Retour à l'application" : 'Back to App',
    searchPlaceholder: lang === 'fr' ? 'Rechercher une réponse...' : 'Search for an answer...',
    faqTitle: lang === 'fr' ? 'Questions Fréquentes' : 'Frequently Asked Questions',
    contactTitle: lang === 'fr' ? 'Besoin d\'une assistance directe ?' : 'Need direct support?',
    contactDesc: lang === 'fr' ? 'Notre équipe médicale et technique est là pour vous aider.' : 'Our medical and technical team is here to assist you.',
    sendEmail: lang === 'fr' ? 'Nous écrire par email' : 'Write to us by email',
    formName: lang === 'fr' ? 'Votre nom' : 'Your name',
    formEmail: lang === 'fr' ? 'Votre adresse email' : 'Your email address',
    formMsg: lang === 'fr' ? 'Votre message' : 'Your message',
    formSend: lang === 'fr' ? 'Envoyer le message' : 'Send message',
    formSuccess: lang === 'fr' ? 'Message envoyé avec succès ! Nous vous répondrons très rapidement.' : 'Message sent successfully! We will get back to you very shortly.',
    disclaimer: lang === 'fr' ? 'En cas d\'urgence médicale, veuillez contacter le 15 (en France) ou le numéro d\'urgence local immédiatement.' : 'In case of a medical emergency, please contact your local emergency services immediately.',
  };

  const filteredFaqs = FAQS.filter(faq => {
    const q = faq.question[lang].toLowerCase();
    const a = faq.answer[lang].toLowerCase();
    const query = searchQuery.toLowerCase();
    return q.includes(query) || a.includes(query);
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formState.name && formState.email && formState.message) {
      setContactSubmitted(true);
      setTimeout(() => {
        setContactSubmitted(false);
        setFormState({ name: '', email: '', message: '' });
      }, 5000);
    }
  };

  return (
    <div className="min-h-screen relative overflow-y-auto px-4 py-8 md:py-16 max-w-4xl mx-auto z-10">
      {/* Language toggle at top right */}
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

      {/* Main Card */}
      <div className="card backdrop-blur-glass p-6 md:p-12 mb-8 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-primary/15 rounded-full blur-xl pointer-events-none" />

        <div className="flex flex-col items-center text-center mb-12">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative mb-6"
          >
            <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-md animate-pulse" />
            <Image 
              src="/logo.png" 
              alt="MediScan Logo" 
              width={80} 
              height={80} 
              className="relative object-contain rounded-2xl"
              priority
            />
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text-primary dark:text-slate-100 font-poppins">
            MediScan <span className="text-primary font-normal">{t.title}</span>
          </h1>
          <p className="text-text-secondary dark:text-slate-300 mt-3 max-w-xl text-sm md:text-base leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-12 relative">
          <input 
            type="text" 
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => searchQuery(e.target.value)}
            className="w-full px-5 py-3.5 rounded-2xl bg-background-secondary/80 dark:bg-slate-900/60 border border-primary/20 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 text-text-primary dark:text-slate-100 transition-all shadow-sm"
          />
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="text-xl md:text-2xl font-bold text-text-primary dark:text-slate-100 mb-6 font-poppins flex items-center gap-2.5">
            <HelpCircle className="w-6 h-6 text-primary" />
            {t.faqTitle}
          </h2>

          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div 
                  key={index}
                  className="rounded-2xl border border-white/50 dark:border-slate-800/80 bg-background-secondary/40 dark:bg-slate-900/20 overflow-hidden transition-all duration-300 shadow-sm"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-4 md:p-5 text-left transition-colors hover:bg-primary-light/5"
                  >
                    <div className="flex items-center gap-3.5 pr-4">
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm">
                        {faq.icon}
                      </div>
                      <span className="font-semibold text-text-primary dark:text-slate-200 text-sm md:text-base leading-snug">
                        {faq.question[lang]}
                      </span>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-text-muted transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                      >
                        <div className="p-5 pt-0 border-t border-white/20 dark:border-slate-800/40 text-text-secondary dark:text-slate-350 text-sm leading-relaxed bg-white/20 dark:bg-slate-900/10">
                          {faq.answer[lang]}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {filteredFaqs.length === 0 && (
              <p className="text-center text-text-muted py-8">
                {lang === 'fr' ? 'Aucun résultat trouvé pour votre recherche.' : 'No results found for your search.'}
              </p>
            )}
          </div>
        </div>

        <hr className="border-t border-primary/10 dark:border-slate-800/80 my-10" />

        {/* Contact Form / Info */}
        <div className="grid md:grid-cols-5 gap-8 items-start">
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-text-primary dark:text-slate-100 font-poppins">
              {t.contactTitle}
            </h2>
            <p className="text-sm text-text-secondary dark:text-slate-300 leading-relaxed">
              {t.contactDesc}
            </p>
            
            <a 
              href="mailto:support@mediscan.app?subject=Support%20MediScan" 
              className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-primary text-white hover:bg-primary-dark transition-all duration-350 font-semibold shadow-button hover:shadow-card-hover text-sm"
            >
              <Mail className="w-4 h-4" />
              {t.sendEmail}
            </a>

            <div className="pt-2 flex flex-col gap-2">
              <span className="text-xs text-text-muted flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-badge-green rounded-full animate-ping" />
                {lang === 'fr' ? 'Assistance email disponible 7j/7' : 'Email support available 24/7'}
              </span>
              <span className="text-xs text-text-muted font-mono">support@mediscan.app</span>
            </div>
          </div>

          <div className="md:col-span-3 bg-background-secondary/30 dark:bg-slate-900/25 p-5 md:p-6 rounded-2xl border border-white/40 dark:border-slate-800/60 shadow-inner">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary dark:text-slate-300 uppercase tracking-wider mb-1.5">{t.formName}</label>
                <input 
                  type="text" 
                  required
                  value={formState.name}
                  onChange={(e) => setFormState({...formState, name: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-primary/10 dark:border-slate-700 text-text-primary dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm transition-all"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-text-secondary dark:text-slate-300 uppercase tracking-wider mb-1.5">{t.formEmail}</label>
                <input 
                  type="email" 
                  required
                  value={formState.email}
                  onChange={(e) => setFormState({...formState, email: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-primary/10 dark:border-slate-700 text-text-primary dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary dark:text-slate-300 uppercase tracking-wider mb-1.5">{t.formMsg}</label>
                <textarea 
                  required
                  rows={4}
                  value={formState.message}
                  onChange={(e) => setFormState({...formState, message: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-primary/10 dark:border-slate-700 text-text-primary dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm transition-all resize-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-primary/20 dark:border-slate-750 text-text-primary dark:text-slate-200 hover:bg-primary/10 hover:border-primary/40 transition-all duration-300 font-bold text-sm"
              >
                {t.formSend}
              </button>

              {contactSubmitted && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 bg-badge-greenBg text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-xl border border-badge-green/30 text-xs font-medium"
                >
                  {t.formSuccess}
                </motion.div>
              )}
            </form>
          </div>
        </div>

        {/* Emergency disclaimer */}
        <div className="mt-12 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 text-xs flex gap-3 items-start">
          <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">
            {t.disclaimer}
          </p>
        </div>
      </div>
      
      {/* Simple Footer */}
      <div className="text-center text-xs text-text-muted dark:text-slate-500 flex flex-col md:flex-row justify-between items-center gap-3">
        <span>© {new Date().getFullYear()} MediScan. All rights reserved.</span>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <a href="mailto:support@mediscan.app" className="hover:text-primary transition-colors">Contact</a>
        </div>
      </div>
    </div>
  );
}
