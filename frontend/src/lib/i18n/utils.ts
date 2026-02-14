/**
 * Utilitaires de traduction pour les données dynamiques
 */

import { Language } from './translations';

/**
 * Traduit une catégorie de médicament
 */
export function translateCategory(category: string, language: Language): string {
  const categoryMap: Record<Language, Record<string, string>> = {
    fr: {
      'antibiotique': 'Antibiotique',
      'antidouleur': 'Antidouleur',
      'antipyrétique': 'Antipyrétique',
      'anti-inflammatoire': 'Anti-inflammatoire',
      'antihistaminique': 'Antihistaminique',
      'anticoagulant': 'Anticoagulant',
      'antalgique': 'Antidouleur',
      'analgésique': 'Antidouleur',
    },
    en: {
      'antibiotique': 'Antibiotic',
      'antidouleur': 'Painkiller',
      'antipyrétique': 'Antipyretic',
      'anti-inflammatoire': 'Anti-inflammatory',
      'antihistaminique': 'Antihistamine',
      'anticoagulant': 'Anticoagulant',
      'antalgique': 'Painkiller',
      'analgésique': 'Painkiller',
    },
    ar: {
      'antibiotique': 'مضاد حيوي',
      'antidouleur': 'مسكن للألم',
      'antipyrétique': 'خافض للحرارة',
      'anti-inflammatoire': 'مضاد للالتهاب',
      'antihistaminique': 'مضاد للهيستامين',
      'anticoagulant': 'مضاد للتخثر',
      'antalgique': 'مسكن للألم',
      'analgésique': 'مسكن للألم',
    },
    tr: {
      'antibiotique': 'Antibiyotik',
      'antidouleur': 'Ağrı kesici',
      'antipyrétique': 'Ateş düşürücü',
      'anti-inflammatoire': 'Anti-enflamatuar',
      'antihistaminique': 'Antihistaminik',
      'anticoagulant': 'Antikoagülan',
      'antalgique': 'Ağrı kesici',
      'analgésique': 'Ağrı kesici',
    },
  };

  const normalized = category.toLowerCase().trim();
  return categoryMap[language]?.[normalized] || category;
}

/**
 * Formate une date relative (Aujourd'hui, Hier, Il y a X jours)
 */
export function formatRelativeDate(date: Date, language: Language): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (language === 'fr') {
    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days === 1) return 'Hier';
    if (days === 0) return 'Aujourd\'hui';
    if (days < 7) return `Il y a ${days} jours`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  } else {
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days === 0) return 'Today';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  }
}

/**
 * Formate une date simple (Aujourd'hui, Hier, Il y a X jours) sans heure
 */
export function formatSimpleDate(date: Date, language: Language): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((today.getTime() - dateOnly.getTime()) / (1000 * 60 * 60 * 24));

  if (language === 'fr') {
    if (diffDays === 0) return 'Aujourd\'hui';
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  } else {
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  }
}
