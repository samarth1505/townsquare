import { useCallback } from "react";
import { selectErrorCode, selectItems, selectStatus, selectUnreadCount } from "@hub/core";
import { useStoreSelector } from "@/shared/hooks/useStoreSelector";
import { analytics } from "@/shared/lib/monitoring";
import { notificationService, notificationStore } from "@/shared/lib/notificationService";

// The one hook the UI uses. Each value comes from its OWN selector, so a component re-renders only when a value
// it actually reads changes. Actions are stable functions (useCallback), so memo'd rows are not re-rendered.
export function useNotifications() {
  const items = useStoreSelector(notificationStore, selectItems);
  const status = useStoreSelector(notificationStore, selectStatus);
  const errorCode = useStoreSelector(notificationStore, selectErrorCode);
  const unreadCount = useStoreSelector(notificationStore, selectUnreadCount);

  // Analytics is recorded here (orchestration), not in the component. It counts only a REAL change: marking an
  // item that was already read, or a request the server refused, is not an event.
  const markRead = useCallback(async (id: string) => {
    const wasUnread = notificationStore.getState().items.some((n) => n.id === id && !n.read);
    const ok = await notificationService.markRead(id);
    if (ok && wasUnread) analytics.track("notification_marked_read", { source: "item" });
    return ok;
  }, []);

  const markAllRead = useCallback(async () => {
    const hadUnread = selectUnreadCount(notificationStore.getState()) > 0;
    const ok = await notificationService.markAllRead();
    if (ok && hadUnread) analytics.track("notification_marked_read", { source: "all" });
    return ok;
  }, []);

  return {
    items,
    status,
    errorCode,
    unreadCount,
    reload: notificationService.load,
    markRead,
    markAllRead,
  };
}
