/**
 * Device ID for trial (one-time per device)
 */

const DEVICE_ID_KEY = 'mediscan_device_id';

export function getDeviceId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = `d_${Date.now()}_${Math.random().toString(36).slice(2, 15)}`;
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}
