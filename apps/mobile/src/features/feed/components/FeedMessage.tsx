import { StyleSheet, View } from "react-native";
import AppText from "@/shared/components/AppText";
import Button from "@/shared/components/Button";
import { space } from "@/shared/theme/tokens";

// A centred message with an optional action: used for "empty", "no matches" and "couldn't load".
export default function FeedMessage({
  text,
  isError = false,
  actionLabel,
  onAction,
}: {
  text: string;
  isError?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.wrapper}>
      <AppText
        variant={isError ? "error" : "muted"}
        accessibilityLiveRegion="polite"
      >
        {text}
      </AppText>
      {actionLabel && onAction ? (
        <Button
          label={actionLabel}
          variant="secondary"
          onPress={onAction}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { padding: space.xxl, alignItems: "center", gap: space.md },
});
