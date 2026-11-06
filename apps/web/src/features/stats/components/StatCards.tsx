import { Button } from "@/shared/components";
import { useStats } from "../hooks/useStats";
import { STATS_MESSAGES } from "../messages";
import styles from "./Stats.module.css";

const numberFormat = new Intl.NumberFormat(); // 1284 -> "1,284" (locale-aware); created once, not on every render

const CARDS = [
  { key: "posts", label: STATS_MESSAGES.posts },
  { key: "members", label: STATS_MESSAGES.members },
  { key: "likesToday", label: STATS_MESSAGES.likesToday },
] as const;

export default function StatCards() {
  const { data, isPending, isError, refetch } = useStats();

  if (isError) {
    return (
      <div
        className={styles.error}
        role="alert"
      >
        <span>{STATS_MESSAGES.loadError}</span>
        <Button
          variant="secondary"
          onClick={() => refetch()}
        >
          {STATS_MESSAGES.retry}
        </Button>
      </div>
    );
  }

  return (
    // A description list: each card is a term (label) + its value. aria-busy while loading.
    <dl
      className={styles.grid}
      aria-label={STATS_MESSAGES.label}
      aria-busy={isPending}
    >
      {CARDS.map((card) =>
        isPending ? (
          <div
            key={card.key}
            className={`${styles.card} ${styles.skeleton}`}
            aria-hidden="true"
          />
        ) : (
          <div
            key={card.key}
            className={styles.card}
          >
            <dt className={styles.label}>{card.label}</dt>
            <dd className={styles.value}>{numberFormat.format(data[card.key])}</dd>
          </div>
        ),
      )}
    </dl>
  );
}
