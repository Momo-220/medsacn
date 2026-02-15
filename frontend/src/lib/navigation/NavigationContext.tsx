'use client';

import React, { createContext, useContext, useState } from 'react';

type Screen = 'home' | 'scan' | 'scan-result' | 'history' | 'chat' | 'profile' | 'pharmacy' | 'settings';

interface NavigationContextType {
  currentScreen: Screen;
  navigateTo: (screen: Screen) => void;
  goBack: () => void;
  history: Screen[];
  cameraOverlayOpen: boolean;
  setCameraOverlayOpen: (open: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [history, setHistory] = useState<Screen[]>(['home']);
  const [cameraOverlayOpen, setCameraOverlayOpen] = useState(false);

  const navigateTo = (screen: Screen) => {
    setHistory(prev => [...prev, screen]);
    setCurrentScreen(screen);
  };

  const goBack = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop();
      setHistory(newHistory);
      setCurrentScreen(newHistory[newHistory.length - 1]);
    }
  };

  return (
    <NavigationContext.Provider value={{ currentScreen, navigateTo, goBack, history, cameraOverlayOpen, setCameraOverlayOpen }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}


