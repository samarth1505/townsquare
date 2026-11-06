import { useCallback, useEffect, useState } from "react";
import { AppState, Linking } from "react-native";
import * as Notifications from "expo-notifications";
import { selectUnreadCount } from "@hub/core";
import { notificationStore } from "@/shared/lib/notificationService";
import { registerForPush, setAppIconBadge } from "@/shared/lib/pushRegistration";

// "unknown"      = still asking the OS
// "undetermined" = never asked: we may show the system prompt (it appears ONCE per install on iOS)
// "granted"      = allowed
// "denied"       = refused: the system prompt will not appear again, only the Settings app can change it
export type PushPermission = "unknown" | "undetermined" | "granted" | "denied";

async function readPermission(): Promise<PushPermission> {
  const result = await Notifications.getPermissionsAsync();
  return result.granted ? "granted" : result.canAskAgain ? "undetermined" : "denied";
}

export function usePushPermission() {
  const [permission, setPermission] = useState<PushPermission>("unknown");

  useEffect(() => {
    void readPermission().then(setPermission);
    // The user may have switched it in the Settings app and come back: re-read when the app becomes active again.
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void readPermission().then(setPermission);
    });
    return () => subscription.remove();
  }, []);

  const request = useCallback(async () => {
    const result = await Notifications.requestPermissionsAsync();
    setPermission(result.granted ? "granted" : "denied");
    if (result.granted) {
      void registerForPush();
      void setAppIconBadge(selectUnreadCount(notificationStore.getState())); // show the current count right away
    }
  }, []);

  const openSettings = useCallback(() => void Linking.openSettings(), []);

  return { permission, request, openSettings };
}
