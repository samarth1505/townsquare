import { useEffect } from "react";
import { useAuth } from "@/features/auth";
import { notificationService } from "@/shared/lib/notificationService";
import { notificationRealtime } from "@/shared/lib/realtime";
import { clearToasts } from "@/shared/lib/toasts";

// Ties the notification data to the LOGGED-IN USER: load when a user is present, wipe it when they log out
// (so the next person on this browser never sees someone else's notifications).
export function useNotificationsLifecycle() {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;

  useEffect(() => {
    if (userId === null) {
      notificationService.reset(); // also deletes the saved copy from storage
      clearToasts(); // a leftover toast must not show up for the NEXT person
      return;
    }
    void notificationService.open(userId); // saved copy first, then a quiet refresh from the server
  }, [userId]);

  // The live connection has the same lifetime: open while logged in, closed on logout.
  useEffect(() => {
    if (userId === null) return;
    notificationRealtime.start();
    // When the browser regains network, don't wait for the backoff timer.
    const handleOnline = () => notificationRealtime.retryNow();
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("online", handleOnline);
      notificationRealtime.stop();
    };
  }, [userId]);
}
