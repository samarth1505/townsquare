import { useEffect } from "react";
import { AppState } from "react-native";
import { useAuth } from "@/features/auth";
import { selectUnreadCount } from "@hub/core";
import { registerForPush, setAppIconBadge } from "@/shared/lib/pushRegistration";
import { notificationService, notificationStore } from "@/shared/lib/notificationService";
import { notificationRealtime } from "@/shared/lib/realtime";
import { clearToasts } from "@/shared/lib/toasts";
import { useUnreadCount } from "./useUnreadCount";

// Ties the notification data to the LOGGED-IN USER, exactly like the web hook: load when a user is present, wipe
// everything when they log out (so the next person on this phone never sees someone else's notifications).
export function useNotificationsLifecycle() {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;
  const unreadCount = useUnreadCount();

  // Push: if the user already allowed notifications, make sure the server knows this phone's token (it can change,
  // so this runs at every sign-in / app start, not just once). It never shows the permission prompt.
  useEffect(() => {
    if (userId !== null) void registerForPush();
  }, [userId]);

  // The number on the APP ICON follows the unread count (0 clears it, and logout resets it so it cannot show the
  // previous user's number). It silently does nothing when notifications are not allowed.
  useEffect(() => {
    void setAppIconBadge(userId === null ? 0 : unreadCount);
  }, [userId, unreadCount]);

  useEffect(() => {
    if (userId === null) {
      notificationService.reset(); // also deletes the saved copy from storage
      clearToasts();
      return;
    }
    void notificationService.open(userId); // saved copy first, then a quiet refresh from the server
  }, [userId]);

  // The live connection. The phone adds ONE thing the browser tab does not have: the app goes to the BACKGROUND.
  // iOS suspends a backgrounded app within seconds and kills its sockets, so we close it ourselves, and on return we
  // reconnect AND fetch what we missed. (Reaching a user whose app is closed is the job of PUSH notifications.)
  useEffect(() => {
    if (userId === null) return;
    notificationRealtime.start(); // does nothing if it is already running
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        void setAppIconBadge(selectUnreadCount(notificationStore.getState())); // permission may have changed in Settings
        notificationRealtime.start();
        void notificationService.sync(); // a fresh socket only brings NEW events; this catches up on the gap
      } else if (state === "background") {
        // The icon number matters most the moment the user leaves, so apply the current count again here.
        void setAppIconBadge(selectUnreadCount(notificationStore.getState()));
        notificationRealtime.stop();
      }
    });
    return () => {
      subscription.remove();
      notificationRealtime.stop();
    };
  }, [userId]);
}
