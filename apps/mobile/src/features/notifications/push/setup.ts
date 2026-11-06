import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { notificationRealtime } from "@/shared/lib/realtime";

// Android 8+ requires every notification to belong to a CHANNEL (the user can mute a channel in system settings).
const ANDROID_CHANNEL_ID = "default";

// Called ONCE at module load (see app/_layout.tsx): the handler must exist before any notification can arrive.
export function configurePushHandling(): void {
  // What to do with a push that arrives while the app is OPEN. When the live socket is connected the in-app banner
  // already shows the same notification, so a second system banner would be a duplicate. Only when the socket is down
  // is the system banner the user's one chance to see it.
  Notifications.setNotificationHandler({
    handleNotification: async () => {
      const showSystemBanner = notificationRealtime.status.getState() !== "open";
      return {
        shouldShowBanner: showSystemBanner,
        shouldShowList: showSystemBanner,
        shouldPlaySound: false,
        shouldSetBadge: false,
      };
    },
  });

  if (Platform.OS === "android") {
    void Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: "General",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}
