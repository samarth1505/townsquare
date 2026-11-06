import { selectUnreadCount, useStoreSelector } from "@hub/core";
import { notificationStore } from "@/shared/lib/notificationService";

// Only the number, as a primitive: the tab bar re-renders when the count changes, not on every store update.
export function useUnreadCount(): number {
  return useStoreSelector(notificationStore, selectUnreadCount);
}
