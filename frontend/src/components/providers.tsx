'use client';

import React from 'react';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { NavigationProvider } from '@/lib/navigation/NavigationContext';
import { HealthProvider } from '@/contexts/HealthContext';
import { CreditsProvider } from '@/contexts/CreditsContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ServiceWorkerInit } from '@/components/ServiceWorkerInit';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <NavigationProvider>
            <HealthProvider>
              <CreditsProvider>
                <ServiceWorkerInit />
                {children}
              </CreditsProvider>
            </HealthProvider>
          </NavigationProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

