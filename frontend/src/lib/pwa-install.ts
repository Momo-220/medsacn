/**
 * PWA Install – Chrome Android
 * 1. Listen to beforeinstallprompt, prevent default, store event.
 * 2. Show custom Install button only when install is available.
 * 3. On click: call prompt(), then handle userChoice (accepted/dismissed).
 * 4. Hide button after install or dismiss (clear stored event).
 * 5. Do not show button if app is already installed (standalone).
 * Vanilla-style API; use from React via usePwaInstall().
 */

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

/** App is already installed (running in standalone). */
export function isAppInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches;
}

/** Android (Chrome). */
export function isAndroid(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android/i.test(navigator.userAgent);
}

/** Single global handler: one listener, one stored event. */
let deferredPrompt: BeforeInstallPromptEvent | null = null;

function onBeforeInstallPrompt(e: Event) {
  e.preventDefault();
  deferredPrompt = e as BeforeInstallPromptEvent;
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('pwa-install-available'));
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
}

export function getDeferredPrompt(): BeforeInstallPromptEvent | null {
  return deferredPrompt;
}

export function clearDeferredPrompt(): void {
  deferredPrompt = null;
}

/**
 * Trigger the native install prompt.
 * Returns user choice; clears stored event so UI can hide the button.
 */
export async function triggerPwaInstall(): Promise<'accepted' | 'dismissed'> {
  if (!deferredPrompt) return 'dismissed';
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('pwa-install-available'));
  return outcome;
}

/** True if we should show the Install button (available and not installed). */
export function canShowInstallButton(): boolean {
  if (typeof window === 'undefined') return false;
  if (isAppInstalled()) return false;
  return !!deferredPrompt;
}
