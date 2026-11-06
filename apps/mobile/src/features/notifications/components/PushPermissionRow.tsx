import { StyleSheet, View } from "react-native";
import AppText from "@/shared/components/AppText";
import Button from "@/shared/components/Button";
import { space } from "@/shared/theme/tokens";
import { usePushPermission } from "../hooks/usePushPermission";
import { NOTIFICATION_MESSAGES } from "../messages";

// Asks for push permission IN CONTEXT: on the screen about notifications, with a button the user chose to press,
// instead of a system prompt thrown at them on first launch (when most people tap "Don't Allow", and iOS then never
// lets us ask again).
export default function PushPermissionRow() {
  const { permission, request, openSettings } = usePushPermission();

  if (permission === "unknown") return null;
  if (permission === "granted") {
    return <AppText variant="muted">{NOTIFICATION_MESSAGES.pushOn}</AppText>;
  }

  const denied = permission === "denied";
  return (
    <View style={styles.wrapper}>
      <AppText variant="muted">
        {denied ? NOTIFICATION_MESSAGES.pushDenied : NOTIFICATION_MESSAGES.pushOff}
      </AppText>
      <Button
        label={denied ? NOTIFICATION_MESSAGES.openSettings : NOTIFICATION_MESSAGES.enablePush}
        variant="secondary"
        onPress={denied ? openSettings : () => void request()}
      />
    </View>
  );
}

const styles = StyleSheet.create({ wrapper: { gap: space.sm } });
