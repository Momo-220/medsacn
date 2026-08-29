'use client';

import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Globe, 
  ShieldCheck, 
  Activity, 
  Heart, 
  Search, 
  CheckCircle, 
  Users, 
  Star, 
  Sparkles,
  Menu,
  X,
  ArrowRight,
  ChevronDown,
  Info,
  AlertTriangle,
  RefreshCw,
  Bookmark,
  Brain,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';

const translationsLanding = {
  fr: {
    // Navigation
    features: "Fonctionnalités",
    demo: "Démo Interactive",
    reviews: "Avis",
    faq: "FAQ",
    launchApp: "Lancer l'Application",
    webVersion: "Version Web",
    accessWebVersion: "Accéder à la Version Web",
    
    // Hero
    heroTitle: "Scannez n'importe quel médicament.",
    heroTitleGradient: "Partout dans le monde.",
    heroSubtitle: "Une seule photo suffit pour comprendre son utilisation, sa posologie, ses précautions et bien plus encore.",
    soonAvailable: "Bientôt disponible",
    
    // Floating tags
    tagDosage: "Dosage",
    tagEffects: "Effets Secondaires",
    tagInteractions: "Interactions",
    tagPrecautions: "Précautions",
    tagActive: "Principe Actif",
    
    // Simulated phone preview steps
    step1Title: "1. Scannez l'emballage",
    step1Desc: "Cadrez simplement la boîte de médicament avec l'appareil photo. Notre technologie OCR de pointe analyse l'emballage sous tous ses angles.",
    step2Title: "2. Analyse Moléculaire",
    step2Desc: "L'IA MedScan décortique la composition, identifie le principe actif principal (comme le paracétamol), et vérifie son dosage précis.",
    step3Title: "3. Traduction Médicale",
    step3Desc: "Une notice à l'étranger ? MedScan traduit instantanément les précautions d'emploi et la posologie dans votre langue natale de façon ultra-simplifiée.",
    step4Title: "4. Contrôle de Sécurité",
    step4Desc: "L'application compare le scan avec votre historique pour détecter d'éventuels risques de double dosage ou d'interactions dangereuses.",
    
    // Features Section
    featuresSub: "Fonctionnalités intelligentes",
    featuresTitle: "Une assistance complète dans votre poche",
    feat1Title: "Scan Intelligent",
    feat1Desc: "Pointez simplement l'appareil photo vers la boîte de médicaments. MedScan détecte le nom et la posologie automatiquement.",
    feat2Title: "Traduction Simplifiée",
    feat2Desc: "Idéal pour les voyages. Traduit les contre-indications, les précautions d'emploi et les posologies dans 4 langues.",
    feat3Title: "Prévention Posologie",
    feat3Desc: "Évitez les risques de double-dosage accidentels en enregistrant vos scans et en recevant des alertes d'interactions médicamenteuses.",
    feat4Title: "Assistant IA Santé",
    feat4Desc: "Posez vos questions sur la prise d'un traitement à notre assistant IA de santé sécurisé et obtenez des réponses explicatives instantanées.",
    
    // How it works section
    howItWorksSub: "COMMENT FONCTIONNE MEDSCAN",
    howItWorksTitle: "Comprendre vos médicaments n'a jamais été aussi simple.",
    howItWorksDesc: "Prenez une photo. MedScan vous explique tout ce que vous devez savoir en un instant.",
    stepCard1Title: "Scannez votre médicament",
    stepCard1Desc: "Pointez simplement votre appareil photo vers la boîte de médicaments ou la plaquette.",
    stepCard2Title: "L'IA analyse instantanément",
    stepCard2Desc: "MedScan identifie le médicament et extrait les informations clés en quelques secondes.",
    stepCard3Title: "Lisez dans votre langue",
    stepCard3Desc: "Traduisez les notices médicales complexes en langage clair et simple (4 langues supportées).",
    stepCard4Title: "Prenez en toute sécurité",
    stepCard4Desc: "Recevez des alertes personnalisées de posologie, d'interactions et de contre-indications.",
    
    // Testimonials
    testimonialsSub: "Avis Utilisateurs",
    testimonialsTitle: "Ils sécurisent leur santé avec MedScan",
    
    // FAQ
    faqSub: "Des réponses à vos questions",
    faqTitle: "Questions Fréquentes",
    faqQ1: "Comment fonctionne le scan de boîte ?",
    faqA1: "Pointez simplement l'appareil photo de l'application mobile vers l'emballage. Notre système détecte instantanément le texte, identifie le nom de marque, le dosage et la molécule active, puis compare ces données avec nos bases officielles pour générer une fiche simplifiée.",
    faqQ2: "Mes données de santé sont-elles sécurisées ?",
    faqA2: "Oui, totalement. Vos scans et votre historique sont enregistrés de façon sécurisée. MedScan respecte scrupuleusement la confidentialité de vos données et n'envoie aucune information médicale nominative à des tiers.",
    faqQ3: "L'application remplace-t-elle un avis médical ?",
    faqA3: "Absolument pas. MedScan est un outil informatif d'accompagnement visant à simplifier la compréhension des notices et prévenir les erreurs de base. En cas de doute, d'effet indésirable ou d'urgence médicale, vous devez impérativement consulter un médecin ou un pharmacien.",
    faqQ4: "L'application fonctionne-t-elle hors-ligne ?",
    faqA4: "Oui. Une fois qu'un médicament a été scanné, sa fiche simplifiée est stockée localement dans l'historique de votre application. Vous pouvez y accéder et relire les détails à tout moment, même sans connexion réseau active (dans un avion ou à l'étranger sans données mobiles).",
    
    // Footer banner
    bannerTitle: "Prenez soin de votre santé dès aujourd'hui",
    bannerDesc: "Téléchargez gratuitement l'application MedScan et simplifiez l'utilisation de vos médicaments en un clin d'œil.",
    
    // Footer description
    footerDesc: "MedScan est un outil informatif intelligent facilitant l'accès à l'information pharmaceutique grâce à la vision par ordinateur et à l'intelligence artificielle.",
    rightsReserved: "© 2026 MedScan Inc. Tous droits réservés.",
    footerNavTitle: "Navigation",
    footerInfoTitle: "Informations",
    privacyPolicy: "Politique de Confidentialité",
    supportCenter: "Centre d'aide & Support",
    disclaimer: "Avis Médical de non-responsabilité",
    
    // Mockup texts
    mockupAlign: "Aligner le texte",
    mockupScanning: "Analyse visuelle en cours...",
    mockupActiveAnalysis: "Analyse Active",
    mockupReliability: "Fiabilité 98%",
    mockupDetectedMolecule: "Molécule Détectée",
    mockupParacetamol: "Paracétamol",
    mockupClassification: "Classification",
    mockupClassDesc: "Antalgique / Antipyrétique (soulagement de la douleur et fièvre)",
    mockupDosageInfo: "Dosage standard : 500mg à 1000mg par prise. Maximum 4g par jour.",
    mockupValidate: "Valider & Continuer",
    mockupTranslation: "Traduction",
    mockupOriginalText: "Texte Original (Espagnol)",
    mockupTranslatedText: "Ne dépassez pas la dose maximale de 4 grammes par jour. À avaler avec un grand verre d'eau.",
    mockupOriginalSpanish: "No exceder la dosis recomendada de 4 gramos al día. Tomar con agua.",
    mockupSafety: "Sécurité",
    mockupRiskDetected: "Risque Détecté",
    mockupDoubleDosage: "Alerte Double Dosage",
    mockupDoubleDosageDesc: "Vous avez déjà scanné du Doliprane il y a 2 heures.",
    mockupRecommendation: "Recommandation",
    mockupRecommendationDesc: "Attendez au moins 4 heures entre chaque prise de Paracétamol pour éviter tout surdosage hépatique.",
    mockupSaveProfile: "Enregistrer dans mon profil"
  },
  en: {
    features: "Features",
    demo: "Interactive Demo",
    reviews: "Reviews",
    faq: "FAQ",
    launchApp: "Launch Application",
    webVersion: "Web Version",
    accessWebVersion: "Access Web Version",
    heroTitle: "Scan any medication.",
    heroTitleGradient: "Anywhere in the world.",
    heroSubtitle: "A single photo is enough to understand its use, dosage, precautions and much more.",
    soonAvailable: "Soon available",
    tagDosage: "Dosage",
    tagEffects: "Side Effects",
    tagInteractions: "Interactions",
    tagPrecautions: "Precautions",
    tagActive: "Active Ingredient",
    step1Title: "1. Scan the package",
    step1Desc: "Simply frame the medicine box with the camera. Our state-of-the-art OCR technology analyzes the packaging from all angles.",
    step2Title: "2. Molecular Analysis",
    step2Desc: "The MedScan AI breaks down the composition, identifies the main active ingredient (like paracetamol), and verifies its precise dosage.",
    step3Title: "3. Medical Translation",
    step3Desc: "A leaflet from abroad? MedScan instantly translates the instructions for use and dosage into your native language in an ultra-simplified way.",
    step4Title: "4. Safety Check",
    step4Desc: "The app compares the scan with your history to detect any risk of double dosing or dangerous interactions.",
    featuresSub: "Smart Features",
    featuresTitle: "Comprehensive support in your pocket",
    feat1Title: "Smart Scan",
    feat1Desc: "Simply point the camera at the medicine box. MedScan detects the name and dosage automatically.",
    feat2Title: "Simplified Translation",
    feat2Desc: "Ideal for travel. Translates contraindications, precautions and dosages into 4 languages.",
    feat3Title: "Dosage Prevention",
    feat3Desc: "Avoid accidental double-dosing risks by logging your scans and receiving interaction alerts.",
    feat4Title: "AI Health Assistant",
    feat4Desc: "Ask questions about your treatment to our secure AI health assistant and get instant explanatory answers.",
    howItWorksSub: "HOW MEDSCAN WORKS",
    howItWorksTitle: "Understanding your medications has never been easier.",
    howItWorksDesc: "Take a photo. MedScan explains everything you need to know in an instant.",
    stepCard1Title: "Scan your medication",
    stepCard1Desc: "Simply point your camera at the medicine box or blister pack.",
    stepCard2Title: "AI analyzes instantly",
    stepCard2Desc: "MedScan identifies the medication and extracts key information in seconds.",
    stepCard3Title: "Read in your language",
    stepCard3Desc: "Translate complex medical leaflets into plain and simple language (4 languages supported).",
    stepCard4Title: "Take safely",
    stepCard4Desc: "Get personalized dosage, interaction, and contraindication alerts.",
    testimonialsSub: "User Reviews",
    testimonialsTitle: "They secure their health with MedScan",
    faqSub: "Answers to your questions",
    faqTitle: "Frequently Asked Questions",
    faqQ1: "How does the box scan work?",
    faqA1: "Simply point the mobile app camera at the packaging. Our system instantly detects the text, identifies the brand name, dosage, and active molecule, then compares this data with official databases to generate a simplified sheet.",
    faqQ2: "Is my health data secure?",
    faqA2: "Yes, completely. Your scans and history are saved securely. MedScan strictly respects the confidentiality of your data and never sends personal medical information to third parties.",
    faqQ3: "Does the app replace medical advice?",
    faqA3: "Absolutely not. MedScan is an informative companion tool designed to simplify understanding of leaflets and prevent basic errors. In case of doubt, side effects, or medical emergency, you must consult a doctor or pharmacist.",
    faqQ4: "Does the app work offline?",
    faqA4: "Yes. Once a medication is scanned, its simplified sheet is stored locally in your app history. You can access it and reread details anytime, even without an active internet connection (in an airplane or abroad without mobile data).",
    bannerTitle: "Take care of your health today",
    bannerDesc: "Download the MedScan app for free and simplify your medication use in the blink of an eye.",
    footerDesc: "MedScan is an intelligent informational tool that facilitates access to pharmaceutical information using computer vision and artificial intelligence.",
    rightsReserved: "© 2026 MedScan Inc. All rights reserved.",
    footerNavTitle: "Navigation",
    footerInfoTitle: "Information",
    privacyPolicy: "Privacy Policy",
    supportCenter: "Help Center & Support",
    disclaimer: "Medical Disclaimer",
    
    // Mockup texts
    mockupAlign: "Align text",
    mockupScanning: "Visual analysis in progress...",
    mockupActiveAnalysis: "Active Analysis",
    mockupReliability: "98% Reliability",
    mockupDetectedMolecule: "Detected Molecule",
    mockupParacetamol: "Paracetamol",
    mockupClassification: "Classification",
    mockupClassDesc: "Analgesic / Antipyretic (pain and fever relief)",
    mockupDosageInfo: "Standard dosage: 500mg to 1000mg per dose. Maximum 4g per day.",
    mockupValidate: "Validate & Continue",
    mockupTranslation: "Translation",
    mockupOriginalText: "Original Text (Spanish)",
    mockupTranslatedText: "Do not exceed the maximum dose of 4 grams per day. Swallow with a large glass of water.",
    mockupOriginalSpanish: "No exceder la dosis recomendada de 4 gramos al día. Tomar con agua.",
    mockupSafety: "Safety",
    mockupRiskDetected: "Risk Detected",
    mockupDoubleDosage: "Double Dosage Alert",
    mockupDoubleDosageDesc: "You already scanned Doliprane 2 hours ago.",
    mockupRecommendation: "Recommendation",
    mockupRecommendationDesc: "Wait at least 4 hours between each Paracetamol intake to avoid hepatic overdose.",
    mockupSaveProfile: "Save in my profile"
  },
  ar: {
    features: "المميزات",
    demo: "عرض تفاعلي",
    reviews: "الآراء",
    faq: "الأسئلة الشائعة",
    launchApp: "تشغيل التطبيق",
    webVersion: "نسخة الويب",
    accessWebVersion: "الدخول إلى نسخة الويب",
    heroTitle: "امسح أي دواء ضوئيًا.",
    heroTitleGradient: "في أي مكان في العالم.",
    heroSubtitle: "صورة واحدة تكفي لفهم طريقة الاستخدام، الجرعة، الاحتياطات وأكثر من ذلك بكثير.",
    soonAvailable: "قريباً",
    tagDosage: "الجرعة",
    tagEffects: "الأعراض الجانبية",
    tagInteractions: "التفاعلات",
    tagPrecautions: "الاحتياطات",
    tagActive: "المادة الفعالة",
    step1Title: "١. امسح العبوة",
    step1Desc: "ما عليك سوى تأطير علبة الدواء باستخدام الكاميرا. تقوم تقنية التعرف الضوئي على الحروف المتطورة لدينا بتحليل العبوة من جميع الزوايا.",
    step2Title: "٢. التحليل الجزيئي",
    step2Desc: "يقوم ذكاء MedScan الاصطناعي بتفكيك التركيبة وتحديد المادة الفعالة الرئيسية (مثل الباراسيتامول) والتحقق من جرعتها الدقيقة.",
    step3Title: "٣. الترجمة الطبية",
    step3Desc: "نشرة طبية بلغة أجنبية؟ يترجم MedScan على الفور إرشادات الاستخدام والجرعة إلى لغتك الأم بطريقة مبسطة للغاية.",
    step4Title: "٤. فحص الأمان",
    step4Desc: "يقارن التطبيق المسح الضوئي بسجلك لاكتشاف أي خطر لتكرار الجرعة أو حدوث تفاعلات دوائية خطيرة.",
    featuresSub: "ميزات ذكية",
    featuresTitle: "مساعدة شاملة في جيبك",
    feat1Title: "المسح الذكي",
    feat1Desc: "ما عليك سوى توجيه الكاميرا إلى علبة الدواء. يكتشف MedScan الاسم والجرعة تلقائيًا.",
    feat2Title: "ترجمة مبسطة",
    feat2Desc: "مثالي للسفر. يترجم موانع الاستعمال والاحتياطات والجرعات إلى 4 لغات.",
    feat3Title: "الوقاية من الجرعة الزائدة",
    feat3Desc: "تجنب مخاطر مضاعفة الجرعة العرضية عن طريق تسجيل عمليات المسح وتلقي تنبيهات التفاعل.",
    feat4Title: "مساعد صحي ذكي",
    feat4Desc: "اطرح أسئلة حول علاجك على مساعدنا الصحي الذكي والآمن واحصل على إجابات توضيحية فورية.",
    howItWorksSub: "كيف يعمل MEDSCAN",
    howItWorksTitle: "فهم أدويتك لم يكن بهذه السهولة من قبل.",
    howItWorksDesc: "التقط صورة. يشرح لك MedScan كل ما تحتاج لمعرفته في لحظة.",
    stepCard1Title: "امسح دواءك ضوئياً",
    stepCard1Desc: "ما عليك سوى توجيه الكاميرا إلى علبة الدواء أو شريط الأقراص.",
    stepCard2Title: "تحليل فوري بالذكاء الاصطناعي",
    stepCard2Desc: "يتعرف MedScan على الدواء ويستخرج المعلومات الأساسية في ثوانٍ معدودة.",
    stepCard3Title: "اقرأ بلغتك الخاصة",
    stepCard3Desc: "ترجمة النشرات الطبية المعقدة إلى لغة واضحة وبسيطة (يدعم 4 لغات).",
    stepCard4Title: "تناول دواءك بأمان",
    stepCard4Desc: "احصل على تنبيهات مخصصة حول الجرعة، والتفاعلات، وموانع الاستعمال.",
    testimonialsSub: "آراء المستخدمين",
    testimonialsTitle: "يحافظون على صحتهم مع MedScan",
    faqSub: "إجابات على أسئلتك",
    faqTitle: "الأسئلة الشائعة",
    faqQ1: "كيف يعمل مسح العلبة ضوئياً؟",
    faqA1: "ما عليك سوى توجيه كاميرا تطبيق الهاتف نحو العبوة. يكتشف نظامنا النص على الفور، ويتعرف على الاسم التجاري والجرعة والمادة الفعالة، ثم يقارن هذه البيانات بقواعد البيانات الرسمية لإنشاء نشرة مبسطة.",
    faqQ2: "هل بياناتي الصحية آمنة؟",
    faqA2: "نعم، تماماً. يتم حفظ عمليات المسح وسجلك بشكل آمن. يحترم MedScan سرية بياناتك بدقة ولا يرسل معلومات طبية شخصية إلى أي طرف ثالث.",
    faqQ3: "هل يغني التطبيق عن الاستشارة الطبية؟",
    faqA3: "بالتأكيد لا. MedScan هو أداة إرشادية وتثقيفية تهدف إلى تبسيط فهم النشرات الطبية وتجنب الأخطاء الأساسية. في حال الشك أو ظهور أعراض جانبية أو حدوث طارئ طبي، يجب استشارة الطبيب أو الصيدلي فوراً.",
    faqQ4: "هل يعمل التطبيق بدون إنترنت؟",
    faqA4: "نعم. بمجرد مسح الدواء، يتم تخزين نشرته المبسطة محلياً في سجل التطبيق. يمكنك الوصول إليها وقراءة التفاصيل في أي وقت، حتى بدون اتصال بالإنترنت (في الطائرة أو في الخارج دون بيانات خلوية).",
    bannerTitle: "اعتني بصحتك اليوم",
    bannerDesc: "قم بتحميل تطبيق MedScan مجاناً ووفر لنفسك الأمان عند استخدام الأدوية في غمضة عين.",
    footerDesc: "MedScan هو أداة معلوماتية ذكية تسهل الوصول إلى المعلومات الدوائية باستخدام رؤية الكمبيوتر والذكاء الاصطناعي.",
    rightsReserved: "© 2026 MedScan جميع الحقوق محفوظة.",
    footerNavTitle: "روابط سريعة",
    footerInfoTitle: "معلومات قانونية",
    privacyPolicy: "سياسة الخصوصية",
    supportCenter: "مركز المساعدة والدعم",
    disclaimer: "إخلاء المسؤولية الطبي",
    
    // Mockup texts
    mockupAlign: "محاذاة النص",
    mockupScanning: "تحليل بصري جارٍ...",
    mockupActiveAnalysis: "التحليل النشط",
    mockupReliability: "الموثوقية ٩٨٪",
    mockupDetectedMolecule: "الجزيء المكتشف",
    mockupParacetamol: "باراسيتامول",
    mockupClassification: "التصنيف",
    mockupClassDesc: "مسكن للألم / خافض للحرارة (تخفيف الآلام والحمى)",
    mockupDosageInfo: "الجرعة القياسية: 500 ملغ إلى 1000 ملغ لكل جرعة. الحد الأقصى 4 غرام يوميًا.",
    mockupValidate: "تأكيد ومتابعة",
    mockupTranslation: "الترجمة",
    mockupOriginalText: "النص الأصلي (الإسبانية)",
    mockupTranslatedText: "لا تتجاوز الجرعة القصوى البالغة 4 غرامات يوميًا. يبتلع مع كوب كبير من الماء.",
    mockupOriginalSpanish: "No exceder la dosis recomendada de 4 gramos al día. Tomar con agua.",
    mockupSafety: "الأمان",
    mockupRiskDetected: "تم اكتشاف خطر",
    mockupDoubleDosage: "تنبيه الجرعة المزدوجة",
    mockupDoubleDosageDesc: "لقد قمت بالفعل بمسح دوليبران قبل ساعتين.",
    mockupRecommendation: "توصية",
    mockupRecommendationDesc: "انتظر 4 ساعات على الأقل بين كل جرعة باراسيتامول لتجنب زيادة الجرعة الكبدية.",
    mockupSaveProfile: "حفظ في ملفي الشخصي"
  },
  tr: {
    features: "Özellikler",
    demo: "İnteraktif Demo",
    reviews: "Yorumlar",
    faq: "SSS",
    launchApp: "Uygulamayı Başlat",
    webVersion: "Web Sürümü",
    accessWebVersion: "Web Sürümüne Eriş",
    heroTitle: "Herhangi bir ilacı tarayın.",
    heroTitleGradient: "Dünyanın her yerinde.",
    heroSubtitle: "Kullanımını, dozajını, önlemlerini ve çok daha fazlasını anlamak için tek bir fotoğraf yeterlidir.",
    soonAvailable: "Yakında",
    tagDosage: "Dozaj",
    tagEffects: "Yan Etkiler",
    tagInteractions: "Etkileşimler",
    tagPrecautions: "Önlemler",
    tagActive: "Etkin Madde",
    step1Title: "1. Ambalajı tarayın",
    step1Desc: "İlaç kutusunu kamerayla çerçevelemeniz yeterlidir. En son teknoloji ürünü OCR teknolojimiz ambalajı tüm açılardan analiz eder.",
    step2Title: "2. Moleküler Analiz",
    step2Desc: "MedScan yapay zekası bileşimi analiz eder, ana etkin maddeyi (parasetamol gibi) tanımlar ve kesin dozajını doğrular.",
    step3Title: "3. Tıbbi Çeviri",
    step3Desc: "Yabancı bir prospektüs mü? MedScan, kullanım talimatlarını ve dozajı ana dilinize anında ve son derece basitleştirilmiş bir şekilde çevirir.",
    step4Title: "4. Güvenlik Kontrolü",
    step4Desc: "Uygulama, çift dozlama veya tehlikeli etkileşim risklerini tespit etmek için taramayı geçmişinizle karşılaştırır.",
    featuresSub: "Akıllı Özellikler",
    featuresTitle: "Cebinizde kapsamlı destek",
    feat1Title: "Akıllı Tarama",
    feat1Desc: "Kamerayı ilaç kutusuna doğrultmanız yeterlidir. MedScan ismi ve dozajı otomatik olarak algılar.",
    feat2Title: "Basitleştirilmiş Çeviri",
    feat2Desc: "Seyahatler için idealdir. Yan etkileri, önlemleri ve dozajları 4 dile çevirir.",
    feat3Title: "Doz Aşımı Önleme",
    feat3Desc: "Taramalarınızı kaydederek ve etkileşim uyarıları alarak kazara çift doz risklerini önleyin.",
    feat4Title: "Yapay Zeka Sağlık Asistanı",
    feat4Desc: "Tedaviniz hakkındaki sorularınızı güvenli yapay zeka sağlık asistanımıza sorun ve anında açıklayıcı yanıtlar alın.",
    howItWorksSub: "MEDSCAN NASIL ÇALIŞIR",
    howItWorksTitle: "İlaçlarınızı anlamak hiç bu kadar kolay olmamıştı.",
    howItWorksDesc: "Fotoğraf çekin. MedScan bilmeniz gereken her şeyi bir anda açıklasın.",
    stepCard1Title: "İlacınızı tarayın",
    stepCard1Desc: "Kameranızı ilaç kutusuna veya blister ambalaja doğrultmanız yeterlidir.",
    stepCard2Title: "Yapay Zeka anında analiz eder",
    stepCard2Desc: "MedScan ilacı tanımlar ve saniyeler içinde temel bilgileri ayıklar.",
    stepCard3Title: "Kendi dilinizde okuyun",
    stepCard3Desc: "Karmaşık tıbbi prospektüsleri anlaşılır ve basit bir dile çevirin (4 dil desteklenir).",
    stepCard4Title: "Güvenle kullanın",
    stepCard4Desc: "Kişiselleştirilmiş dozaj, etkileşim ve kontrendikasyon uyarıları alın.",
    testimonialsSub: "Kullanıcı Yorumları",
    testimonialsTitle: "Sağlıklarını MedScan ile güvenceye alıyorlar",
    faqSub: "Sorularınızın yanıtları",
    faqTitle: "Sıkça Sorulan Sorular",
    faqQ1: "Kutu tarama işlemi nasıl çalışır?",
    faqA1: "Mobil uygulama kamerasını ambalaja doğrultmanız yeterlidir. Sistemimiz metni anında algılar, marka adını, dozajı ve aktif molekülü tanımlar, ardından basitleştirilmiş bir rapor oluşturmak için bu verileri resmi veritabanlarıyla karşılaştırır.",
    faqQ2: "Sağlık verilerim güvende mi?",
    faqA2: "Evet, tamamen. Taramalarınız ve geçmişiniz güvenli bir şekilde kaydedilir. MedScan, verilerinizin gizliliğine kesinlikle saygı duyar ve kişisel tıbbi bilgileri asla üçüncü taraflarla paylaşmaz.",
    faqQ3: "Uygulama tıbbi tavsiye yerine geçer mi?",
    faqA3: "Kesinlikle hayır. MedScan, prospektüslerin anlaşılmasını kolaylaştırmayı ve temel hataları önlemeyi amaçlayan bilgilendirici bir yardımcı araçtır. Şüphe duyulması, yan etki görülmesi veya tıbbi acil durumlarda mutlaka bir hekime veya eczacıya danışmalısınız.",
    faqQ4: "Uygulama çevrimdışı çalışıyor mu?",
    faqA4: "Evet. Bir ilaç tarandıktan sonra, basitleştirilmiş raporu yerel olarak geçmişinizde saklanır. Uçakta veya mobil veri olmadan yurt dışındaysanız bile detaylara istediğiniz zaman erişebilirsiniz.",
    bannerTitle: "Bugün sağlığınıza özen gösterin",
    bannerDesc: "MedScan uygulamasını ücretsiz indirin ve ilaç kullanımınızı göz açıp kapayıncaya kadar kolaylaştırın.",
    footerDesc: "MedScan, bilgisayarlı görü ve yapay zeka kullanarak ilaç bilgilerine erişimi kolaylaştıran akıllı bir bilgilendirme aracıdır.",
    rightsReserved: "© 2026 MedScan Inc. Tüm hakları saklıdır.",
    footerNavTitle: "Gezinti",
    footerInfoTitle: "Bilgi",
    privacyPolicy: "Gizlilik Politikası",
    supportCenter: "Yardım Merkezi ve Destek",
    disclaimer: "Tıbbi Sorumluluk Reddi",
    
    // Mockup texts
    mockupAlign: "Metni hizala",
    mockupScanning: "Görsel analiz yapılıyor...",
    mockupActiveAnalysis: "Aktif Analiz",
    mockupReliability: "%98 Güvenilirlik",
    mockupDetectedMolecule: "Algılanan Molekül",
    mockupParacetamol: "Parasetamol",
    mockupClassification: "Sınıflandırma",
    mockupClassDesc: "Analjezik / Antipiretik (ağrı ve ateş giderici)",
    mockupDosageInfo: "Standart doz: Alım başına 500mg ila 1000mg. Günlük maksimum 4g.",
    mockupValidate: "Doğrula ve Devam Et",
    mockupTranslation: "Çeviri",
    mockupOriginalText: "Orijinal Metin (İspanyolca)",
    mockupTranslatedText: "Günde maksimum 4 gram dozu aşmayın. Büyük bir bardak su ile yutunuz.",
    mockupOriginalSpanish: "No exceder la dosis recomendada de 4 gramos al día. Tomar con agua.",
    mockupSafety: "Güvenlik",
    mockupRiskDetected: "Risk Algılandı",
    mockupDoubleDosage: "Çift Doz Uyarısı",
    mockupDoubleDosageDesc: "2 saat önce Doliprane taradınız.",
    mockupRecommendation: "Öneri",
    mockupRecommendationDesc: "Karaciğer aşırı dozunu önlemek için her Parasetamol alımı arasında en az 4 saat bekleyin.",
    mockupSaveProfile: "Profilime kaydet"
  }
};

