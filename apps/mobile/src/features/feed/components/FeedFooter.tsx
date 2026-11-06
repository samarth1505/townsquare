import { ActivityIndicator, StyleSheet, View } from "react-native";
import AppText from "@/shared/components/AppText";
import Button from "@/shared/components/Button";
import { space } from "@/shared/theme/tokens";
import { FEED_MESSAGES } from "../messages";

type FeedFooterProps = {
  isFetchingNextPage: boolean;
  isLoadMoreError: boolean;
  hasNextPage: boolean;
  hasPosts: boolean;
  onRetry: () => void;
};

// The strip under the last row. It shows what is happening with the NEXT page: loading, failed (with a retry), or the end.
export default function FeedFooter({
  isFetchingNextPage,
  isLoadMoreError,
  hasNextPage,
  hasPosts,
  onRetry,
}: FeedFooterProps) {
  if (isFetchingNextPage) {
    return (
      <View style={styles.footer}>
        <ActivityIndicator accessibilityLabel={FEED_MESSAGES.loadingMore} />
      </View>
    );
  }
  if (isLoadMoreError) {
    return (
      <View style={styles.footer}>
        <AppText variant="error">{FEED_MESSAGES.loadMoreError}</AppText>
        <Button
          label={FEED_MESSAGES.retry}
          variant="secondary"
          onPress={onRetry}
        />
      </View>
    );
  }
  if (hasPosts && !hasNextPage) {
    return (
      <View style={styles.footer}>
        <AppText variant="muted">{FEED_MESSAGES.endReached}</AppText>
      </View>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  footer: { paddingVertical: space.xl, alignItems: "center", gap: space.md },
});
