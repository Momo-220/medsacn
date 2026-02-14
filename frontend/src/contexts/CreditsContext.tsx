'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/AuthContext';

interface CreditsContextType {
  credits: number;
  loading: boolean;
  refreshCredits: () => Promise<void>;
  addCredits: (amount: number) => Promise<void>;
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined);

export function CreditsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const refreshCredits = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.getCredits();
      setCredits(response.credits || 0);
    } catch (error: any) {
      // L'erreur sera automatiquement affichée via l'intercepteur API
      console.error('Erreur lors du chargement des crédits:', error);
      // En mode dev sans auth, on peut avoir une erreur, on met 0
      setCredits(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const addCredits = useCallback(async (amount: number) => {
    try {
      const response = await apiClient.addCredits(amount);
      setCredits(response.credits || 0);
      // Rafraîchir immédiatement après ajout
      await refreshCredits();
    } catch (error: any) {
      // L'erreur sera automatiquement affichée via l'intercepteur API
      console.error('Erreur lors de l\'ajout de crédits:', error);
      throw error;
    }
  }, [refreshCredits]);

  useEffect(() => {
    // Ne pas charger si pas connecté
    if (!user) {
      setLoading(false);
      return;
    }

    const initialTimeout = setTimeout(() => {
      refreshCredits();
    }, 1000);
    
    const interval = setInterval(refreshCredits, 60000);
    
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [user, refreshCredits]);

  return (
    <CreditsContext.Provider value={{ credits, loading, refreshCredits, addCredits }}>
      {children}
    </CreditsContext.Provider>
  );
}

export function useCredits() {
  const context = useContext(CreditsContext);
  if (!context) {
    throw new Error('useCredits must be used within CreditsProvider');
  }
  return context;
}
