import type { NotificationsState } from "./types";

// Selectors: small functions that pick a value out of the state. Components subscribe to ONE of them, so they
// re-render only when THAT value changes (the same idea as Redux's useSelector).
export const selectItems = (state: NotificationsState) => state.items;
export const selectStatus = (state: NotificationsState) => state.status;
export const selectErrorCode = (state: NotificationsState) => state.errorCode;
export const selectUnreadCount = (state: NotificationsState) =>
  state.items.reduce((count, n) => (n.read ? count : count + 1), 0);
