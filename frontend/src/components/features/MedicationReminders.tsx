'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Plus, 
  Clock, 
  Pill,
  CheckCircle,
  Edit2,
  Trash2,
  X,
  Loader2,
  Calendar,
  Repeat,
  Settings
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useHealth } from '@/contexts/HealthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { NotificationService } from '@/lib/notifications';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { CustomTimePicker } from '@/components/ui/CustomTimePicker';
import { PermissionModal } from '@/components/ui/PermissionModal';
import { TrialUpgradePrompt } from '@/components/ui/TrialUpgradePrompt';
import { Skeleton } from '@/components/ui/Skeleton';

interface Reminder {
  id: string;
  medication_name: string;
  dosage: string;
  time: string;
  frequency: 'daily' | 'twice' | 'three-times' | 'custom';
  active: boolean;
  next_dose: string;
  taken?: boolean;
}

interface ReminderFormData {
  medication_name: string;
  dosage: string;
  time: string;
  frequency: 'daily' | 'twice' | 'three-times' | 'custom';
  notes?: string;
}

const REMINDERS_COMING_SOON = true;

export function MedicationReminders({ skeleton = false }: { skeleton?: boolean }) {
  const { t, language } = useLanguage();

  if (skeleton) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-2">
          <Skeleton width="w-12" height="h-12" rounded="xl" className="flex-shrink-0" />
          <div className="flex-1 space-y-2 min-w-0">
            <Skeleton height="h-4" width="w-40" rounded="md" />
            <Skeleton height="h-3" width="w-28" rounded="md" />
          </div>
        </div>
        <Skeleton height="h-4" width="w-full" rounded="md" className="mt-3" />
      </div>
    );
  }

  if (REMINDERS_COMING_SOON) {
    return (
      <div className="relative rounded-2xl overflow-hidden">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 opacity-60 pointer-events-none select-none">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 dark:from-blue-500 dark:to-blue-600 flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary dark:text-gray-100">
                {t('medicationRemindersTitle')}
              </h3>
              <p className="text-xs text-text-secondary dark:text-gray-400 mt-0.5">
                {t('remindersPending')} • —
              </p>
            </div>
          </div>
          <p className="text-sm text-text-secondary dark:text-gray-400">
            {t('noRemindersConfigured')}
          </p>
        </div>
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/20 dark:bg-black/30">
          <span className="px-4 py-2 rounded-full bg-white/95 dark:bg-gray-800/95 text-sm font-bold text-text-primary dark:text-gray-100 shadow-lg">
            {language === 'fr' ? 'Bientôt' : 'Coming soon'}
          </span>
        </div>
      </div>
    );
  }

  const { refreshStats } = useHealth();
  const { user, getIdToken, signOut } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [formData, setFormData] = useState<ReminderFormData>({
    medication_name: '',
    dosage: '',
    time: '08:00',
    frequency: 'daily',
    notes: '',
  });
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState<string | null>(null);

  useEffect(() => {
    const checkNotificationStatus = async () => {
      if (NotificationService.isSupported()) {
        const status = NotificationService.permissionStatus;
        if (status === 'granted') {
          const ok = await NotificationService.initialize();
          setNotificationsEnabled(ok);
        }
      }
    };
    checkNotificationStatus();
    
    NotificationService.setupMessageListener((message) => {
      if (message.type === 'MARK_TAKEN' && message.reminderId) {
        markAsTaken(message.reminderId);
      }
    });
  }, []);

  // Demander la permission pour les notifications
  const handleEnableNotifications = async () => {
    if (!NotificationService.isSupported()) {
      alert(t('notificationsNotSupported') || 'Les notifications ne sont pas supportées sur ce navigateur.');
      return;
    }

    const status = NotificationService.permissionStatus;
    if (status === 'granted') {
      const ok = await NotificationService.initialize();
      setNotificationsEnabled(ok);
      if (ok && reminders.length > 0) {
        await NotificationService.scheduleAllReminders(reminders);
      }
      return;
    }

    setShowNotificationModal(true);
  };

  const handleNotificationPermissionGranted = async () => {
    setShowNotificationModal(false);
    setNotificationsEnabled(true);
    await NotificationService.initialize();
    // Programmer les notifications pour les rappels existants
    if (reminders.length > 0) {
      await NotificationService.scheduleAllReminders(reminders);
    }
  };

  useEffect(() => {
    if (user) {
      loadReminders();
    }
  }, [user]);

  const loadReminders = async () => {
    if (!user) return;
    if (user.isAnonymous) {
      setReminders([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const token = await getIdToken();
      if (token) {
        apiClient.setAuthToken(token);
      }
      const response = await apiClient.getReminders(true, 50);
      const remindersList = response.reminders || [];
      
      const remindersWithDates = remindersList.map((r: any) => ({
        ...r,
        nextDose: new Date(r.next_dose),
        taken: false,
      }));
      
      setReminders(remindersWithDates);
      await NotificationService.scheduleAllReminders(remindersList);
    } catch (error) {
      console.error('Erreur lors du chargement des rappels:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeRemaining = (nextDose: Date) => {
    const now = new Date();
    const diff = nextDose.getTime() - now.getTime();
    
    if (diff <= 0) return t('late') || 'En retard';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${t('in') || 'Dans'} ${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`;
    }
    return `${t('in') || 'Dans'} ${minutes}min`;
  };

  useEffect(() => {
    const nextReminder = reminders
      .filter(r => r.active && !r.taken)
      .sort((a, b) => new Date(a.next_dose).getTime() - new Date(b.next_dose).getTime())[0];
    
    if (nextReminder) {
      setTimeRemaining(getTimeRemaining(new Date(nextReminder.next_dose)));
      
      const interval = setInterval(() => {
        setTimeRemaining(getTimeRemaining(new Date(nextReminder.next_dose)));
      }, 60000);
      
      return () => clearInterval(interval);
    }
  }, [reminders, t]);

  const markAsTaken = async (id: string) => {
    try {
      await apiClient.markReminderTaken(id);
      await loadReminders();
      await refreshStats();
      
      if (NotificationService.isNotificationEnabled()) {
        new Notification('✅ ' + (t('takenConfirmed') || 'Prise confirmée'), {
          body: t('medicationRecorded') || 'Votre prise de médicament a été enregistrée',
          icon: '/logo.png',
        });
      }
    } catch (error: any) {
      console.error('Erreur lors de la prise:', error);
    }
  };

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.createReminder(formData);
      setShowAddModal(false);
      setFormData({
        medication_name: '',
        dosage: '',
        time: '08:00',
        frequency: 'daily',
        notes: '',
      });
      await loadReminders();
    } catch (error: any) {
      console.error('Erreur lors de la création:', error);
    }
  };

  const handleUpdateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReminder) return;
    
    try {
      await apiClient.updateReminder(editingReminder.id, formData);
      setEditingReminder(null);
      setFormData({
        medication_name: '',
        dosage: '',
        time: '08:00',
        frequency: 'daily',
        notes: '',
      });
      await loadReminders();
    } catch (error: any) {
      console.error('Erreur lors de la modification:', error);
    }
  };

  const handleConfirmDelete = (id: string) => {
    setReminderToDelete(id);
  };

  const handleDeleteReminder = async () => {
    if (!reminderToDelete) return;
    const id = reminderToDelete;
    setReminderToDelete(null);
    try {
      await apiClient.deleteReminder(id);
      await loadReminders();
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const openEditModal = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setFormData({
      medication_name: reminder.medication_name,
      dosage: reminder.dosage,
      time: reminder.time,
      frequency: reminder.frequency,
      notes: '',
    });
    setShowAddModal(true);
  };

  const nextReminder = reminders
    .filter(r => r.active && !r.taken)
    .sort((a, b) => new Date(a.next_dose).getTime() - new Date(b.next_dose).getTime())[0];

  const activeReminders = reminders.filter(r => r.active && !r.taken);
  const takenCount = reminders.filter(r => r.taken).length;
  const adherence = reminders.length > 0 
    ? Math.round((takenCount / reminders.length) * 100) 
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary dark:text-blue-400 animate-spin" />
      </div>
    );
  }

  if (user?.isAnonymous) {
    return (
      <div className="space-y-4">
        <TrialUpgradePrompt onSignUp={() => signOut()} variant="card" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 dark:from-blue-500 dark:to-blue-600 flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary dark:text-gray-100">
                {t('medicationRemindersTitle')}
              </h3>
              <p className="text-xs text-text-secondary dark:text-gray-400 mt-0.5">
                {activeReminders.length} {t('remindersPending')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Indicateur notifications : activer si désactivées, sinon simple statut */}
            <button
              onClick={notificationsEnabled ? undefined : handleEnableNotifications}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                notificationsEnabled 
                  ? 'bg-green-500 dark:bg-green-600 cursor-default' 
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
              }`}
              title={notificationsEnabled 
                ? (t('notificationsEnabled') || 'Notifications activées')
                : (t('enableNotifications') || 'Activer les notifications')
              }
            >
              <Bell className={`w-5 h-5 ${notificationsEnabled ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => {
                setEditingReminder(null);
                setFormData({
                  medication_name: '',
                  dosage: '',
                  time: '08:00',
                  frequency: 'daily',
                  notes: '',
                });
                setShowAddModal(true);
              }}
              className="w-10 h-10 rounded-full bg-primary dark:bg-blue-500 flex items-center justify-center hover:bg-primary/90 dark:hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-5 h-5 text-white" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Prochain rappel - style harmonisé avec le reste */}
        {nextReminder && (
          <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-4 border border-primary/20 dark:border-primary/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-primary dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-text-secondary dark:text-gray-400 mb-0.5">
                  {t('nextReminder')} • {timeRemaining || t('calculating') || 'Calcul...'}
                </p>
                <p className="font-bold text-text-primary dark:text-gray-100 text-base">
                  {nextReminder.medication_name}
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs text-text-secondary dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {nextReminder.time}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Pill className="w-3 h-3" />
                    {nextReminder.dosage}
                  </span>
                </div>
              </div>
              <button
                onClick={() => markAsTaken(nextReminder.id)}
                className="flex-shrink-0 px-4 py-2 bg-green-500 dark:bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-600 dark:hover:bg-green-700 transition-colors"
              >
                {t('markAsTaken')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Liste des rappels */}
      {reminders.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <Pill className="w-12 h-12 text-text-secondary dark:text-gray-500 mx-auto mb-3 opacity-50" />
          <p className="text-text-secondary dark:text-gray-300 font-medium">{t('noRemindersConfigured')}</p>
          <p className="text-xs text-text-secondary dark:text-gray-400 mt-1">
            {t('clickPlusToAdd') || 'Cliquez sur le bouton + pour ajouter un rappel'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              className={`bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors ${
                reminder.taken ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  reminder.taken 
                    ? 'bg-green-100 dark:bg-green-900/30' 
                    : 'bg-primary/10 dark:bg-blue-900/30'
                }`}>
                  {reminder.taken ? (
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <Pill className="w-5 h-5 text-primary dark:text-blue-400" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-text-primary dark:text-gray-100 text-base">
                      {reminder.medication_name}
                    </h4>
                    {reminder.taken && (
                      <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                        ✓ {t('taken') || 'Pris'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-text-secondary dark:text-gray-400">
                    <span>{reminder.dosage}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {reminder.time}
                    </span>
                    {!reminder.taken && reminder.active && (
                      <>
                        <span>•</span>
                        <TimeRemainingDisplay nextDose={new Date(reminder.next_dose)} />
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!reminder.taken && reminder.active && (
                    <button
                      onClick={() => markAsTaken(reminder.id)}
                      className="w-9 h-9 rounded-xl bg-green-500 dark:bg-green-600 flex items-center justify-center hover:bg-green-600 dark:hover:bg-green-700 transition-colors"
                      title={t('markAsTaken')}
                    >
                      <CheckCircle className="w-4 h-4 text-white" />
                    </button>
                  )}
                  <button
                    onClick={() => openEditModal(reminder)}
                    className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    title={t('edit')}
                  >
                    <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  </button>
                  <button
                    onClick={() => handleConfirmDelete(reminder.id)}
                    className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                    title={t('delete')}
                  >
                    <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 text-center shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
            {takenCount}
          </p>
          <p className="text-xs text-text-secondary dark:text-gray-400">{t('takenToday') || 'Pris aujourd\'hui'}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 text-center shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
            {activeReminders.length}
          </p>
          <p className="text-xs text-text-secondary dark:text-gray-400">{t('pending')}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 text-center shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <p className="text-2xl font-bold text-primary dark:text-blue-400 mb-1">
            {adherence}%
          </p>
          <p className="text-xs text-text-secondary dark:text-gray-400">{t('adherence') || 'Observance'}</p>
        </div>
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl transition-colors">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-text-primary dark:text-gray-100">
                {editingReminder ? t('editReminder') : t('addReminder')}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingReminder(null);
                }}
                className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <X className="w-4 h-4 text-text-secondary dark:text-gray-400" />
              </button>
            </div>

            <form onSubmit={editingReminder ? handleUpdateReminder : handleCreateReminder} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-text-primary dark:text-gray-100 mb-2">
                  {t('medicationName')}
                </label>
                <input
                  type="text"
                  value={formData.medication_name}
                  onChange={(e) => setFormData({ ...formData, medication_name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-text-primary dark:text-gray-100 placeholder:text-text-muted dark:placeholder:text-gray-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-primary dark:text-gray-100 mb-2">
                  {t('dosage')}
                </label>
                <input
                  type="text"
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-text-primary dark:text-gray-100 placeholder:text-text-muted dark:placeholder:text-gray-500 transition-colors"
                  placeholder="ex: 500 mg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-primary dark:text-gray-100 mb-2">
                  {t('time')}
                </label>
                <CustomTimePicker
                  value={formData.time}
                  onChange={(time) => setFormData({ ...formData, time })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-primary dark:text-gray-100 mb-2">
                  {t('frequency')}
                </label>
                <CustomDropdown
                  value={formData.frequency}
                  onChange={(frequency) => setFormData({ ...formData, frequency: frequency as any })}
                  options={[
                    {
                      value: 'daily',
                      label: t('daily'),
                      icon: <Calendar className="w-4 h-4" />,
                    },
                    {
                      value: 'twice',
                      label: t('twice'),
                      icon: <Repeat className="w-4 h-4" />,
                    },
                    {
                      value: 'three-times',
                      label: t('threeTimes'),
                      icon: <Repeat className="w-4 h-4" />,
                    },
                    {
                      value: 'custom',
                      label: t('custom'),
                      icon: <Settings className="w-4 h-4" />,
                    },
                  ]}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingReminder(null);
                  }}
                  className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-text-secondary dark:text-gray-300 font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl bg-primary dark:bg-blue-500 text-white font-semibold hover:bg-primary/90 dark:hover:bg-blue-600 transition-colors"
                >
                  {editingReminder ? t('edit') : t('create') || 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {reminderToDelete && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl transition-colors">
            <p className="text-text-primary dark:text-gray-100 font-medium mb-6">
              {t('confirmDeleteReminder') || 'Êtes-vous sûr de vouloir supprimer ce rappel ?'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setReminderToDelete(null)}
                className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-text-secondary dark:text-gray-300 font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleDeleteReminder}
                className="flex-1 px-4 py-3 rounded-xl bg-red-500 dark:bg-red-600 text-white font-semibold hover:bg-red-600 dark:hover:bg-red-700 transition-colors"
              >
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de permission notifications */}
      <PermissionModal
        type="notifications"
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        onPermissionGranted={handleNotificationPermissionGranted}
      />
    </div>
  );
}

function TimeRemainingDisplay({ nextDose }: { nextDose: Date }) {
  const { t } = useLanguage();
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const diff = nextDose.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeRemaining(t('late') || 'En retard');
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 0) {
        setTimeRemaining(`${t('in') || 'Dans'} ${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`);
      } else {
        setTimeRemaining(`${t('in') || 'Dans'} ${minutes}min`);
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 60000);
    
    return () => clearInterval(interval);
  }, [nextDose, t]);

  return (
    <span className="text-primary dark:text-blue-400 font-semibold">
      {timeRemaining || (t('calculating') || 'Calcul...')}
    </span>
  );
}
