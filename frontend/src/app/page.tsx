'use client';

import { useState, useEffect } from 'react';
import { HomeScreen } from '@/components/screens/HomeScreen';
import { ScanScreen } from '@/components/screens/ScanScreen';
import { ChatScreen } from '@/components/screens/ChatScreen';
import { ProfileScreen } from '@/components/screens/ProfileScreen';
import { PharmacyScreen } from '@/components/screens/PharmacyScreen';
import { SettingsScreen } from '@/components/screens/SettingsScreen';
import { AuthScreen } from '@/components/screens/AuthScreen';
import { LanguageSelectionScreen } from '@/components/screens/LanguageSelectionScreen';
import { OnboardingScreen } from '@/components/screens/OnboardingScreen';
import { TrialOrSignInScreen } from '@/components/screens/TrialOrSignInScreen';
import { AskNameScreen } from '@/components/screens/AskNameScreen';
import { NavigationBar } from '@/components/ui/NavigationBar';
import { ErrorToastContainer } from '@/components/ui/ErrorToast';
import { SplashScreen } from '@/components/ui/SplashScreen';
import { AvatarPicker } from '@/components/ui/AvatarPicker';
import { InstallPromptModal } from '@/components/ui/InstallPromptModal';
import { InstallAppModal } from '@/components/ui/InstallAppModal';
import { SignUpModal } from '@/components/ui/SignUpModal';
import { useNavigation } from '@/lib/navigation/NavigationContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { analytics } from '@/lib/analytics';

const ONBOARDING_STORAGE_KEY = 'onboarding_completed';
const INSTALL_PROMPT_SHOWN_KEY = 'mediscan_install_prompt_shown';
const AVATAR_COMPLETED_KEY = 'mediscan_avatar_completed';

function AvatarPickerOverlay({ onComplete }: { onComplete: () => void }) {
  const { user, updateProfile } = useAuth();
  const handleSelect = async (photoURL: string) => {
    try {
      await updateProfile({ photoURL });
      if (typeof window !== 'undefined') window.localStorage.setItem(AVATAR_COMPLETED_KEY, 'true');
      onComplete();
    } catch (e) {
      console.error('Failed to update avatar:', e);
    }
  };
  const handleClose = () => {
    if (typeof window !== 'undefined') window.localStorage.setItem(AVATAR_COMPLETED_KEY, 'true');
    onComplete();
  };
  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-sm w-full shadow-xl">
        <AvatarPicker
          currentPhotoURL={user?.photoURL || null}
          onSelect={handleSelect}
          onClose={handleClose}
          showCloseButton
        />
      </div>
    </div>
  );
}
const USER_NAME_STORAGE_KEY = 'mediscan_user_name';

type AppPhase = 'splash' | 'language' | 'onboarding' | 'trial_or_signin' | 'ask_name' | 'app';

/** True seulement à la première utilisation (onboarding pas encore complété). */
function isFirstTimeUse(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(ONBOARDING_STORAGE_KEY) !== 'true';
}

