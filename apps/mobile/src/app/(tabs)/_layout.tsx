import { Tabs } from "expo-router";
import { NOTIFICATION_MESSAGES, useUnreadCount } from "@/features/notifications";
import { NAV_MESSAGES } from "@/shared/messages";
import { useTheme } from "@/shared/theme/useTheme";

const MAX_BADGE_COUNT = 99;

// A folder name in parentheses, like (tabs), is a GROUP: it organises files and shares a layout, but it adds NOTHING to
// the URL. So (tabs)/index.tsx is still "/" and (tabs)/account.tsx is "/account". This layout draws the bottom tab bar.
export default function TabsLayout() {
  const colors = useTheme();
  const unreadCount = useUnreadCount();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        // Text-only tabs (real apps add icons from @expo/vector-icons). An EMPTY icon, not `display: none` on the icon
        // slot: the badge is drawn inside that slot, so hiding the slot hides the badge too.
        tabBarIcon: () => null,
        tabBarLabelStyle: { fontSize: 15, fontWeight: "600" },
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: NAV_MESSAGES.feedTab }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: NAV_MESSAGES.notificationsTab,
          // The red badge on the tab. `undefined` hides it; a string lets us cap the number at "99+".
          tabBarBadge:
            unreadCount === 0
              ? undefined
              : unreadCount > MAX_BADGE_COUNT
                ? NOTIFICATION_MESSAGES.overflowBadge
                : unreadCount,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{ title: NAV_MESSAGES.accountTab }}
      />
    </Tabs>
  );
}
