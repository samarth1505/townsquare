import { useEffect } from "react";
import { AccessibilityInfo, Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TOAST_DURATION_MS, useStoreSelector } from "@hub/core";
import AppText from "@/shared/components/AppText";
import { dismissToast, toastStore } from "@/shared/lib/toasts";
import { radius, space } from "@/shared/theme/tokens";
import { useTheme } from "@/shared/theme/useTheme";
import { NOTIFICATION_MESSAGES } from "../messages";

// The IN-APP banner: shown when a notification arrives over the socket while the app is open. It floats above every
// screen, so it is mounted once at the root. Tapping it opens the notifications tab; it also goes away by itself.
export default function NotificationBanner() {
  const colors = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets(); // the notch / status bar height, so the banner is not hidden under it
  const toast = useStoreSelector(toastStore, (toasts) => toasts[toasts.length - 1] ?? null);
  const toastId = toast?.id ?? null;
  const title = toast?.title;

  useEffect(() => {
    if (toastId === null) return;
    // VoiceOver/TalkBack users cannot see a banner appear, so say it out loud.
    if (title) AccessibilityInfo.announceForAccessibility(title);
    const timer = setTimeout(() => dismissToast(toastId), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toastId, title]);

  if (!toast) return null;

  return (
    <View
      pointerEvents="box-none" // the empty area around the banner must not block touches on the screen below
      style={[styles.layer, { top: insets.top + space.sm }]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${toast.title}. ${toast.body ?? ""}`}
        onPress={() => {
          dismissToast(toast.id);
          router.navigate("/notifications");
        }}
        style={[styles.banner, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <View style={styles.text}>
          <AppText variant="label">{toast.title}</AppText>
          {toast.body ? <AppText variant="muted">{toast.body}</AppText> : null}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={NOTIFICATION_MESSAGES.dismiss}
          hitSlop={space.md}
          onPress={() => dismissToast(toast.id)}
        >
          <AppText variant="muted">✕</AppText>
        </Pressable>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: { position: "absolute", left: space.lg, right: space.lg, zIndex: 10 },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    padding: space.md,
    borderWidth: 1,
    borderRadius: radius,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4, // Android draws shadows with `elevation`; iOS uses the shadow* props above
  },
  text: { flex: 1, gap: 2 },
});
