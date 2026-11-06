import { NOTIFICATION_EVENTS } from "./constants";
import { isNotification } from "./guards";
import type { Notification } from "./types";

// A socket message is UNTRUSTED input (any server bug, or anyone able to inject frames, can send anything).
// Check the shape before it reaches the store; return null for anything we don't understand.
export function parseNotificationEvent(data: unknown): Notification | null {
  if (typeof data !== "object" || data === null) return null;
  const message = data as Record<string, unknown>;
  if (message.type !== NOTIFICATION_EVENTS.created) return null;
  return isNotification(message.notification) ? message.notification : null;
}
