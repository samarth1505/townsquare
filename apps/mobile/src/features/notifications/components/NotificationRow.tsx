import { memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import type { Notification } from "@hub/core";
import AppText from "@/shared/components/AppText";
import { formatRelativeTime } from "@/shared/lib/formatRelativeTime";
import { MIN_TOUCH_TARGET, space } from "@/shared/theme/tokens";
import { useTheme } from "@/shared/theme/useTheme";
import { NOTIFICATION_MESSAGES } from "../messages";

type NotificationRowProps = {
  notification: Notification;
  onSelect: (id: string) => void;
};

// One row. memo() + the stable `onSelect` from the hook mean a row re-renders only when ITS notification changes.
function NotificationRow({ notification, onSelect }: NotificationRowProps) {
  const colors = useTheme();
  const unread = !notification.read;

  return (
    <Pressable
      accessibilityRole="button"
      // A screen reader reads the label instead of the visible children, so the "unread" state (shown on screen by
      // a dot and bold text only) has to be spelled out in it.
      accessibilityLabel={`${unread ? `${NOTIFICATION_MESSAGES.unread}. ` : ""}${notification.title}. ${notification.body}`}
      accessibilityHint={unread ? NOTIFICATION_MESSAGES.markHint : undefined}
      onPress={() => onSelect(notification.id)}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: unread ? `${colors.primary}1A` : colors.surface },
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[styles.dot, { backgroundColor: unread ? colors.primary : "transparent" }]}
        importantForAccessibility="no-hide-descendants"
      />
      <View style={styles.text}>
        <AppText style={{ fontWeight: unread ? "700" : "400" }}>{notification.title}</AppText>
        <AppText variant="muted">{notification.body}</AppText>
        <AppText
          variant="muted"
          style={styles.time}
        >
          {formatRelativeTime(notification.createdAt)}
        </AppText>
      </View>
    </Pressable>
  );
}

export default memo(NotificationRow);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: space.md,
    minHeight: MIN_TOUCH_TARGET,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  pressed: { opacity: 0.7 },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: space.sm },
  text: { flex: 1, gap: 2 },
  time: { fontSize: 12, marginTop: space.xs },
});
