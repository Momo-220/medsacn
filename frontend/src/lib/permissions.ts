// Service centralisé pour gérer les permissions (caméra, notifications, etc.)

export type PermissionType = 'camera' | 'notifications';

export interface PermissionStatus {
  granted: boolean;
  denied: boolean;
  prompt: boolean;
}

export class PermissionsService {
  // Vérifier le statut d'une permission
  static async checkPermission(type: PermissionType): Promise<PermissionStatus> {
    try {
      if (type === 'notifications') {
        if (!('Notification' in window)) {
          return { granted: false, denied: true, prompt: false };
        }
        return {
          granted: Notification.permission === 'granted',
          denied: Notification.permission === 'denied',
          prompt: Notification.permission === 'default',
        };
      }

      if (type === 'camera') {
        if (!navigator.permissions) {
          // Fallback pour les navigateurs qui ne supportent pas l'API Permissions
          return { granted: false, denied: false, prompt: true };
        }
        
        try {
          const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
          return {
            granted: result.state === 'granted',
            denied: result.state === 'denied',
            prompt: result.state === 'prompt',
          };
        } catch {
          // Safari ne supporte pas query pour camera
          return { granted: false, denied: false, prompt: true };
        }
      }

      return { granted: false, denied: false, prompt: true };
    } catch (error) {
      console.error(`Erreur lors de la vérification de la permission ${type}:`, error);
      return { granted: false, denied: false, prompt: true };
    }
  }

  // Demander une permission
  static async requestPermission(type: PermissionType): Promise<boolean> {
    try {
      if (type === 'notifications') {
        return await this.requestNotificationPermission();
      }

      if (type === 'camera') {
        return await this.requestCameraPermission();
      }

      return false;
    } catch (error) {
      console.error(`Erreur lors de la demande de permission ${type}:`, error);
      return false;
    }
  }

  // Demander la permission pour les notifications
  private static async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Les notifications ne sont pas supportées sur ce navigateur');
      return false;
    }

    // Si déjà accordée
    if (Notification.permission === 'granted') {
      return true;
    }

    // Si déjà refusée, on ne peut pas redemander
    if (Notification.permission === 'denied') {
      console.warn('Les notifications ont été refusées. L\'utilisateur doit les activer dans les paramètres du navigateur.');
      return false;
    }

    // Demander la permission
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Erreur lors de la demande de permission notifications:', error);
      return false;
    }
  }

  // Demander la permission pour la caméra
  private static async requestCameraPermission(): Promise<boolean> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn('La caméra n\'est pas supportée sur ce navigateur');
      return false;
    }

    try {
      // La seule façon de demander la permission caméra est d'essayer d'y accéder
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' },
        audio: false 
      });
      
      // Arrêter immédiatement le stream (on voulait juste la permission)
      stream.getTracks().forEach(track => track.stop());
      
      return true;
    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        console.warn('Permission caméra refusée par l\'utilisateur');
      } else if (error.name === 'NotFoundError') {
        console.warn('Aucune caméra trouvée');
      } else {
        console.error('Erreur lors de la demande de permission caméra:', error);
      }
      return false;
    }
  }

  // Vérifier si le navigateur supporte une fonctionnalité
  static isSupported(type: PermissionType): boolean {
    if (type === 'notifications') {
      return 'Notification' in window;
    }
    if (type === 'camera') {
      return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    }
    return false;
  }

  // Ouvrir les paramètres du navigateur (instruction pour l'utilisateur)
  static getSettingsInstructions(type: PermissionType): string {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    const isChrome = /Chrome/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !isChrome;

    if (type === 'notifications') {
      const isPWA = typeof window !== 'undefined' && (window as any).matchMedia?.('(display-mode: standalone)')?.matches;
      if (isIOS) {
        if (isPWA) {
          return 'Réglages > MediScan > Notifications : activez "Autoriser les notifications".';
        }
        return 'Ajoutez l\'app à l\'écran d\'accueil (partage > sur l\'écran d\'accueil), puis Réglages > MediScan > Notifications.';
      }
      if (isAndroid && isChrome) {
        return 'Appuyez sur le cadenas ou l\'icône ⓘ dans la barre d\'adresse, puis activez les Notifications.';
      }
      return 'Cliquez sur le cadenas dans la barre d\'adresse et autorisez les notifications.';
    }

    if (type === 'camera') {
      if (isIOS && isSafari) {
        return 'Allez dans Réglages > Safari > Caméra et autorisez l\'accès.';
      }
      if (isAndroid && isChrome) {
        return 'Appuyez sur le cadenas dans la barre d\'adresse, puis autorisez la Caméra.';
      }
      return 'Cliquez sur le cadenas dans la barre d\'adresse et autorisez l\'accès à la caméra.';
    }

    return 'Vérifiez les paramètres de votre navigateur.';
  }
}
