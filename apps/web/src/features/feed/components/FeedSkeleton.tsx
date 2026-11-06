import { SKELETON_CARD_COUNT } from "../constants";
import { FEED_MESSAGES } from "../messages";
import styles from "./Feed.module.css";

// Placeholder cards with the same size as real ones, so the page doesn't jump when data arrives (layout shift / CLS).
export default function FeedSkeleton() {
  return (
    <ul
      className={styles.grid}
      aria-busy="true"
      aria-label={FEED_MESSAGES.loading}
    >
      {/* Index keys are fine here: a fixed list of identical placeholders that never reorders. */}
      {Array.from({ length: SKELETON_CARD_COUNT }, (_, i) => (
        <li
          key={i}
          className={styles.skeletonCard}
        />
      ))}
    </ul>
  );
}
