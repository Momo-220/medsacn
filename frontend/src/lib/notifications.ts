// Service de notifications push natives
export class NotificationService {
  private static registration: ServiceWorkerRegistration | null = null;

  // Vérifier le statut de la permission
  static get permissionStatus(): 'granted' | 'denied' | 'default' {
    if ('Notification' in window) {
      return Notification.permission;
    }
    return 'denied';
  }

  // Vérifier si les notifications sont supportées
  static isSupported(): boolean {
    // Vérifier contexte sécurisé
    const isSecure = typeof window !== 'undefined' && (
      window.isSecureContext || 
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1' ||
      window.location.protocol === 'https:'
    );
    
    if (!isSecure) {
      console.warn('Les notifications nécessitent HTTPS ou localhost');
      return false;
    }
    
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  // Demander la permission
  static async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      console.warn('Notifications non supportées (contexte non sécurisé ou navigateur incompatible)');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('Permission notifications refusée. L\'utilisateur doit l\'activer manuellement.');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Erreur lors de la demande de permission:', error);
      return false;
    }
  }

  // Initialiser le Service Worker
  static async initialize(): Promise<boolean> {
    if (!this.isSupported()) {
      return false;
    }

    // Vérifier la permission
    if (Notification.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) {
        return false;
      }
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service Worker enregistré:', this.registration);

      const sw = this.registration.installing || this.registration.waiting;
      if (sw) {
        await new Promise<void>((resolve) => {
          if (sw.state === 'activated') {
            resolve();
            return;
          }
          const onStateChange = () => {
            if (sw.state === 'activated') {
              sw.removeEventListener('statechange', onStateChange);
              resolve();
            }
          };
          sw.addEventListener('statechange', onStateChange);
        });
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du Service Worker:', error);
      return false;
    }
  }

  // Programmer une notification locale (fonctionne hors ligne)
  static async scheduleLocalNotification(
    reminderId: string,
    medicationName: string,
    dosage: string,
    time: Date
  ): Promise<void> {
    if (!this.registration) {
      await this.initialize();
    }

    if (!this.registration) {
      console.error('Service Worker non disponible');
      return;
    }

    const now = new Date().getTime();
    const scheduledTime = time.getTime();
    const delay = scheduledTime - now;

    if (delay <= 0) {
      console.warn('La date de notification est dans le passé');
      return;
    }

    // Stocker la notification dans le Service Worker pour qu'elle fonctionne même si l'app est fermée
    // Envoyer un message au Service Worker pour programmer la notification
    if (this.registration.active) {
      this.registration.active.postMessage({
        type: 'SCHEDULE_NOTIFICATION',
        data: {
          reminderId,
          medicationName,
          dosage,
          delay,
          scheduledTime,
        },
      });
    }

    // Aussi programmer côté client (pour les tests immédiats)
    setTimeout(() => {
      const opts = {
        body: `Il est temps de prendre ${medicationName} (${dosage})`,
        icon: '/logo.png',
        badge: '/logo.png',
        tag: `reminder-${reminderId}`,
        requireInteraction: true,
        vibrate: [200, 100, 200, 100, 200],
        data: { reminderId, medicationName, dosage },
        actions: [
          { action: 'taken', title: '✓ Pris' },
          { action: 'snooze', title: '⏰ Dans 10min' },
        ],
      } as NotificationOptions;
      this.registration?.showNotification('Rappel de médicament', opts);
    }, delay);
  }

  // Tester les notifications immédiatement
  static async testNotification(): Promise<void> {
    if (!this.registration) {
      await this.initialize();
    }

    if (!this.registration) {
      alert('Service Worker non disponible. Vérifiez la console pour plus de détails.');
      return;
    }

    if (!this.isNotificationEnabled()) {
      alert('Les notifications ne sont pas activées. Veuillez autoriser les notifications dans les paramètres de votre navigateur.');
      return;
    }

    // Notification de test immédiate
    this.registration.showNotification('🔔 Test de notification', {
      body: 'Si vous voyez cette notification, le système fonctionne !',
      icon: '/logo.png',
      badge: '/logo.png',
      tag: 'test-notification',
      requireInteraction: false,
      vibrate: [200, 100, 200],
    } as NotificationOptions);
  }

  // Programmer toutes les notifications pour les rappels
  static async scheduleAllReminders(reminders: any[]): Promise<void> {
    // Annuler toutes les notifications existantes
    if (this.registration) {
      const notifications = await this.registration.getNotifications();
      notifications.forEach((notification) => notification.close());
    }

    // Programmer les nouvelles notifications
    for (const reminder of reminders) {
      if (reminder.active && reminder.next_dose) {
        const nextDose = new Date(reminder.next_dose);
        await this.scheduleLocalNotification(
          reminder.id,
          reminder.medication_name,
          reminder.dosage,
          nextDose
        );
      }
    }
  }

  // Vérifier si les notifications sont activées
  static isNotificationEnabled(): boolean {
    return 'Notification' in window && Notification.permission === 'granted';
  }

  // Écouter les messages du Service Worker
  static setupMessageListener(callback: (message: any) => void): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        callback(event.data);
      });
    }
  }
}
