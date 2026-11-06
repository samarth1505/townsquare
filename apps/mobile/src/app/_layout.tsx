import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, ConnectionProblemScreen, useAuth } from "@/features/auth";
import {
  configurePushHandling,
  NotificationBanner,
  PushNavigator,
  useNotificationsLifecycle,
} from "@/features/notifications";
import { queryClient } from "@/shared/lib/queryClient";

// Keep the NATIVE splash screen on top until we know whether the user is signed in. It must be called at module level
// (not inside a component), or it can run too late. Without this the app would flash the login screen for a moment
// before jumping to the home screen of a user who was already signed in.
void SplashScreen.preventAutoHideAsync();
configurePushHandling(); // also module level: the notification handler must exist before any push can arrive

// The ROUTE TABLE of the app, by file name (Expo Router is file-based):
//   src/app/_layout.tsx  -> this file: wraps every screen (providers, the navigator)
//   src/app/(tabs)/     -> a GROUP: the three bottom tabs, "/" (feed), "/notifications" and "/account"
//   src/app/login.tsx    -> the "/login" screen
// Files in src/app are THIN: each one just renders a screen from a feature folder.
function RootNavigator() {
  const { status, retryRestore } = useAuth();
  const isReady = status !== "restoring";

  useNotificationsLifecycle(); // loads + connects while a user is signed in, wipes everything when they sign out

  useEffect(() => {
    if (isReady) SplashScreen.hide(); // the answer is known: reveal the app
  }, [isReady]);

  useEffect(() => {
    // Cached server data belongs to the person who fetched it. When they sign out, forget it all, or the next person
    // who logs in on this phone could briefly see the previous person's feed.
    if (status === "signedOut") queryClient.clear();
  }, [status]);

  if (!isReady) return null; // the splash screen is still covering the app
  if (status === "unreachable") return <ConnectionProblemScreen onRetry={retryRestore} />;

  const isLoggedIn = status === "signedIn";
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Stack.Protected: when `guard` is false the screen CANNOT be reached, and if the user is on it, the router moves
          them to `redirectTo`. Logging in or out just flips `isLoggedIn`, and the navigation follows by itself. This is
          UX only (as on the web): the server still decides what data a user may get. */}
        <Stack.Protected
          guard={isLoggedIn}
          redirectTo="/login"
        >
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>
        <Stack.Protected
          guard={!isLoggedIn}
          redirectTo="/"
        >
          <Stack.Screen name="login" />
        </Stack.Protected>
      </Stack>
      {isLoggedIn ? (
        <>
          <NotificationBanner />
          <PushNavigator />
        </>
      ) : null}
    </>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StatusBar style="auto" />
        <RootNavigator />
      </AuthProvider>
    </QueryClientProvider>
  );
}
