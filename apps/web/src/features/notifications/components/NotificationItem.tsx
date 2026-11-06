import { memo } from "react";
import type { Notification } from "@hub/core";
import { cn } from "@/shared/lib/cn";
import { formatRelativeTime } from "@/shared/lib/formatRelativeTime";
import { NOTIFICATION_MESSAGES } from "../messages";

type NotificationItemProps = {
  notification: Notification;
  onSelect: (id: string) => void;
};

// One row. `data-unread` drives the styling through a Tailwind data-attribute variant:
//   data-[unread=true]:bg-app-primary/10   = "when the attribute data-unread equals true, tint the background".
function NotificationItem({ notification, onSelect }: NotificationItemProps) {
  const unread = !notification.read;

  return (
    <li>
      <button
        type="button"
        data-unread={unread}
        onClick={() => onSelect(notification.id)}
        className={cn(
          "flex w-full items-start gap-3 px-4 py-3 text-left",
          "hover:bg-app-bg focus-visible:bg-app-bg focus-visible:outline-none",
          "data-[unread=true]:bg-app-primary/10",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "mt-1.5 size-2 shrink-0 rounded-full",
            unread ? "bg-app-primary" : "bg-transparent",
          )}
        />
        <span className="min-w-0 flex-1">
          <span
            className={cn("block text-sm text-app-text", unread ? "font-semibold" : "font-normal")}
          >
            {notification.title}
          </span>
          <span className="block text-sm text-app-muted">{notification.body}</span>
          <time
            dateTime={notification.createdAt}
            className="mt-1 block text-xs text-app-muted"
          >
            {formatRelativeTime(notification.createdAt)}
          </time>
        </span>
        {unread && <span className="sr-only">{NOTIFICATION_MESSAGES.unread}</span>}
      </button>
    </li>
  );
}

export default memo(NotificationItem);
