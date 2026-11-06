import { NOTIFICATION_CACHE } from "./constants";
import { isNotification } from "./guards";
import type { Notification } from "./types";

// WHERE the bytes are kept is a platform detail: localStorage on web, AsyncStorage/MMKV on React Native.
// core only describes what it needs. It is async so that every platform's storage fits (some are async).
export interface KeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export interface NotificationCache {
  load(userId: string): Promise<Notification[] | null>;
  save(userId: string, items: Notification[]): Promise<void>;
  clear(userId: string): Promise<void>;
}

// What we write:  { v: 1, savedAt: <ms>, items: [...] }   (a version and a timestamp make invalidation possible)
export function createNotificationCache(
  storage: KeyValueStorage,
  now: () => number = Date.now,
): NotificationCache {
  const keyFor = (userId: string) => `${NOTIFICATION_CACHE.keyPrefix}${userId}`;

  return {
    // Storage is UNTRUSTED too: it may hold an old version, be corrupt, or be hand-edited. Any doubt -> null,
    // and the app simply fetches from the server as if nothing was saved.
    async load(userId) {
      try {
        const raw = await storage.getItem(keyFor(userId));
        if (!raw) return null;
        const data: unknown = JSON.parse(raw);
        if (typeof data !== "object" || data === null) return null;
        const { v, savedAt, items } = data as Record<string, unknown>;
        if (v !== NOTIFICATION_CACHE.version) return null;
        if (typeof savedAt !== "number" || now() - savedAt > NOTIFICATION_CACHE.maxAgeMs) {
          return null;
        }
        if (!Array.isArray(items)) return null;
        return items.filter(isNotification); // drop any entry that is not a valid notification
      } catch {
        return null; // corrupt JSON, storage blocked (private mode)...
      }
    },

    async save(userId, items) {
      try {
        const entry = { v: NOTIFICATION_CACHE.version, savedAt: now(), items };
        await storage.setItem(keyFor(userId), JSON.stringify(entry));
      } catch {
        // storage full or blocked: the cache is an optimisation, never a reason to fail
      }
    },

    async clear(userId) {
      try {
        await storage.removeItem(keyFor(userId));
      } catch {
        // nothing to do
      }
    },
  };
}