const testimonialsRow1 = [
  {
    initials: "SM",
    name: "Sarah Martin",
    role: "Maman de 2 enfants",
    text: "Voyager à l'étranger avec mes enfants était stressant pour l'achat de médicaments. MedScan m'a permis de scanner les boîtes locales en Italie et d'avoir la traduction exacte des composants. Indispensable !"
  },
  {
    initials: "TL",
    name: "Thomas L.",
    role: "Patient",
    text: "Ideal for deciphering scribbled prescriptions or warnings written in a tiny font."
  },
  {
    initials: "AM",
    name: "Amel G.",
    role: "Anne",
    text: "Tarama çok hızlı ve doğru, gece loş ışıkta bile harika çalışıyor."
  },
  {
    initials: "LB",
    name: "Lucas B.",
    role: "Étudiant",
    text: "J'adore l'assistant IA de santé. Ses réponses et explications sur le paracétamol sont claires et très rassurantes."
  },
  {
    initials: "CD",
    name: "Clara D.",
    role: "مسافرة",
    text: "وداعًا للقلق أمام النشرات الطبية المكتوبة بلغات أجنبية أثناء السفر."
  },
  {
    initials: "JG",
    name: "Jean-Pierre G.",
    role: "Retraité",
    text: "Très utile pour suivre mon traitement quotidien sans oubli grâce aux rappels réguliers."
  },
  {
    initials: "MH",
    name: "Maxime H.",
    role: "Patient",
    text: "The interaction alert prevented me from mixing two incompatible molecules prescribed by different doctors."
  },
  {
    initials: "SP",
    name: "Sophie P.",
    role: "Tasarımcı",
    text: "Çok akıcı bir arayüz, harika mikro animasyonlar. Bu uygulamayı kullanmak bir zevk."
  },
  {
    initials: "ET",
    name: "د. إميلي ت.",
    role: "طبيبة عامة",
    text: "أخيرًا أداة رقمية تبسط النشرات الطبية وتساعد في تجنب أخطاء التناول الذاتي للدواء."
  },
  {
    initials: "YK",
    name: "Youssef K.",
    role: "Actif",
    text: "Le système de rappel par notification sur mon téléphone fonctionne parfaitement pour mon traitement quotidien."
  },
  {
    initials: "NM",
    name: "Nathalie M.",
    role: "Family caregiver",
    text: "I use it to verify the medication boxes of my elderly parents. It saves me from a lot of stress."
  },
  {
    initials: "AS",
    name: "Antoine S.",
    role: "Expatrié",
    text: "Indispensable pour traduire les notices des médicaments achetés au Japon où j'habite actuellement."
  },
  {
    initials: "MF",
    name: "مارين ف.",
    role: "مريضة",
    text: "استطاع الذكاء الاصطناعي أن يشرح لي بدقة الأعراض الجانبية المحتملة لعلاجي دون مصطلحات معقدة."
  }
];

