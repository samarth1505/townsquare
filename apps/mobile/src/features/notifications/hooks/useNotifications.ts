import { useCallback } from "react";
import {
  selectErrorCode,
  selectItems,
  selectStatus,
  selectUnreadCount,
  useStoreSelector,
} from "@hub/core";
import { notificationService, notificationStore } from "@/shared/lib/notificationService";

// The one hook the notifications SCREEN uses. It is the web's useNotifications minus the analytics call: each value
// comes from its own selector, and the actions are stable functions so memo'd rows are not re-rendered.
export function useNotifications() {
  const items = useStoreSelector(notificationStore, selectItems);
  const status = useStoreSelector(notificationStore, selectStatus);
  const errorCode = useStoreSelector(notificationStore, selectErrorCode);
  const unreadCount = useStoreSelector(notificationStore, selectUnreadCount);

  const markRead = useCallback((id: string) => notificationService.markRead(id), []);
  const markAllRead = useCallback(() => notificationService.markAllRead(), []);
  const reload = useCallback(() => notificationService.load(), []);
  const refresh = useCallback(() => notificationService.sync(), []); // quiet: no loading state, keeps the list

  return { items, status, errorCode, unreadCount, markRead, markAllRead, reload, refresh };
}
