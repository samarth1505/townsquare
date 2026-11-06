import type { Notification, NotificationsState } from "./types";

// Every way the state can change, as a plain object. (This is the "action" in reducer / Redux.)
export type NotificationsAction =
  | { type: "load/started" }
  | { type: "load/succeeded"; items: Notification[] }
  | { type: "load/failed"; code: string }
  | { type: "hydrated"; items: Notification[] } // the saved copy, shown before the network answers
  | { type: "received"; notification: Notification }
  | { type: "markRead/optimistic"; id: string }
  | { type: "markRead/rolledBack"; id: string }
  | { type: "markAllRead/optimistic" }
  | { type: "markAllRead/rolledBack"; ids: string[] }
  | { type: "reset" };

export const initialNotificationsState: NotificationsState = {
  status: "idle",
  items: [],
  errorCode: null,
};

const newestFirst = (items: Notification[]) =>
  [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt)); // copy first: sort() mutates

// Returns the SAME state object when nothing changed, so subscribers are not woken up for no reason.
function setRead(
  state: NotificationsState,
  matches: (n: Notification) => boolean,
  read: boolean,
): NotificationsState {
  let changed = false;
  const items = state.items.map((n) => {
    if (!matches(n) || n.read === read) return n; // untouched items keep their identity
    changed = true;
    return { ...n, read };
  });
  return changed ? { ...state, items } : state;
}

// A reducer is a PURE function: (state, action) -> new state. No fetching, no timers, no mutation.
// That makes it trivial to test and safe to share between web and React Native.
export function notificationsReducer(
  state: NotificationsState,
  action: NotificationsAction,
): NotificationsState {
  switch (action.type) {
    case "load/started":
      return { ...state, status: "loading", errorCode: null };
    case "load/succeeded":
      return { status: "ready", items: newestFirst(action.items), errorCode: null };
    case "load/failed":
      return { ...state, status: "error", errorCode: action.code };
    case "hydrated":
      return { status: "ready", items: newestFirst(action.items), errorCode: null };
    case "received": {
      // DE-DUPLICATE: the same notification can arrive twice (REST + socket, or a socket reconnect).
      if (state.items.some((n) => n.id === action.notification.id)) return state;
      return { ...state, items: newestFirst([action.notification, ...state.items]) };
    }
    case "markRead/optimistic":
      return setRead(state, (n) => n.id === action.id, true);
    case "markRead/rolledBack":
      return setRead(state, (n) => n.id === action.id, false);
    case "markAllRead/optimistic":
      return setRead(state, () => true, true);
    case "markAllRead/rolledBack":
      return setRead(state, (n) => action.ids.includes(n.id), false);
    case "reset":
      return initialNotificationsState;
  }
}
