/**
 * Avatars proposés à l'inscription et dans le profil (11 avatars).
 */
export const AVATAR_PATHS = [
  '/avatars/avatar1.png',
  '/avatars/avatar2.png',
  '/avatars/avatar3.png',
  '/avatars/avatar4.png',
  '/avatars/avatar5.png',
  '/avatars/avatar6.png',
  '/avatars/avatar7.png',
  '/avatars/avatar8.png',
  '/avatars/avatar9.png',
  '/avatars/avatar10.png',
  '/avatars/avatar11.png',
];

export function getAvatarFullUrl(path: string): string {
  if (typeof window === 'undefined') return path;
  return path.startsWith('http') ? path : window.location.origin + path;
}
