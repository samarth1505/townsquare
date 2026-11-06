import { ApiError, ERROR_CODES } from "../http";
import type { NotificationsApi } from "./api";
import { NOTIFICATION_CACHE } from "./constants";
import type { NotificationCache } from "./persistence";
import type { NotificationsAction } from "./reducer";
import type { Store } from "../store";
import type { Notification, NotificationsState } from "./types";

type Dependencies = {
  api: NotificationsApi;
  store: Store<NotificationsState, NotificationsAction>;
  cache?: NotificationCache; // optional: without it the service simply never saves anything
};

// The notification BUSINESS LOGIC: talks to the API and tells the store what happened.
// Framework-free, so the web app and the React Native app share it.
export function createNotificationService({ api, store, cache }: Dependencies) {
  // Bumped by open() and reset(). A response that arrives after the session changed (the user logged out while
  // it was in flight) belongs to the OLD session and must be thrown away, or it would refill the store.
  let generation = 0;
  let activeUserId: string | null = null;
  let stopPersisting: (() => void) | null = null;

  // Saves the list whenever it changes (debounced: ten quick changes cause one write).
  // Only a "ready" list is saved, so an empty/loading/error state never overwrites a good copy.
  function startPersisting(userId: string) {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const unsubscribe = store.subscribe(() => {
      const { status, items } = store.getState();
      if (status !== "ready") return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => void cache?.save(userId, items), NOTIFICATION_CACHE.saveDebounceMs);
    });
    stopPersisting = () => {
      unsubscribe();
      if (timer) clearTimeout(timer);
    };
  }

  // STALE-WHILE-REVALIDATE: show the saved copy immediately, then quietly refresh from the server.
  // No saved copy (first visit, expired, corrupt)? Fall back to the normal load with a skeleton.
  async function open(userId: string): Promise<void> {
    stopPersisting?.();
    stopPersisting = null;
    generation += 1;
    const run = generation;
    activeUserId = userId;

    if (!cache) {
      await load();
      return;
    }
    startPersisting(userId);
    const saved = await cache.load(userId);
    if (run !== generation) return; // logged out / another open() started while we were reading
    if (saved) {
      store.dispatch({ type: "hydrated", items: saved });
      await sync(); // if offline this fails silently and the saved copy stays on screen
    } else {
      await load();
    }
  }

  async function load(): Promise<void> {
    const startedIn = generation;
    store.dispatch({ type: "load/started" });
    try {
      const { items } = await api.list();
      if (startedIn !== generation) return;
      store.dispatch({ type: "load/succeeded", items });
    } catch (err) {
      if (startedIn !== generation) return;
      store.dispatch({
        type: "load/failed",
        code: err instanceof ApiError ? err.code : ERROR_CODES.network,
      });
    }
  }

  // Silent catch-up after a reconnect: fetch what we missed while offline, WITHOUT flashing a loading state.
  // If it fails we keep what we have; the next reconnect tries again.
  async function sync(): Promise<void> {
    const startedIn = generation;
    try {
      const { items } = await api.list();
      if (startedIn !== generation) return;
      store.dispatch({ type: "load/succeeded", items });
    } catch {
      // keep the current list
    }
  }

  // OPTIMISTIC UPDATE: change the UI first, confirm with the server after, undo if the server says no.
  // Returns true when the server accepted it.
  async function markRead(id: string): Promise<boolean> {
    const target = store.getState().items.find((n) => n.id === id);
    if (!target || target.read) return true; // nothing to do
    store.dispatch({ type: "markRead/optimistic", id }); // 1) the user sees it immediately
    try {
      await api.markRead(id); // 2) tell the server
      return true;
    } catch {
      store.dispatch({ type: "markRead/rolledBack", id }); // 3) server refused: put it back
      return false;
    }
  }

  async function markAllRead(): Promise<boolean> {
    const ids = store
      .getState()
      .items.filter((n) => !n.read)
      .map((n) => n.id);
    if (ids.length === 0) return true;
    store.dispatch({ type: "markAllRead/optimistic" });
    try {
      await api.markAllRead();
      return true;
    } catch {
      store.dispatch({ type: "markAllRead/rolledBack", ids }); // restore ONLY the ones that were unread
      return false;
    }
  }

  // Used by the real-time socket: a pushed notification goes through the same reducer (and its de-duplication).
  // Returns true when the notification was NEW (so the UI can show a toast), false for a duplicate.
  function receive(notification: Notification): boolean {
    const before = store.getState().items;
    store.dispatch({ type: "received", notification });
    return store.getState().items !== before; // the reducer returns the SAME state for a duplicate
  }

  // Logout: forget everything, INCLUDING the saved copy (a shared computer must not keep the last user's data).
  function reset(): void {
    generation += 1;
    stopPersisting?.();
    stopPersisting = null;
    if (activeUserId) void cache?.clear(activeUserId);
    activeUserId = null;
    store.dispatch({ type: "reset" });
  }

  return { open, load, sync, markRead, markAllRead, receive, reset };
}

export type NotificationService = ReturnType<typeof createNotificationService>;
