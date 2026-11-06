export const NOTIFICATION_ENDPOINTS = {
  list: "/notifications",
  readAll: "/notifications/read-all",
  read: (id: string) => `/notifications/${encodeURIComponent(id)}/read`,
  // Push: the phone tells the server which device token belongs to the logged-in user (and removes it on logout).
  registerDevice: "/notifications/devices",
  unregisterDevice: "/notifications/devices/remove",
} as const;

// The saved copy of the list (so the screen has something to show before the network answers).
export const NOTIFICATION_CACHE = {
  keyPrefix: "hub.notifications.", // + userId: one entry PER USER, never shared
  version: 1, // bump when the stored shape changes: old entries are then ignored
  maxAgeMs: 7 * 24 * 60 * 60 * 1000, // older than a week: don't show it
  saveDebounceMs: 250, // many quick changes -> one write
} as const;

// Message types the server pushes over the WebSocket (the API app keeps the same strings).
export const NOTIFICATION_EVENTS = {
  created: "notification.created",
} as const;
