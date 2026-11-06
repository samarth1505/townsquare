import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import type { Notification } from "@hub/core";
import AppText from "@/shared/components/AppText";
import Button from "@/shared/components/Button";
import Screen from "@/shared/components/Screen";
import { space } from "@/shared/theme/tokens";
import { useTheme } from "@/shared/theme/useTheme";
import { useNotificationsScreen } from "../hooks/useNotificationsScreen";
import { NOTIFICATION_MESSAGES } from "../messages";
import NotificationRow from "./NotificationRow";
import PushPermissionRow from "./PushPermissionRow";

const getId = (notification: Notification) => notification.id; // module level: same function every render

function Separator() {
  const colors = useTheme();
  return <View style={[styles.separator, { backgroundColor: colors.border }]} />;
}

export default function NotificationsScreen() {
  const colors = useTheme();
  const screen = useNotificationsScreen();

  return (
    <Screen scroll={false}>
      <View style={styles.header}>
        <AppText variant="title">{NOTIFICATION_MESSAGES.title}</AppText>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: screen.isLive ? colors.primary : colors.textMuted },
            ]}
          />
          <AppText
            variant="muted"
            accessibilityLiveRegion="polite"
          >
            {screen.isReconnecting
              ? NOTIFICATION_MESSAGES.reconnecting
              : screen.isLive
                ? NOTIFICATION_MESSAGES.live
                : ""}
          </AppText>
        </View>
        <PushPermissionRow />
        <Button
          label={NOTIFICATION_MESSAGES.markAllRead}
          variant="secondary"
          disabled={screen.unreadCount === 0}
          onPress={() => void screen.selectAll()}
        />
        {screen.saveFailed ? (
          <AppText
            variant="error"
            accessibilityLiveRegion="polite"
          >
            {NOTIFICATION_MESSAGES.saveFailed}
          </AppText>
        ) : null}
      </View>

      {screen.isLoading ? (
        <ActivityIndicator
          style={styles.center}
          color={colors.primary}
        />
      ) : screen.isError ? (
        <View style={styles.center}>
          <AppText variant="error">{NOTIFICATION_MESSAGES.loadError}</AppText>
          <Button
            label={NOTIFICATION_MESSAGES.retry}
            variant="secondary"
            onPress={() => void screen.reload()}
          />
        </View>
      ) : (
        <FlatList
          data={screen.items}
          keyExtractor={getId}
          renderItem={({ item }) => (
            <NotificationRow
              notification={item}
              onSelect={screen.select}
            />
          )}
          ItemSeparatorComponent={Separator}
          ListEmptyComponent={
            <AppText
              variant="muted"
              style={styles.empty}
            >
              {NOTIFICATION_MESSAGES.empty}
            </AppText>
          }
          refreshing={screen.pullRefreshing}
          onRefresh={() => void screen.pullToRefresh()}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { padding: space.lg, gap: space.sm },
  statusRow: { flexDirection: "row", alignItems: "center", gap: space.sm },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  center: { padding: space.xxl, alignItems: "center", gap: space.md },
  empty: { padding: space.xxl, textAlign: "center" },
  separator: { height: StyleSheet.hairlineWidth },
});
