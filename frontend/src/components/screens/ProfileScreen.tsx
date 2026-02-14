'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Shield,
  LogOut,
  ChevronRight,
  ArrowLeft,
  Camera,
  Mail,
  Edit2,
  Check
} from 'lucide-react';
import { useNavigation } from '@/lib/navigation/NavigationContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { AvatarPicker } from '@/components/ui/AvatarPicker';

const USER_NAME_STORAGE_KEY = 'mediscan_user_name';

export function ProfileScreen() {
  const { goBack, navigateTo } = useNavigation();
  const { t } = useLanguage();
  const { user, signOut, updateProfile } = useAuth();
  const [localName, setLocalName] = useState<string | null>(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(USER_NAME_STORAGE_KEY);
    if (stored) setLocalName(stored);
  }, []);

  const displayName = user?.displayName || localName || t('user');
  const profile = {
    name: displayName,
  };

  const handleSaveName = async () => {
    const trimmed = editNameValue.trim();
    if (trimmed.length < 2) return;
    try {
      await updateProfile({ displayName: trimmed });
      if (typeof window !== 'undefined') window.localStorage.setItem(USER_NAME_STORAGE_KEY, trimmed);
      setLocalName(trimmed);
      setEditingName(false);
    } catch (e) {
      console.error('Failed to update name:', e);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-background dark:bg-gray-900 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-[env(safe-area-inset-top)]">
      {/* Header avec bouton retour - Responsive */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto pt-8 pb-6">
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-text-secondary dark:text-gray-400 hover:text-text-primary dark:hover:text-gray-200 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-semibold">{t('back')}</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary dark:text-gray-100 mb-2">
          {t('myProfile')}
        </h1>
        <p className="text-text-secondary dark:text-gray-400 text-sm">
          {t('managePersonalInfo')}
        </p>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-4">
        {/* Photo de profil + avatar (masqué en mode essai) */}
        <div className="card dark:bg-gray-800 p-6 flex flex-col items-center">
          {user?.isAnonymous ? (
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center ring-2 ring-primary/20 mb-4">
              <User className="w-12 h-12 text-white" strokeWidth={2} />
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setShowAvatarPicker(true)}
                className="relative mb-4 group"
              >
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center ring-2 ring-primary/20">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-white" strokeWidth={2} />
                  )}
                </div>
                <span className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shadow-lg">
                  <Camera className="w-4 h-4" />
                </span>
              </button>
              <button
                type="button"
                onClick={() => setShowAvatarPicker(true)}
                className="mt-2 text-sm text-primary dark:text-blue-400 hover:underline"
              >
                {t('changeAvatar')}
              </button>
            </>
          )}
          <h2 className="text-xl font-bold text-primary dark:text-blue-400">
            {profile.name}
          </h2>
        </div>

        {showAvatarPicker && !user?.isAnonymous && (
          <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-sm w-full shadow-xl">
              <AvatarPicker
                currentPhotoURL={user?.photoURL || null}
                onSelect={async (photoURL) => {
                  await updateProfile({ photoURL });
                  setShowAvatarPicker(false);
                }}
                onClose={() => setShowAvatarPicker(false)}
                showCloseButton
              />
            </div>
          </div>
        )}

        {/* Nom et email */}
        <div className="card dark:bg-gray-800 p-6">
          <h3 className="text-base font-bold text-text-primary dark:text-gray-100 mb-4">
            {t('personalInfo')}
          </h3>
          <div className="space-y-4">
            {editingName ? (
              <div className="flex items-center gap-3 pb-3 border-b border-background-secondary dark:border-gray-700">
                <div className="w-10 h-10 rounded-lg bg-background-secondary dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-primary dark:text-blue-400" />
                </div>
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={editNameValue}
                    onChange={(e) => setEditNameValue(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-text-primary dark:text-gray-100 text-sm"
                    placeholder={t('fullName')}
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={editNameValue.trim().length < 2}
                    className="p-2 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
                    aria-label="Enregistrer"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => { setEditingName(false); setEditNameValue(profile.name); }}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-text-secondary hover:bg-gray-200 dark:hover:bg-gray-600"
                    aria-label="Annuler"
                  >
                    ×
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 pb-3 border-b border-background-secondary dark:border-gray-700">
                <div className="w-10 h-10 rounded-lg bg-background-secondary dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-primary dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-text-secondary dark:text-gray-400 mb-1">{t('fullName')}</p>
                  <p className="text-sm font-semibold text-text-primary dark:text-gray-100">{profile.name}</p>
                </div>
                {!user?.isAnonymous && (
                  <button
                    onClick={() => { setEditNameValue(profile.name); setEditingName(true); }}
                    className="p-2 rounded-lg hover:bg-background-secondary dark:hover:bg-gray-700"
                    aria-label={t('edit')}
                  >
                    <Edit2 className="w-4 h-4 text-primary dark:text-blue-400" />
                  </button>
                )}
              </div>
            )}
            {user?.email && (
              <ProfileField
                icon={<Mail className="w-5 h-5 text-primary dark:text-blue-400" />}
                label={t('email')}
                value={user.email}
              />
            )}
          </div>
        </div>

        {/* Lien vers Paramètres */}
        <button 
          onClick={() => navigateTo('settings')}
          className="w-full card dark:bg-gray-800 p-4 flex items-center justify-between hover:bg-background-secondary dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 dark:bg-blue-900/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary dark:text-blue-400" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-text-primary dark:text-gray-100">{t('settings')}</p>
              <p className="text-xs text-text-secondary dark:text-gray-400">Notifications, confidentialité, etc.</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-text-secondary dark:text-gray-400" />
        </button>

        {/* Déconnexion */}
        <button 
          onClick={signOut}
          className="w-full card dark:bg-gray-800 p-4 flex items-center justify-center gap-2 text-red-600 dark:text-red-400 font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          {t('logout')}
        </button>
      </div>
    </div>
  );
}

function ProfileField({ 
  icon, 
  label, 
  value
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 pb-3 border-b border-background-secondary dark:border-gray-700 last:border-0 last:pb-0">
      <div className="w-10 h-10 rounded-lg bg-background-secondary dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-xs text-text-secondary dark:text-gray-400 mb-1">{label}</p>
        <p className="text-sm font-semibold text-text-primary dark:text-gray-100">{value}</p>
      </div>
    </div>
  );
}
