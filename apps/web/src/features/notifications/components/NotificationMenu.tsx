import { useId, useRef, useState } from "react";
import { useDismissable } from "@/shared/hooks/useDismissable";
import { useNotifications } from "../hooks/useNotifications";
import NotificationBell from "./NotificationBell";
import NotificationPanel from "./NotificationPanel";

// The bell + its dropdown. Accessibility: the button toggles the panel (aria-expanded / aria-controls),
// Escape closes it and returns focus to the bell, and clicking outside closes it.
export default function NotificationMenu() {
  const { unreadCount } = useNotifications();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useDismissable(
    containerRef,
    (reason) => {
      setOpen(false);
      if (reason === "escape") bellRef.current?.focus(); // return focus to where the user was
    },
    open,
  );

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      <NotificationBell
        ref={bellRef}
        count={unreadCount}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((current) => !current)}
      />
      {open && <NotificationPanel id={panelId} />}
    </div>
  );
}
