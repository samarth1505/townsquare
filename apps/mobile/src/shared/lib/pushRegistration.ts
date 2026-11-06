import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { notificationsApi } from "./apiClient";

// Why a push token is not available. "no-project-id": the app is not linked to an EAS project yet (the token is issued
// per project). "failed": no network, a simulator, or the OS/Expo refused.
export type PushRegistrationResult =
  | { status: "registered" }
  | { status: "not-granted" }
  | { status: "unavailable"; reason: "no-project-id" | "failed" };

// The token this phone registered with the server, kept so that logout can remove exactly that one.
let registeredToken: string | null = null;

// Registers this phone for push IF the user already allowed notifications. It never shows the permission prompt
// itself: asking is a UX decision made in a screen, at a moment the user understands why.
export async function registerForPush(): Promise<PushRegistrationResult> {
  const permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) return { status: "not-granted" };

  const projectId: string | undefined =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) return { status: "unavailable", reason: "no-project-id" };

  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    await notificationsApi.registerDevice(token); // the server links this token to the logged-in user
    registeredToken = token;
    return { status: "registered" };
  } catch {
    return { status: "unavailable", reason: "failed" };
  }
}

// Logout: tell the server to stop pushing to this phone for this user. Best effort and NOT awaited by the caller:
// the user must be signed out on screen immediately. (The server also moves a token to whoever registers it next, so
// a missed call cannot leak notifications to the next person.) It must START before the access token is cleared.
export async function unregisterFromPush(): Promise<void> {
  const token = registeredToken;
  registeredToken = null;
  if (!token) return;
  try {
    await notificationsApi.unregisterDevice(token);
  } catch {
    // offline: the server-side "last registration wins" rule still protects the next user
  }
}

// The number on the APP ICON. Measured on iOS: before the user allows notifications, setBadgeCountAsync returns false (the
// OS refuses it); after, it returns true. So it must be applied again at the moments that can change that: a count
// change, the permission being granted, leaving the app, and coming back from the Settings app.
export async function setAppIconBadge(count: number): Promise<void> {
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch {
    // not supported on this platform: nothing to show
  }
}
