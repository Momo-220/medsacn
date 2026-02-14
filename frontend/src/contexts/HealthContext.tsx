'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/AuthContext';

interface HealthStats {
  scansThisWeek: number;
  medicationsTaken: number;
  adherenceRate: number;
  nextReminder: string | null;
  nextReminderTime: string | null;
  pendingReminders: number;
}

interface HealthContextType {
  stats: HealthStats;
  refreshStats: () => Promise<void>;
  loading: boolean;
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export function HealthProvider({ children }: { children: React.ReactNode }) {
  // Import auth to check if user is logged in
  const { user } = useAuth();
  const [stats, setStats] = useState<HealthStats>({
    scansThisWeek: 0,
    medicationsTaken: 0,
    adherenceRate: 0,
    nextReminder: null,
    nextReminderTime: null,
    pendingReminders: 0,
  });
  const [loading, setLoading] = useState(true);

  const refreshStats = useCallback(async () => {
    const emptyStats = {
      scansThisWeek: 0,
      medicationsTaken: 0,
      adherenceRate: 0,
      nextReminder: null as string | null,
      nextReminderTime: null as string | null,
      pendingReminders: 0,
    };
    try {
      if (user?.isAnonymous) {
        setStats(emptyStats);
        return;
      }
      const [remindersResponse, historyResponse] = await Promise.all([
        apiClient.getReminders(true, 50),
        apiClient.getHistory(100, 1),
      ]);
      
      const reminders = remindersResponse.reminders || [];
      const medicationsTakenToday = remindersResponse.medications_taken_today ?? 0;
      const scans = historyResponse.scans || [];
      
      // === CALCUL DES SCANS DE LA SEMAINE ===
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const scansThisWeek = scans.filter((scan: any) => {
        const scanDate = new Date(scan.scanned_at);
        return scanDate >= oneWeekAgo;
      }).length;
      
      // === CALCUL DES RAPPELS ===
      const activeReminders = reminders.filter((r: any) => r.active);
      
      // Trouver le prochain rappel
      const nextReminder = activeReminders
        .sort((a: any, b: any) => new Date(a.next_dose).getTime() - new Date(b.next_dose).getTime())[0];
      
      // === CALCUL DE L'OBSERVANCE ===
      // Prises aujourd'hui / nombre de rappels actifs, plafonné à 100%
      const totalReminders = reminders.length;
      const adherenceRate = totalReminders > 0 
        ? Math.min(100, Math.round((medicationsTakenToday / totalReminders) * 100))
        : 0;
      
      // === CALCUL DU TEMPS RESTANT ===
      let nextReminderTime = null;
      if (nextReminder) {
        const nextDose = new Date(nextReminder.next_dose);
        const diff = nextDose.getTime() - now.getTime();
        
        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          
          if (hours > 0) {
            nextReminderTime = `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`;
          } else {
            nextReminderTime = `${minutes}min`;
          }
        } else {
          nextReminderTime = 'En retard';
        }
      }
      
      setStats({
        scansThisWeek,
        medicationsTaken: medicationsTakenToday,
        adherenceRate,
        nextReminder: nextReminder?.medication_name || null,
        nextReminderTime: nextReminderTime || nextReminder?.time || null,
        pendingReminders: activeReminders.length,
      });
    } catch (error: any) {
      console.error('Erreur lors du chargement des statistiques:', error);
      // En cas d'erreur, garder les stats par défaut
      setStats(emptyStats);
    } finally {
      setLoading(false);
    }
  }, [user?.isAnonymous]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const initialTimeout = setTimeout(() => {
      refreshStats();
    }, 500);
    
    const interval = setInterval(refreshStats, 5 * 60 * 1000);
    
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [user, refreshStats]);

  return (
    <HealthContext.Provider value={{ stats, refreshStats, loading }}>
      {children}
    </HealthContext.Provider>
  );
}

export function useHealth() {
  const context = useContext(HealthContext);
  if (!context) {
    throw new Error('useHealth must be used within HealthProvider');
  }
  return context;
}
