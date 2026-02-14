'use client';

import { useEffect } from 'react';
import { NotificationService } from '@/lib/notifications';

export function ServiceWorkerInit() {
  useEffect(() => {
    // Initialiser le Service Worker et les notifications
    NotificationService.initialize().then((enabled) => {
      if (enabled) {
        console.log('✅ Notifications activées');
      } else {
        console.log('⚠️ Notifications non disponibles');
      }
    });

    // Écouter les messages du Service Worker
    NotificationService.setupMessageListener((message) => {
      console.log('Message du Service Worker:', message);
      
      // Gérer les actions depuis les notifications
      if (message.type === 'MARK_TAKEN') {
        // L'action sera gérée par MedicationReminders
        window.dispatchEvent(new CustomEvent('reminder-mark-taken', {
          detail: { reminderId: message.reminderId }
        }));
      }
    });
  }, []);

  return null;
}
