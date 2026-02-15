/**
 * Résout l'URL des images pour qu'elles s'affichent correctement
 * en local (uploads backend) et en production (GCS ou backend)
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888';

export function getImageUrl(url: string | undefined | null): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  // URL absolue (http/https) - utiliser telle quelle
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  // URL relative (/uploads/xxx) - préfixer par l'API
  if (trimmed.startsWith('/')) {
    return `${API_BASE.replace(/\/$/, '')}${trimmed}`;
  }
  return trimmed;
}
