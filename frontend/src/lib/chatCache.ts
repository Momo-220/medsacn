/**
 * Cache local de l'historique du chat pour afficher les conversations récentes
 * dès le retour sur la page (avant le rechargement API).
 */

const CACHE_PREFIX = 'mediscan_chat_cache_';

export interface CachedChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // ISO
}

function key(uid: string) {
  return `${CACHE_PREFIX}${uid}`;
}

export function getChatCache(uid: string): CachedChatMessage[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key(uid));
    if (!raw) return null;
    const data = JSON.parse(raw) as CachedChatMessage[];
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

export function setChatCache(uid: string, messages: { id: string; role: 'user' | 'assistant'; content: string; timestamp: Date }[]): void {
  if (typeof window === 'undefined') return;
  try {
    const data: CachedChatMessage[] = messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      timestamp: m.timestamp.toISOString(),
    }));
    localStorage.setItem(key(uid), JSON.stringify(data));
  } catch {
    // quota or disabled
  }
}
