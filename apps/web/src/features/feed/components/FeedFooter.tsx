import { Button } from "@/shared/components";
import { FEED_MESSAGES } from "../messages";
import styles from "./Feed.module.css";

type FeedFooterProps = {
  isLoadingMore: boolean;
  hasMore: boolean;
  hasError: boolean;
  onRetry: () => void;
  onLoadMore: () => void;
};

// What sits under the list: "loading more", an error with retry, or the end-of-list message.
export default function FeedFooter({
  isLoadingMore,
  hasMore,
  hasError,
  onRetry,
  onLoadMore,
}: FeedFooterProps) {
  if (hasError) {
    return (
      <div
        className={styles.state}
        role="alert"
      >
        <p>{FEED_MESSAGES.loadMoreError}</p>
        <Button onClick={onRetry}>{FEED_MESSAGES.retry}</Button>
      </div>
    );
  }
  if (isLoadingMore) {
    return (
      <p
        className={styles.state}
        role="status"
      >
        {FEED_MESSAGES.loadingMore}
      </p>
    );
  }
  if (!hasMore) return <p className={styles.state}>{FEED_MESSAGES.endReached}</p>;
  // Accessible fallback: keyboard and screen-reader users can't "scroll to trigger" loading, so offer a button.
  return (
    <Button
      variant="secondary"
      onClick={onLoadMore}
    >
      {FEED_MESSAGES.loadMore}
    </Button>
  );
}
