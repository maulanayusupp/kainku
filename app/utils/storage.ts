/**
 * Safe localStorage access.
 *
 * Every call is guarded because this code also runs during SSR (no `window`)
 * and because storage throws in Safari private mode and when the quota is
 * exceeded. Callers get a predictable fallback instead of an exception.
 */

const isBrowser = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

/** Namespaced so several demo apps can share an origin without colliding. */
export const STORAGE_KEYS = {
  cart: 'kainku:cart:v1',
  checkout: 'kainku:checkout:v1',
  lastOrder: 'kainku:last-order:v1',
  recentlyViewed: 'kainku:recently-viewed:v1',
} as const

export function readStorage<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    // Corrupt or unreadable entry — drop it so it cannot break the next load.
    try {
      window.localStorage.removeItem(key)
    } catch {
      /* storage is fully unavailable; nothing else to do */
    }
    return fallback
  }
}

export function writeStorage(key: string, value: unknown): boolean {
  if (!isBrowser()) return false
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function removeStorage(key: string): void {
  if (!isBrowser()) return
  try {
    window.localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}
