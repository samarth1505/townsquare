import { useStoreSelector } from "@hub/core";
import { notificationRealtime } from "@/shared/lib/realtime";

// "idle" | "connecting" | "open" | "reconnecting": a primitive string, so the snapshot is stable.
export function useConnectionStatus() {
  return useStoreSelector(notificationRealtime.status, (status) => status);
}
