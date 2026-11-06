import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";
import { NOTIFICATION_MESSAGES } from "../messages";
import BellIcon from "./BellIcon";

type NotificationBellProps = ComponentProps<"button"> & {
  count: number; // unread notifications
};

// A bell button with an unread badge, styled with TAILWIND utility classes.
// The badge is visual only (aria-hidden); the button's accessible name announces the count.
export default function NotificationBell({ count, className, ...rest }: NotificationBellProps) {
  const label = count > 0 ? NOTIFICATION_MESSAGES.bellWithCount(count) : NOTIFICATION_MESSAGES.bell;

  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "relative inline-flex items-center justify-center rounded-lg border border-transparent p-2",
        "text-app-text hover:bg-app-bg focus-visible:outline-2 focus-visible:outline-app-primary",
        className,
      )}
      {...rest}
    >
      <BellIcon />
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute -top-0.5 -right-0.5 min-w-[18px] rounded-full bg-app-danger px-1.5 text-center text-[0.7rem] leading-[18px] font-bold text-white"
        >
          {count > 99 ? NOTIFICATION_MESSAGES.overflowBadge : count}
        </span>
      )}
    </button>
  );
}
