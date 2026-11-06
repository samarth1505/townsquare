import { useCallback, useState } from "react";
import { useConnectionStatus } from "./useConnectionStatus";
import { useNotifications } from "./useNotifications";

// State + orchestration for the notifications SCREEN; the component only draws.
export function useNotificationsScreen() {
  const { items, status, unreadCount, markRead, markAllRead, reload, refresh } = useNotifications();
  const connection = useConnectionStatus();
  const [saveFailed, setSaveFailed] = useState(false);
  const [pullRefreshing, setPullRefreshing] = useState(false); // our own flag, as in the feed screen

  // The service updates the row at once (optimistic) and returns false if the server refused and it rolled back.
  const select = useCallback(
    async (id: string) => {
      setSaveFailed(false);
      if (!(await markRead(id))) setSaveFailed(true);
    },
    [markRead],
  );

  const selectAll = useCallback(async () => {
    setSaveFailed(false);
    if (!(await markAllRead())) setSaveFailed(true);
  }, [markAllRead]);

  const pullToRefresh = useCallback(async () => {
    setPullRefreshing(true);
    try {
      await refresh();
    } finally {
      setPullRefreshing(false);
    }
  }, [refresh]);

  return {
    items,
    unreadCount,
    // "loading" shows the skeleton only when there is nothing to show yet; a saved copy is shown straight away.
    isLoading: (status === "idle" || status === "loading") && items.length === 0,
    isError: status === "error" && items.length === 0,
    isLive: connection === "open",
    isReconnecting: connection === "reconnecting",
    saveFailed,
    pullRefreshing,
    select,
    selectAll,
    pullToRefresh,
    reload,
  };
}