export default function App() {
  const { currentScreen } = useNavigation();
  const { user, loading: authLoading, signOut } = useAuth();
  const [phase, setPhase] = useState<AppPhase>('splash');
  const [ready, setReady] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showInstallFlow, setShowInstallFlow] = useState(false);
  const [avatarPickerDismissed, setAvatarPickerDismissed] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  useEffect(() => {
    const handler = () => {
      if (user?.isAnonymous) setShowSignUpModal(true);
    };
    window.addEventListener('insufficientCredits', handler);
    return () => window.removeEventListener('insufficientCredits', handler);
  }, [user?.isAnonymous]);

  useEffect(() => {
    if (phase === 'app' && currentScreen) {
      analytics.pageView(currentScreen);
    }
  }, [phase, currentScreen]);

  // Toujours afficher le splash au chargement (actualisation ou retour sur l'app)
  useEffect(() => {
    setReady(true);
  }, []);

  const showAvatarPicker = user && !user.isAnonymous && !avatarPickerDismissed && (typeof window === 'undefined' || window.localStorage.getItem(AVATAR_COMPLETED_KEY) !== 'true');

  // Popup installation : première entrée (inscription ou essai), après l'avatar si nécessaire
  // Doit être au top-level (règles des hooks)
  useEffect(() => {
    if (phase !== 'app' || !user) return;
    if (typeof window === 'undefined') return;
    if (showAvatarPicker) return;
    if (!window.localStorage.getItem(INSTALL_PROMPT_SHOWN_KEY)) {
      setShowInstallPrompt(true);
    }
  }, [phase, user, showAvatarPicker]);

  const handleSplashComplete = () => {
    if (!isFirstTimeUse()) {
      setPhase('app');
      return;
    }
    setPhase('language');
  };

  const handleLanguageComplete = () => {
    setPhase('onboarding');
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    setPhase('trial_or_signin');
  };

  const handleTrialStart = () => {
    // Démarrer le mode essai puis demander le prénom de l'utilisateur une seule fois
    // Le prénom est stocké dans le localStorage par l'écran AskNameScreen
    setPhase('ask_name');
  };
  const handleSignInChoice = () => setPhase('app');

  const handleNameComplete = () => {
    // Nom saisi, on peut maintenant afficher l'application
    setPhase('app');
  };

  // Attendre le premier rendu client pour éviter flash
  if (!ready) {
    return (
      <div className="min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-background dark:bg-gray-900 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // === PHASE : SPLASH (uniquement première fois, avant langue + onboarding) ===
  if (phase === 'splash') {
    return <SplashScreen onComplete={handleSplashComplete} duration={5000} />;
  }

  // === PHASE : SELECTION DE LANGUE ===
  if (phase === 'language') {
    return <LanguageSelectionScreen onComplete={handleLanguageComplete} />;
  }

  if (phase === 'onboarding') {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  if (phase === 'ask_name') {
    return <AskNameScreen onComplete={handleNameComplete} />;
  }

  // === PHASE : ESSAYER OU SE CONNECTER (après onboarding) ===
  if (phase === 'trial_or_signin') {
    return (
      <TrialOrSignInScreen
        onTryApp={handleTrialStart}
        onSignIn={handleSignInChoice}
      />
    );
  }

  // === PHASE : APP ===

  // Attendre que l'auth soit chargée
  if (authLoading) {
    return (
      <div className="min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-background dark:bg-gray-900 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Si pas connecté, afficher l'écran d'auth
  if (!user) {
    return <AuthScreen />;
  }

  // Popup installation : première fois (inscription ou essai)
  const handleInstallPromptYes = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(INSTALL_PROMPT_SHOWN_KEY, 'true');
    }
    setShowInstallPrompt(false);
    setShowInstallFlow(true);
  };

  const handleInstallPromptNo = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(INSTALL_PROMPT_SHOWN_KEY, 'true');
    }
    setShowInstallPrompt(false);
  };

  // Afficher la barre de navigation partout sauf sur le profil, settings et le chat
  const showNavBar = currentScreen !== 'profile' && currentScreen !== 'chat' && currentScreen !== 'settings';

  return (
    <ErrorToastContainer>
      {/* Popup "Voulez-vous installer l'app ?" (première fois) */}
      {showInstallPrompt && (
        <InstallPromptModal
          isOpen={showInstallPrompt}
          onYes={handleInstallPromptYes}
          onNo={handleInstallPromptNo}
        />
      )}
      {/* Modal processus d'installation (quand l'utilisateur dit Oui) */}
      <InstallAppModal
        isOpen={showInstallFlow}
        onClose={() => setShowInstallFlow(false)}
      />
      {/* Modal choix avatar (après inscription - toutes méthodes) */}
      {showAvatarPicker && (
        <AvatarPickerOverlay onComplete={() => setAvatarPickerDismissed(true)} />
      )}
      {/* Modal connexion quand gemmes épuisées (mode essai) */}
      {showSignUpModal && (
        <SignUpModal
          isOpen={showSignUpModal}
          onClose={() => setShowSignUpModal(false)}
          onSignUp={() => {
            setShowSignUpModal(false);
            signOut();
          }}
        />
      )}
      {/* Screens */}
      {(() => {
        switch (currentScreen) {
          case 'scan':
          case 'scan-result':
            return <ScanScreen />;
          case 'chat':
            return <ChatScreen />;
          case 'profile':
            return <ProfileScreen />;
          case 'settings':
            return <SettingsScreen />;
          case 'pharmacy':
          case 'history':
            return <PharmacyScreen />;
          case 'home':
          default:
            return <HomeScreen />;
        }
      })()}

      {/* Barre de navigation (partout sauf profil) */}
      {showNavBar && <NavigationBar />}
    </ErrorToastContainer>
  );
}
