import { QueryBoundary } from "@/shared/components";
import { WIDGET_MESSAGES } from "../messages";
import SuggestionsWidget from "./SuggestionsWidget";
import TrendingTopicsWidget from "./TrendingTopicsWidget";
import styles from "./Widgets.module.css";

// Each widget has ITS OWN boundary: if one fails, the others (and the feed) keep working.
export default function RightRail() {
  return (
    <aside
      className={styles.rail}
      aria-label={WIDGET_MESSAGES.rail}
    >
      <QueryBoundary message={WIDGET_MESSAGES.topicsFailed}>
        <TrendingTopicsWidget />
      </QueryBoundary>
      <QueryBoundary message={WIDGET_MESSAGES.suggestionsFailed}>
        <SuggestionsWidget />
      </QueryBoundary>
    </aside>
  );
}
