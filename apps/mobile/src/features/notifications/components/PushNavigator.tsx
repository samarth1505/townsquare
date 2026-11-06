import { useEffect } from "react";
import { useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import { parsePushTarget } from "../push/target";

// A notification we already navigated for. Module-level on purpose: this component unmounts at logout and mounts again
// at login, and the SAME last tap must not move the user a second time.
let handledNotificationId: string | null = null;

// Turns a TAP on a push notification into navigation. Rendered only while signed in, so a tap that arrives while the
// user is signed out is not lost: it stays the "last response" and is handled right after login.
// useLastNotificationResponse covers both cases: the app was already running, and the tap LAUNCHED the app (cold start).
export default function PushNavigator() {
  const router = useRouter();
  const response = Notifications.useLastNotificationResponse();

  useEffect(() => {
    if (!response) return;
    if (response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return; // ignore dismiss / custom actions
    const { identifier, content } = response.notification.request;
    if (identifier === handledNotificationId) return;
    handledNotificationId = identifier;

    const target = parsePushTarget(content.data);
    if (target) router.navigate(target);
  }, [response, router]);

  return null;
}
