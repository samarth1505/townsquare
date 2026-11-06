import { cn } from "@/shared/lib/cn";
import { useConnectionStatus } from "../hooks/useConnectionStatus";
import { NOTIFICATION_MESSAGES } from "../messages";

// A small dot beside the panel title: green = live, amber = reconnecting, nothing otherwise.
// Colour alone is not accessible (colour-blind users, screen readers), so the state is ALSO in text:
// `title` for a mouse hover and a visually hidden label (`sr-only`) for screen readers.
export default function ConnectionDot() {
  const status = useConnectionStatus();
  if (status !== "open" && status !== "reconnecting") return null;

  const live = status === "open";
  return (
    <span
      className={cn("inline-block size-2 rounded-full", live ? "bg-green-500" : "bg-amber-500")}
      title={live ? NOTIFICATION_MESSAGES.live : NOTIFICATION_MESSAGES.reconnecting}
    >
      <span className="sr-only">
        {live ? NOTIFICATION_MESSAGES.live : NOTIFICATION_MESSAGES.reconnecting}
      </span>
    </span>
  );
}
