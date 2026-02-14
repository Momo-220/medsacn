/**
 * Cache local pour la section Ma pharmacie (mode hors ligne).
 * Les médicaments déjà scannés sont enregistrés et consultables sans connexion.
 */

const CACHE_PREFIX = 'mediscan_pharmacy_cache_';

export interface PharmacyCacheEntry {
  updatedAt: string; // ISO
  scans: any[];
}

function cacheKey(userId: string): string {
  return `${CACHE_PREFIX}${userId}`;
}

export function getPharmacyCache(userId: string): PharmacyCacheEntry | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(cacheKey(userId));
    if (!raw) return null;
    const data = JSON.parse(raw) as PharmacyCacheEntry;
    if (!data.scans || !Array.isArray(data.scans)) return null;
    return data;
  } catch {
    return null;
  }
}

export function setPharmacyCache(userId: string, scans: any[]): void {
  if (typeof window === 'undefined') return;
  try {
    const entry: PharmacyCacheEntry = {
      updatedAt: new Date().toISOString(),
      scans,
    };
    localStorage.setItem(cacheKey(userId), JSON.stringify(entry));
  } catch {
    // quota or disabled localStorage
  }
}

export function isOnline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine;
}