const testimonialsRow2 = [
  {
    initials: "DK",
    name: "David K.",
    role: "Pharmacist",
    text: "As a pharmacist, I often advise patients who travel. MedScan helps them understand leaflets directly on their mobile."
  },
  {
    initials: "LN",
    name: "لوسي ن.",
    role: "طالبة تمريض",
    text: "المساعد الطبي بالذكاء الاصطناعي رائع حقًا. يجيب بطريقة بسيطة ومطمئنة على أسئلة التفاعلات."
  },
  {
    initials: "PV",
    name: "Pierre V.",
    role: "Emekli",
    text: "Günlük yaşamda çok pratik ve güven verici. İlaç kutusu biraz buruşmuş olsa bile OCR taraması çalışıyor."
  },
  {
    initials: "LB",
    name: "Laurent B.",
    role: "Pharmacien",
    text: "Une vraie révolution pour la sécurité de l'automédication à domicile. Bravo à l'équipe !"
  },
  {
    initials: "JA",
    name: "Julie A.",
    role: "Nurse",
    text: "The automatic detection of active molecules and dosages is amazingly fast."
  },
  {
    initials: "NC",
    name: "Nicolas C.",
    role: "Patient",
    text: "Simple, efficace et totalement gratuit. Les alertes de double dosage m'ont déjà servi plusieurs fois."
  },
  {
    initials: "SL",
    name: "Sandrine L.",
    role: "Anne",
    text: "Tüm aile için, özellikle seyahat ederken cepte bulunması gereken vazgeçilmez bir uygulama."
  },
  {
    initials: "CD",
    name: "كريستيان د.",
    role: "مريض مزمن",
    text: "سجل التنزيلات والمسح العملي للغاية للاحتفاظ بأثر لجميع علاجاتي السابقة."
  },
  {
    initials: "ER",
    name: "Émilie R.",
    role: "Patient",
    text: "I scanned my paracetamol box and understood all the dosage risks in just 2 seconds."
  },
  {
    initials: "HT",
    name: "Hugo T.",
    role: "Alerjik",
    text: "Jenerik ilaçların içeriğinde glüten veya laktoz olup olmadığını kontrol etmek için harika."
  },
  {
    initials: "VG",
    name: "Valentin G.",
    role: "Développeur UI/UX",
    text: "L'ergonomie et le design épuré en font une application extrêmement premium et agréable à utiliser."
  },
  {
    initials: "CM",
    name: "Chloé M.",
    role: "Hiker",
    text: "The offline storage saved my mountain trail runs to check emergency medical doses."
  }
];

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { language, setLanguage, isRTL } = useLanguage();
  
  const [checkingRedirect, setCheckingRedirect] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [screenshotErrors, setScreenshotErrors] = useState<Record<number, boolean>>({});
  
  const t = translationsLanding[language] || translationsLanding.fr;

  // Redirection automatique des anciens utilisateurs connectés
  useEffect(() => {
    const onboardingCompleted = typeof window !== 'undefined' && localStorage.getItem('onboarding_completed') === 'true';
    if (onboardingCompleted || (!loading && user)) {
      router.replace('/app');
    } else if (!loading) {
      setCheckingRedirect(false);
    }
  }, [user, loading, router]);

  // Intersection Observer for fluid scroll-reveal animations
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const runObserver = () => {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add('opacity-100', 'translate-y-0');
                entry.target.classList.remove('opacity-0', 'translate-y-8');
                observer.unobserve(entry.target); // Stop observing once visible
              }
            });
          },
          { 
            threshold: 0.02,
            rootMargin: '0px 0px -20px 0px'
          }
        );

        const targets = document.querySelectorAll('.reveal-on-scroll');
        targets.forEach((target) => observer.observe(target));
      };

      // Delay to ensure Next.js client-side hydration has completed
      const timer = setTimeout(runObserver, 150);
      return () => clearTimeout(timer);
    }
  }, []);

  const steps = [
    {
      id: 1,
      title: t.step1Title,
      desc: t.step1Desc,
      phoneView: (
        <div className="w-full h-full bg-slate-900 flex flex-col justify-between p-4 relative overflow-hidden text-white font-sans">
          {/* Camera View Area */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600')] bg-cover bg-center opacity-60"></div>
          
          {/* Scanning Box Overlay */}
          <div className="absolute inset-x-8 top-28 bottom-28 border-2 border-dashed border-blue-500 rounded-2xl flex items-center justify-center">
            {/* Laser Line */}
            <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-lg shadow-blue-500/50 animate-pulse" style={{ animationDuration: '1.5s', top: '45%' }}></div>
            <span className="text-[10px] tracking-wider font-bold bg-blue-600/80 px-2.5 py-1 rounded-full uppercase absolute top-4 backdrop-blur-sm">{t.mockupAlign}</span>
          </div>

          {/* Camera UI Top */}
          <div className="z-10 flex justify-between items-center">
            <span className="text-xs font-bold bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-blue-400" /> Mode Auto
            </span>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping"></div>
          </div>

          {/* Camera UI Bottom */}
          <div className="z-10 text-center space-y-3">
            <p className="text-xs bg-black/60 py-2 px-4 rounded-xl inline-block backdrop-blur-sm">
              {t.mockupScanning}
            </p>
            <div className="flex justify-center items-center gap-6 pb-2">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                <Bookmark className="w-4 h-4 text-white" />
              </div>
              <div className="w-16 h-16 rounded-full bg-white border-4 border-slate-300/40 flex items-center justify-center active:scale-95 transition-transform">
                <div className="w-12 h-12 rounded-full bg-blue-600"></div>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                <RefreshCw className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: t.step2Title,
      desc: t.step2Desc,
      phoneView: (
        <div className="w-full h-full bg-slate-950 flex flex-col justify-between p-5 text-slate-100 font-sans">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-sm font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">{t.mockupActiveAnalysis}</span>
            <span className="text-[10px] font-bold bg-blue-955 text-blue-400 border border-blue-800/50 px-2 py-0.5 rounded-full">
              {t.mockupReliability}
            </span>
          </div>

          {/* Molecule Card */}
          <div className="my-auto space-y-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                  <Activity className="w-4.5 h-4.5 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t.mockupDetectedMolecule}</h4>
                  <p className="text-sm font-extrabold text-white">{t.mockupParacetamol}</p>
                </div>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-blue-500 h-1.5 rounded-full w-[98%]"></div>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
              <h4 className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t.mockupClassification}</h4>
              <p className="text-xs font-semibold text-slate-200">{t.mockupClassDesc}</p>
              <div className="mt-2.5 bg-blue-955/40 border border-blue-900/30 rounded-xl p-2.5 flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span className="text-[10px] text-blue-300 leading-normal">{t.mockupDosageInfo}</span>
              </div>
            </div>
          </div>

          {/* Footer CTA */}
          <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-xs font-bold rounded-xl text-center shadow-lg shadow-blue-500/20">
            {t.mockupValidate}
          </button>
        </div>
      )
    },
    {
      id: 3,
      title: t.step3Title,
      desc: t.step3Desc,
      phoneView: (
        <div className="w-full h-full bg-slate-950 flex flex-col justify-between p-5 text-slate-100 font-sans">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-sm font-extrabold tracking-tight flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-indigo-400" /> {t.mockupTranslation}
            </span>
            <div className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded-full text-[9px] border border-slate-800">
              <span className="text-slate-400">ES</span>
              <span className="text-blue-400">➔</span>
              <span className="text-white font-bold uppercase">{language}</span>
            </div>
          </div>

          {/* Translation Content */}
          <div className="my-auto space-y-3">
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-3.5">
              <h4 className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">{t.mockupOriginalText}</h4>
              <p className="text-xs italic text-slate-400 leading-relaxed">"{t.mockupOriginalSpanish}"</p>
            </div>
            
            <div className="flex justify-center">
              <div className="bg-indigo-600 text-white rounded-full p-1 shadow-md shadow-indigo-600/30">
                <RefreshCw className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="bg-indigo-955/20 border border-indigo-900/30 rounded-xl p-3.5">
              <h4 className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider mb-1">{t.mockupTranslation} ({language.toUpperCase()})</h4>
              <p className="text-xs text-slate-100 font-medium leading-relaxed">"{t.mockupTranslatedText}"</p>
            </div>
          </div>

          {/* Language selection simulation */}
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
            <span className="py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">English</span>
            <span className="py-2 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300">Français</span>
            <span className="py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">العربية</span>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: t.step4Title,
      desc: t.step4Desc,
      phoneView: (
        <div className="w-full h-full bg-slate-950 flex flex-col justify-between p-5 text-slate-100 font-sans">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-sm font-extrabold tracking-tight flex items-center gap-1.5 text-rose-400">
              <ShieldCheck className="w-4 h-4" /> {t.mockupSafety}
            </span>
            <span className="text-[9px] font-bold bg-rose-955 text-rose-400 border border-rose-800/40 px-2 py-0.5 rounded-full">
              {t.mockupRiskDetected}
            </span>
          </div>

          {/* Alert Area */}
          <div className="my-auto space-y-4">
            <div className="bg-rose-955/30 border border-rose-900/40 rounded-2xl p-4 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-900/30 border border-rose-500/30 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6 text-rose-400" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-rose-300">{t.mockupDoubleDosage}</h4>
                <p className="text-xs text-rose-200/80 leading-normal">{t.mockupDoubleDosageDesc}</p>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
              <h5 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.mockupRecommendation}</h5>
              <p className="text-xs text-slate-300 leading-normal">
                {t.mockupRecommendationDesc}
              </p>
            </div>
          </div>

          {/* Emergency Button Simulation */}
          <button className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-xs font-bold rounded-xl text-center shadow-lg shadow-rose-500/20">
            {t.mockupSaveProfile}
          </button>
        </div>
      )
    }
  ];

  if (checkingRedirect) {
    return (
      <div className="min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-background dark:bg-gray-900 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const heroContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.15
      }
    }
  };

  const heroItemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1.0,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="min-h-screen text-slate-900 transition-colors relative overflow-x-hidden"
      style={{ background: 'radial-gradient(circle at 50% 30%, #D2E9FC 0%, #EBF4FD 45%, #FFFFFF 100%)' }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      
      {/* 1. NAVBAR */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/30 border-b border-blue-100/50 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center space-x-2.5">
            <img 
              src="/logo.png" 
              alt="Medscan Logo" 
              className="h-11 w-auto object-contain"
            />
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-sans">
              Medscan.
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">{t.features}</a>
            <a href="#how-it-works" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">{t.demo}</a>
            <a href="#testimonials" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">{t.reviews}</a>
            <a href="#faq" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">{t.faq}</a>
          </div>

          {/* Right Action Menu - Web App Link & Language Selector */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Selector Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors select-none"
              >
                <Globe className="w-4 h-4 text-slate-500" />
                <span>{language === 'fr' ? '🇫🇷 FR' : language === 'en' ? '🇬🇧 EN' : language === 'ar' ? '🇸🇦 AR' : '🇹🇷 TR'}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {langMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setLangMenuOpen(false)} />
                    <motion.div 
                      className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-36 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-20 overflow-hidden`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.15 }}
                    >
                      <button 
                        onClick={() => { setLanguage('fr'); setLangMenuOpen(false); }}
                        className={`w-full px-4 py-2 text-left text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2 ${language === 'fr' ? 'text-blue-600 bg-blue-50/40' : 'text-slate-700'}`}
                      >
                        <span>🇫🇷</span> Français
                      </button>
                      <button 
                        onClick={() => { setLanguage('en'); setLangMenuOpen(false); }}
                        className={`w-full px-4 py-2 text-left text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2 ${language === 'en' ? 'text-blue-600 bg-blue-50/40' : 'text-slate-700'}`}
                      >
                        <span>🇬🇧</span> English
                      </button>
                      <button 
                        onClick={() => { setLanguage('ar'); setLangMenuOpen(false); }}
                        className={`w-full px-4 py-2 text-left text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2 ${language === 'ar' ? 'text-blue-600 bg-blue-50/40' : 'text-slate-700'}`}
                      >
                        <span>🇸🇦</span> العربية
                      </button>
                      <button 
                        onClick={() => { setLanguage('tr'); setLangMenuOpen(false); }}
                        className={`w-full px-4 py-2 text-left text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2 ${language === 'tr' ? 'text-blue-600 bg-blue-50/40' : 'text-slate-700'}`}
                      >
                        <span>🇹🇷</span> Türkçe
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <Link 
              href="/app"
              className="px-5 py-2.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-500/20 hover:shadow-lg transition-all"
            >
              {t.launchApp}
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200/50 bg-white px-6 py-6 space-y-4 shadow-xl">
            <a 
              href="#features" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-semibold text-slate-600 hover:text-blue-600"
            >
              {t.features}
            </a>
            <a 
              href="#how-it-works" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-semibold text-slate-600 hover:text-blue-600"
            >
              {t.demo}
            </a>
            <a 
              href="#testimonials" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-semibold text-slate-600 hover:text-blue-600"
            >
              {t.reviews}
            </a>
            <a 
              href="#faq" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-semibold text-slate-600 hover:text-blue-600"
            >
              {t.faq}
            </a>
            <Link 
              href="/app"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-bold text-blue-600"
            >
              {t.accessWebVersion}
            </Link>
            
            {/* Language selectors in mobile menu */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 font-sans">Langue / Language :</span>
              <div className="flex gap-2">
                {['fr', 'en', 'ar', 'tr'].map((l) => (
                  <button
                    key={l}
                    onClick={() => { setLanguage(l as any); setMobileMenuOpen(false); }}
                    className={`px-2 py-1 rounded-lg text-xs font-bold ${language === l ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                  >
                    {l === 'fr' ? '🇫🇷' : l === 'en' ? '🇬🇧' : l === 'ar' ? '🇸🇦' : '🇹🇷'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* 2. HERO SECTION - Centered & Premium layout */}
      <section id="hero" className="relative pt-16 pb-0 px-6 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[120px] -z-10" />
        <div className="absolute top-40 right-10 w-[300px] h-[300px] rounded-full bg-indigo-500/10 blur-[80px] -z-10" />

        <motion.div 
          variants={heroContainerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto flex flex-col items-center text-center space-y-10 relative z-10"
        >
          
          {/* Headline */}
          <motion.h1 
            variants={heroItemVariants}
            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] text-slate-900 max-w-3xl"
          >
            {t.heroTitle} <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
              {t.heroTitleGradient}
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p 
            variants={heroItemVariants}
            className="text-base sm:text-lg text-slate-600 max-w-2xl font-medium leading-relaxed"
          >
            {t.heroSubtitle}
          </motion.p>

          {/* Badges de téléchargement */}
          <motion.div 
            variants={heroItemVariants}
            className="flex flex-wrap items-center justify-center gap-6 pt-2"
          >
            <a 
              href="https://apps.apple.com/tr/app/medscan/id6789895804" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-8 py-3.5 rounded-full bg-[#030712] hover:bg-black text-white border border-slate-800 transition-all shadow-lg active:scale-95"
            >
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" 
                alt="Download on the App Store" 
                className="h-8 w-auto object-contain"
              />
            </a>
            <a 
              href="https://play.google.com/store/apps/details?id=com.seinimomo.medscanapp&pcampaignid=web_share"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-8 py-3.5 rounded-full bg-[#030712] hover:bg-black text-white border border-slate-800 transition-all shadow-lg active:scale-95"
            >
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
                alt="Google Play Store" 
                className="h-8 w-auto object-contain"
              />
            </a>
          </motion.div>

          {/* Centered Image Mockup Underneath */}
          <motion.div 
            variants={heroItemVariants}
            className="w-full max-w-4xl mt-4 relative flex justify-center"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-3xl -z-10" />
            
            {/* Left Floating Cards (Visible on lg screens) */}
            
            {/* L1: Scan Intelligent */}
            <div className="hidden lg:flex flex-col absolute lg:left-[-10px] xl:left-[-40px] 2xl:left-[-80px] lg:top-[12%] xl:top-[10%] w-56 backdrop-blur-lg bg-white/40 border border-white/40 rounded-2xl p-3.5 shadow-2xl z-20 text-left space-y-2">
              {/* macOS window dots */}
              <div className="flex space-x-1.5 pb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-600">
                  <Camera className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-800">{t.feat1Title}</h4>
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed font-sans">
                {t.feat1Desc}
              </p>
            </div>

            {/* L2: Traduction de Notice */}
            <div className="hidden lg:flex flex-col absolute lg:left-[-30px] xl:left-[-60px] 2xl:left-[-110px] lg:top-[42%] xl:top-[40%] w-56 backdrop-blur-lg bg-white/40 border border-white/40 rounded-2xl p-3.5 shadow-2xl z-20 text-left space-y-2">
              <div className="flex space-x-1.5 pb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-600">
                  <Globe className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-800">{t.feat2Title}</h4>
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed font-sans">
                {t.feat2Desc}
              </p>
            </div>

            {/* L3: Prévention & Dosage */}
            <div className="hidden lg:flex flex-col absolute lg:left-[-10px] xl:left-[-30px] 2xl:left-[-60px] lg:top-[72%] xl:top-[70%] w-56 backdrop-blur-lg bg-white/40 border border-white/40 rounded-2xl p-3.5 shadow-2xl z-20 text-left space-y-2">
              <div className="flex space-x-1.5 pb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-600">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-800">{t.feat3Title}</h4>
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed font-sans">
                {t.feat3Desc}
              </p>
            </div>

            {/* Right Floating Cards (Visible on lg screens) */}

            {/* R1: Assistant IA Santé */}
            <div className="hidden lg:flex flex-col absolute lg:right-[-15px] xl:right-[-35px] 2xl:right-[-75px] lg:top-[14%] xl:top-[12%] w-56 backdrop-blur-lg bg-white/40 border border-white/40 rounded-2xl p-3.5 shadow-2xl z-20 text-left space-y-2">
              <div className="flex space-x-1.5 pb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-600">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-800">{t.feat4Title}</h4>
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed font-sans">
                {t.feat4Desc}
              </p>
            </div>

            {/* R2: Rappels de Prise */}
            <div className="hidden lg:flex flex-col absolute lg:right-[-35px] xl:right-[-55px] 2xl:right-[-95px] lg:top-[44%] xl:top-[42%] w-56 backdrop-blur-lg bg-white/40 border border-white/40 rounded-2xl p-3.5 shadow-2xl z-20 text-left space-y-2">
              <div className="flex space-x-1.5 pb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-600">
                  <Activity className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-800">{language === 'fr' ? 'Rappels de Prise' : language === 'en' ? 'Intake Reminders' : language === 'ar' ? 'تذكيرات تناول الدواء' : 'Kullanım Hatırlatıcıları'}</h4>
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed font-sans">
                {language === 'fr' ? 'Planifiez vos rappels journaliers et suivez votre traitement en toute sérénité.' : language === 'en' ? 'Schedule your daily reminders and follow your treatment with peace of mind.' : language === 'ar' ? 'خطط لتذكيراتك اليومية وتابع علاجك بكل راحة بال.' : 'Günlük hatırlatıcılarınızı planlayın ve tedavinizi gönül rahatlığıyla takip edin.'}
              </p>
            </div>

            {/* R3: Profil & Avatar */}
            <div className="hidden lg:flex flex-col absolute lg:right-[-10px] xl:right-[-30px] 2xl:right-[-60px] lg:top-[74%] xl:top-[72%] w-56 backdrop-blur-lg bg-white/40 border border-white/40 rounded-2xl p-3.5 shadow-2xl z-20 text-left space-y-2">
              <div className="flex space-x-1.5 pb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-600">
                  <Users className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-800">{language === 'fr' ? 'Profil & Avatar' : language === 'en' ? 'Profile & Avatar' : language === 'ar' ? 'الملف الشخصي والصورة' : 'Profil ve Avatar'}</h4>
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed font-sans">
                {language === 'fr' ? 'Configurez votre profil de santé, votre avatar et suivez vos statistiques d\'utilisation.' : language === 'en' ? 'Set up your health profile, your avatar, and track your usage statistics.' : language === 'ar' ? 'قم بإعداد ملفك الصحي، وصورتك التعبيرية، وتتبع إحصاءات الاستخدام الخاصة بك.' : 'Sağlık profilinizi, avatarınızı ayarlayın ve kullanım istatistiklerinizi takip edin.'}
              </p>
            </div>

            <img 
              src="/hero_mockup.png" 
              alt="MedScan App Interface" 
              className="w-full max-w-3xl h-auto object-contain drop-shadow-2xl"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* 4. KEY FEATURES - Scroll Reveal */}
      <section id="features" className="reveal-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out pt-6 pb-20 px-6 bg-slate-50/50 dark:bg-slate-900/20">
        <div className="max-w-7xl mx-auto flex flex-col space-y-10">
          
          <div className="text-center flex flex-col space-y-4 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">{t.featuresSub}</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              {t.featuresTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/50 shadow-sm hover:shadow-md transition-all group hover:-translate-y-1 duration-300 text-start">
              <div className="mb-5 flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 group-hover:scale-105 transition-transform">
                <img src="/icon_scan.png" alt="Scan" className="w-12 h-12 object-contain" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{t.feat1Title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium font-sans">
                {t.feat1Desc}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/50 shadow-sm hover:shadow-md transition-all group hover:-translate-y-1 duration-300 text-start">
              <div className="mb-5 flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 group-hover:scale-105 transition-transform">
                <img src="/icon_translation.png" alt="Translation" className="w-12 h-12 object-contain" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{t.feat2Title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium font-sans">
                {t.feat2Desc}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/50 shadow-sm hover:shadow-md transition-all group hover:-translate-y-1 duration-300 text-start">
              <div className="mb-5 flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-50 group-hover:scale-105 transition-transform">
                <img src="/icon_info.png" alt="Info" className="w-12 h-12 object-contain" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{t.feat3Title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium font-sans">
                {t.feat3Desc}
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/50 shadow-sm hover:shadow-md transition-all group hover:-translate-y-1 duration-300 text-start">
              <div className="mb-5 flex items-center justify-center w-16 h-16 rounded-2xl bg-green-50 group-hover:scale-105 transition-transform">
                <img src="/icon_profile.png" alt="Assistant" className="w-12 h-12 object-contain" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{t.feat4Title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium font-sans">
                {t.feat4Desc}
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 5. INTERACTIVE SMARTPHONE SHOWCASE */}
      <section id="how-it-works" className="py-24 px-6 bg-white relative overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-400/5 blur-[120px] -z-10" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-indigo-400/5 blur-[100px] -z-10" />

        <div className="max-w-7xl mx-auto flex flex-col space-y-20">
          
          {/* Section Title Block */}
          <div className="text-center flex flex-col space-y-4 max-w-3xl mx-auto">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-[0.2em] font-mono">
              {t.howItWorksSub}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
              {t.howItWorksTitle}
            </h2>
            <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto font-medium">
              {t.howItWorksDesc}
            </p>
          </div>

          {/* Interactive Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
            
            {/* Left side - 4 Interactive Steps Cards */}
            <div className="lg:col-span-6 flex flex-col space-y-5">
              {[
                {
                  id: 1,
                  icon: <Camera className="w-5 h-5" />,
                  title: t.stepCard1Title,
                  description: t.stepCard1Desc
                },
                {
                  id: 2,
                  icon: <Brain className="w-5 h-5" />,
                  title: t.stepCard2Title,
                  description: t.stepCard2Desc
                },
                {
                  id: 3,
                  icon: <Globe className="w-5 h-5" />,
                  title: t.stepCard3Title,
                  description: t.stepCard3Desc
                },
                {
                  id: 4,
                  icon: <Shield className="w-5 h-5" />,
                  title: t.stepCard4Title,
                  description: t.stepCard4Desc
                }
              ].map((step) => {
                const isActive = activeStep === step.id;
                return (
                  <motion.div
                    key={step.id}
                    onClick={() => setActiveStep(step.id)}
                    onMouseEnter={() => setActiveStep(step.id)}
                    className={`group p-6 rounded-3xl border text-start cursor-pointer transition-all duration-300 relative flex items-start space-x-5 overflow-hidden ${
                      isActive 
                        ? 'bg-blue-50/50 border-blue-500/30 shadow-md shadow-blue-500/5' 
                        : 'bg-transparent border-transparent hover:border-slate-200'
                    }`}
                    whileHover={{ y: -2, scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    {/* Active Background Glow */}
                    {isActive && (
                      <div className="absolute inset-0 bg-radial-gradient from-blue-500/5 via-transparent to-transparent pointer-events-none -z-10" />
                    )}

                    {/* Icon container */}
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 rotate-6' 
                        : 'bg-slate-100 text-slate-500 group-hover:rotate-6'
                    }`}>
                      {step.icon}
                    </div>

                    <div className="space-y-1">
                      <h3 className={`text-base font-bold transition-colors ${
                        isActive ? 'text-blue-600' : 'text-slate-900'
                      }`}>
                        {step.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Right side - Large animated smartphone mockup with floating tags */}
            <div className="lg:col-span-6 flex justify-center items-center relative py-6 lg:py-12 w-full">
              
              {/* Centered relative wrapper to contain both phone and floating tags close together */}
              <div className="relative w-full max-w-[420px] aspect-[9/16] flex justify-center items-center">
                
                {/* Floating glassmorphic info tags orbiting the mockup */}
                <div className="absolute inset-0 pointer-events-none z-20">
                  {[
                    { text: t.tagDosage, pos: "left-[2%] top-[12%]", delay: 0 },
                    { text: t.tagEffects, pos: "left-[-10%] top-[42%]", delay: 0.5 },
                    { text: t.tagInteractions, pos: "left-[0%] top-[72%]", delay: 1 },
                    { text: t.tagPrecautions, pos: "right-[2%] top-[16%]", delay: 0.25 },
                    { text: t.tagActive, pos: "right-[0%] top-[76%]", delay: 1.25 }
                  ].map((tag, idx) => (
                    <motion.div
                      key={idx}
                      className={`hidden md:flex absolute ${tag.pos} backdrop-blur-md bg-white/60 border border-white/40 shadow-lg px-4 py-2 rounded-full text-xs font-bold text-slate-800 items-center space-x-1.5`}
                      animate={{ y: [0, idx % 2 === 0 ? -10 : 10, 0] }}
                      transition={{ repeat: Infinity, duration: 4 + idx * 0.3, ease: "easeInOut", delay: tag.delay }}
                    >
                      <span className="text-emerald-500 font-extrabold">✓</span>
                      <span>{tag.text}</span>
                    </motion.div>
                  ))}
                </div>

                {/* iPhone Mockup Frame */}
                <motion.div 
                  className={`relative w-full max-w-[310px] aspect-[9/18.5] flex items-center justify-center z-10 ${
                    screenshotErrors[activeStep]
                      ? 'rounded-[3.2rem] bg-slate-950 p-2.5 shadow-2xl border-[6px] border-slate-900 overflow-hidden'
                      : ''
                  }`}
                  initial={{ scale: 0.9, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  {/* Speaker Grill & Camera Notch (Only for fallback view) */}
                  {screenshotErrors[activeStep] && (
                    <div className="absolute top-2 inset-x-0 h-6 bg-black z-40 rounded-b-xl flex justify-center items-center pointer-events-none">
                      <div className="w-16 h-4 bg-slate-900 rounded-full flex justify-center items-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-955 border border-slate-800 mr-2"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-955 border border-slate-800"></div>
                      </div>
                    </div>
                  )}

                  {/* Simulated Screen Content - Dynamic Image Screenshots with Animation Fallbacks */}
                  <div className={`overflow-hidden flex flex-col justify-between ${
                    screenshotErrors[activeStep]
                      ? 'w-full h-full rounded-[2.8rem] bg-slate-900 relative p-4 pt-10'
                      : 'w-full h-full relative rounded-[2.8rem]'
                  }`}>
                    <AnimatePresence mode="wait">
                      {!screenshotErrors[activeStep] ? (
                        <motion.img 
                          key={`screenshot-${activeStep}`}
                          src={
                            activeStep === 1 ? '/screenshots/scan.png' :
                            activeStep === 2 ? '/screenshots/analysis.png' :
                            activeStep === 3 ? '/screenshots/translation.png' :
                            '/screenshots/safety.png'
                          }
                          alt={`Capture d'écran MedScan - Étape ${activeStep}`}
                          className="absolute inset-0 w-full h-full object-contain select-none z-30 filter drop-shadow-2xl"
                          onError={() => setScreenshotErrors(prev => ({ ...prev, [activeStep]: true }))}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.4 }}
                        />
                      ) : (
                        steps.find(s => s.id === activeStep)?.phoneView
                      )}
                    </AnimatePresence>

                    {/* Bottom indicator */}
                    <div className="w-24 h-1 bg-black/60 dark:bg-white/30 rounded-full absolute bottom-2 left-1/2 -translate-x-1/2 z-40 pointer-events-none"></div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIALS - Infinite Horizontal Scroll */}
      <section id="testimonials" className="reveal-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out py-20 bg-white overflow-hidden">
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes marquee-reverse {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0); }
          }
          .animate-marquee {
            display: flex;
            width: max-content;
            animation: marquee 50s linear infinite;
          }
          .animate-marquee-reverse {
            display: flex;
            width: max-content;
            animation: marquee-reverse 50s linear infinite;
          }
        `}</style>
        
        <div className="max-w-7xl mx-auto flex flex-col space-y-16">
          <div className="flex flex-col space-y-4 max-w-2xl px-6">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">{t.testimonialsSub}</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              {t.testimonialsTitle}
            </h2>
          </div>

          <div className="space-y-8 w-full" dir="ltr">
            {/* Ligne 1 - Défilement Gauche */}
            <div 
              className="overflow-hidden relative w-full"
              style={{
                maskImage: 'linear-gradient(to right, transparent, white 15%, white 85%, transparent)',
                WebkitMaskImage: 'linear-gradient(to right, transparent, white 15%, white 85%, transparent)'
              }}
            >
              <div className="animate-marquee flex gap-6 hover:[animation-play-state:paused] py-2 px-4">
                {testimonialsRow1.map((item, idx) => (
                  <div key={idx} className="bg-slate-50/60 p-6 rounded-3xl border border-slate-200/50 flex flex-col justify-between space-y-4 w-[350px] shrink-0 shadow-sm transition-all hover:scale-[1.02] duration-300 text-left">
                    <p className="text-sm text-slate-600 italic leading-relaxed">
                      "{item.text}"
                    </p>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-xs uppercase select-none">
                        {item.initials}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{item.name}</h4>
                        <span className="text-[10px] text-slate-400">{item.role}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Copie pour boucle infinie */}
                {testimonialsRow1.map((item, idx) => (
                  <div key={`dup1-${idx}`} className="bg-slate-50/60 p-6 rounded-3xl border border-slate-200/50 flex flex-col justify-between space-y-4 w-[350px] shrink-0 shadow-sm transition-all hover:scale-[1.02] duration-300 text-left">
                    <p className="text-sm text-slate-600 italic leading-relaxed">
                      "{item.text}"
                    </p>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-xs uppercase select-none">
                        {item.initials}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{item.name}</h4>
                        <span className="text-[10px] text-slate-400">{item.role}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ligne 2 - Défilement Droite */}
            <div 
              className="overflow-hidden relative w-full"
              style={{
                maskImage: 'linear-gradient(to right, transparent, white 15%, white 85%, transparent)',
                WebkitMaskImage: 'linear-gradient(to right, transparent, white 15%, white 85%, transparent)'
              }}
            >
              <div className="animate-marquee-reverse flex gap-6 hover:[animation-play-state:paused] py-2 px-4">
                {testimonialsRow2.map((item, idx) => (
                  <div key={idx} className="bg-slate-50/60 p-6 rounded-3xl border border-slate-200/50 flex flex-col justify-between space-y-4 w-[350px] shrink-0 shadow-sm transition-all hover:scale-[1.02] duration-300 text-left">
                    <p className="text-sm text-slate-600 italic leading-relaxed">
                      "{item.text}"
                    </p>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-xs uppercase select-none">
                        {item.initials}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{item.name}</h4>
                        <span className="text-[10px] text-slate-400">{item.role}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Copie pour boucle infinie */}
                {testimonialsRow2.map((item, idx) => (
                  <div key={`dup2-${idx}`} className="bg-slate-50/60 p-6 rounded-3xl border border-slate-200/50 flex flex-col justify-between space-y-4 w-[350px] shrink-0 shadow-sm transition-all hover:scale-[1.02] duration-300 text-left">
                    <p className="text-sm text-slate-600 italic leading-relaxed">
                      "{item.text}"
                    </p>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-xs uppercase select-none">
                        {item.initials}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{item.name}</h4>
                        <span className="text-[10px] text-slate-400">{item.role}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ ACCORDION SECTION - Scroll Reveal */}
      <section id="faq" className="reveal-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out py-20 px-6 bg-slate-50/50">
        <div className="max-w-4xl mx-auto flex flex-col space-y-12">
          
          <div className="text-center flex flex-col space-y-4">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">{t.faqSub}</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              {t.faqTitle}
            </h2>
          </div>

          <div className="space-y-4">
            {/* FAQ Item 1 */}
            <details className="group bg-white border border-slate-200/50 rounded-2xl p-5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex justify-between items-center font-bold text-base sm:text-lg cursor-pointer list-none text-slate-900">
                <span>{t.faqQ1}</span>
                <span className="transition-transform group-open:rotate-180 text-blue-500">
                  <ChevronDown className="w-5 h-5" />
                </span>
              </summary>
              <p className="text-sm text-slate-500 mt-3 leading-relaxed font-medium font-sans">
                {t.faqA1}
              </p>
            </details>

            {/* FAQ Item 2 */}
            <details className="group bg-white border border-slate-200/50 rounded-2xl p-5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex justify-between items-center font-bold text-base sm:text-lg cursor-pointer list-none text-slate-900">
                <span>{t.faqQ2}</span>
                <span className="transition-transform group-open:rotate-180 text-blue-500">
                  <ChevronDown className="w-5 h-5" />
                </span>
              </summary>
              <p className="text-sm text-slate-500 mt-3 leading-relaxed font-medium font-sans">
                {t.faqA2}
              </p>
            </details>

            {/* FAQ Item 3 */}
            <details className="group bg-white border border-slate-200/50 rounded-2xl p-5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex justify-between items-center font-bold text-base sm:text-lg cursor-pointer list-none text-slate-900">
                <span>{t.faqQ3}</span>
                <span className="transition-transform group-open:rotate-180 text-blue-500">
                  <ChevronDown className="w-5 h-5" />
                </span>
              </summary>
              <p className="text-sm text-slate-500 mt-3 leading-relaxed font-medium font-sans">
                {t.faqA3}
              </p>
            </details>

            {/* FAQ Item 4 */}
            <details className="group bg-white border border-slate-200/50 rounded-2xl p-5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex justify-between items-center font-bold text-base sm:text-lg cursor-pointer list-none text-slate-900">
                <span>{t.faqQ4}</span>
                <span className="transition-transform group-open:rotate-180 text-blue-500">
                  <ChevronDown className="w-5 h-5" />
                </span>
              </summary>
              <p className="text-sm text-slate-500 mt-3 leading-relaxed font-medium font-sans">
                {t.faqA4}
              </p>
            </details>
          </div>

        </div>
      </section>

      {/* 9. DOWNLOAD CTA BANNER - Scroll Reveal */}
      <section className="reveal-on-scroll opacity-0 translate-y-8 transition-all duration-700 ease-out py-16 px-6">
        <div className="max-w-6xl mx-auto rounded-[36px] bg-gradient-to-r from-blue-700 to-indigo-600 p-8 sm:p-10 lg:py-8 lg:px-16 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24 relative overflow-hidden shadow-xl shadow-blue-500/10">
          <div className="absolute top-[-50px] right-[-50px] w-96 h-96 rounded-full bg-white/5 blur-3xl"></div>

          {/* Left Text */}
          <div className="text-center lg:text-left flex flex-col space-y-6 max-w-xl text-white">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              {t.bannerTitle}
            </h2>
            <p className="text-sm sm:text-base text-white/80 leading-relaxed font-medium font-sans">
              {t.bannerDesc}
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-2">
              <a 
                href="https://apps.apple.com/tr/app/medscan/id6789895804" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center px-6 py-2.5 rounded-full bg-[#030712] hover:bg-black text-white border border-white/10 transition-all shadow-lg active:scale-95"
              >
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" 
                  alt="App Store" 
                  className="h-7 w-auto object-contain" 
                />
              </a>
              <a 
                href="https://play.google.com/store/apps/details?id=com.seinimomo.medscanapp&pcampaignid=web_share"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center px-6 py-2.5 rounded-full bg-[#030712] hover:bg-black text-white border border-white/10 transition-all shadow-lg active:scale-95"
              >
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
                  alt="Google Play Store" 
                  className="h-7 w-auto object-contain" 
                />
              </a>
            </div>
          </div>

          {/* Right Phone Mockup Image */}
          <div className="flex justify-center relative w-full lg:w-auto lg:self-end -mb-8 sm:-mb-10 lg:-mb-8 mt-6 lg:mt-0">
            <img 
              src="/cta_mockup.png" 
              alt="MedScan App Dashboard" 
              className="h-[360px] sm:h-[420px] lg:h-[480px] w-auto object-contain drop-shadow-2xl hover:scale-102 transition-transform duration-500"
            />
          </div>

        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="bg-white border-t border-slate-200/50 py-16 px-6 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">
          
          {/* Logo & Description */}
          <div className="md:col-span-4 flex flex-col space-y-6">
            <div className="flex items-center space-x-2">
              <img 
                src="/logo.png" 
                alt="Medscan Logo" 
                className="h-9 w-auto object-contain"
              />
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-sans">
                Medscan.
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              {t.footerDesc}
            </p>
            <div className="text-xs text-slate-400 font-semibold">
              {t.rightsReserved}
            </div>
          </div>

          {/* Spacer */}
          <div className="hidden md:block md:col-span-4"></div>

          {/* Links 1 */}
          <div className="md:col-span-2 flex flex-col space-y-4">
            <h5 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest">{t.footerNavTitle}</h5>
            <a href="#features" className="text-xs text-slate-500 hover:text-blue-600 transition-colors">{t.features}</a>
            <a href="#how-it-works" className="text-xs text-slate-500 hover:text-blue-600 transition-colors">{t.demo}</a>
            <a href="#testimonials" className="text-xs text-slate-500 hover:text-blue-600 transition-colors">{t.reviews}</a>
            <a href="#faq" className="text-xs text-slate-500 hover:text-blue-600 transition-colors">{t.faq}</a>
          </div>

          {/* Links 3 */}
          <div className="md:col-span-2 flex flex-col space-y-4">
            <h5 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest">{t.footerInfoTitle}</h5>
            <Link href="/privacy" className="text-xs text-slate-500 hover:text-blue-600 transition-colors">{t.privacyPolicy}</Link>
            <Link href="/support" className="text-xs text-slate-500 hover:text-blue-600 transition-colors">{t.supportCenter}</Link>
            <a href="#" className="text-xs text-slate-500 hover:text-blue-600 transition-colors">{t.disclaimer}</a>
          </div>

        </div>
      </footer>

    </motion.div>
  );
}
