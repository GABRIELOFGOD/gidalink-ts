const KEY = 'gl_device_id';

/**
 * Returns a persistent, anonymous device UUID stored in localStorage.
 * Used for review deduplication and anonymous posting — no login required.
 * Safe to call: returns '' on server-side.
 */
export function getDeviceId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(KEY, id);
  }
  return id;
}
