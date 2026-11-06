import { useCallback, useState } from "react";
import { useOnlineStatus } from "@/shared/hooks/useOnlineStatus";
import { useConnectionStatus } from "../hooks/useConnectionStatus";
import { useNotifications } from "../hooks/useNotifications";
import { NOTIFICATION_MESSAGES } from "../messages";
import ConnectionDot from "./ConnectionDot";
import NotificationItem from "./NotificationItem";

const SKELETON_ROWS = 3;

// The dropdown content. It shows one of four states: loading, error, empty, or the list.
export default function NotificationPanel({ id }: { id: string }) {
  const { items, status, unreadCount, reload, markRead, markAllRead } = useNotifications();
  const connection = useConnectionStatus();
  const online = useOnlineStatus();
  const [saveFailed, setSaveFailed] = useState(false);

  // Stable function (useCallback) so the memo'd NotificationItem rows are not re-rendered needlessly.
  const handleSelect = useCallback(
    async (itemId: string) => {
      const ok = await markRead(itemId);
      setSaveFailed(!ok); // the update was already ROLLED BACK by the service; tell the user why
    },
    [markRead],
  );

  async function handleMarkAll() {
    setSaveFailed(!(await markAllRead()));
  }

  return (
    <div
      id={id}
      role="region"
      aria-label={NOTIFICATION_MESSAGES.panelTitle}
      className="absolute top-full right-0 z-20 mt-2 w-80 max-w-[90vw] rounded-lg border border-app-border bg-app-surface shadow-lg"
    >
      <div className="flex items-center justify-between border-b border-app-border px-4 py-3">
        <div className="flex items-center gap-2">
          <h2 className="m-0 text-sm font-semibold">{NOTIFICATION_MESSAGES.panelTitle}</h2>
          <ConnectionDot />
        </div>
        <button
          type="button"
          onClick={handleMarkAll}
          disabled={unreadCount === 0}
          className="text-xs font-medium text-app-primary underline disabled:cursor-not-allowed disabled:no-underline disabled:opacity-50"
        >
          {NOTIFICATION_MESSAGES.markAllRead}
        </button>
      </div>

      {(!online || connection === "reconnecting") && (
        <p
          role="status"
          className="m-0 border-b border-app-border bg-app-bg px-4 py-2 text-xs text-app-muted"
        >
          {online ? NOTIFICATION_MESSAGES.reconnecting : NOTIFICATION_MESSAGES.offline}
        </p>
      )}

      {saveFailed && (
        <p
          role="alert"
          className="m-0 border-b border-app-border px-4 py-2 text-xs text-app-danger"
        >
          {NOTIFICATION_MESSAGES.saveFailed}
        </p>
      )}

      <div className="max-h-96 overflow-y-auto">
        {status === "loading" || status === "idle" ? (
          <div
            aria-busy="true"
            className="space-y-3 p-4"
          >
            {Array.from({ length: SKELETON_ROWS }, (_, i) => (
              <div
                key={i}
                className="h-10 animate-pulse rounded-lg bg-app-border"
              />
            ))}
          </div>
        ) : status === "error" ? (
          <div
            role="alert"
            className="p-4 text-sm"
          >
            <p className="m-0 text-app-danger">{NOTIFICATION_MESSAGES.loadError}</p>
            <button
              type="button"
              onClick={() => void reload()}
              className="mt-2 text-app-primary underline"
            >
              {NOTIFICATION_MESSAGES.retry}
            </button>
          </div>
        ) : items.length === 0 ? (
          <p className="m-0 p-4 text-sm text-app-muted">{NOTIFICATION_MESSAGES.empty}</p>
        ) : (
          <ul className="m-0 list-none divide-y divide-app-border p-0">
            {items.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onSelect={handleSelect}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
