/**
 * Analytics tracking - send events to backend
 */

import { apiClient } from './api/client';

const DEVICE_ID_KEY = 'mediscan_device_id';

function getDeviceId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = `d_${Date.now()}_${Math.random().toString(36).slice(2, 15)}`;
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export function track(eventType: string, metadata?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  const deviceId = getDeviceId();
  apiClient.trackEvent(eventType, deviceId, metadata);
}

export const analytics = {
  pageView: (screen: string) => track('page_view', { screen }),
  scan: () => track('scan'),
  chat: () => track('chat'),
  signUp: (method: 'email' | 'google') => track('sign_up', { method }),
  trialStart: () => track('trial_start'),
};
