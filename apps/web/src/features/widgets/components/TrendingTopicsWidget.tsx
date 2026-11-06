import { useTrendingTopics } from "../hooks/useTrendingTopics";
import { WIDGET_MESSAGES } from "../messages";
import WidgetCard from "./WidgetCard";
import styles from "./Widgets.module.css";

export default function TrendingTopicsWidget() {
  const { data, isPending } = useTrendingTopics(); // on failure this THROWS to the boundary: no isError branch needed

  return (
    <WidgetCard
      title={WIDGET_MESSAGES.topicsTitle}
      loading={isPending}
    >
      <ul className={styles.list}>
        {data?.items.map((topic) => (
          <li key={topic.name}>
            {topic.name} <span className={styles.muted}>{WIDGET_MESSAGES.posts(topic.posts)}</span>
          </li>
        ))}
      </ul>
    </WidgetCard>
  );
}
