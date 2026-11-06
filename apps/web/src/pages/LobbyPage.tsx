import { FeedSection } from "@/features/feed";
import { StatCards } from "@/features/stats";
import { RightRail } from "@/features/widgets";
import { ErrorBoundary, ErrorFallback } from "@/shared/components";
import styles from "./LobbyPage.module.css";

// The Lobby: a two-column page (feed column + right rail). The chrome (top bar, nav) lives in AppLayout.
export default function LobbyPage() {
  return (
    <section>
      <h1>Your feed</h1>
      <div className={styles.layout}>
        <div>
          <StatCards />
          {/* Widget-level boundary: if the feed crashes, the stats and the right rail keep working. */}
          <ErrorBoundary fallback={({ reset }) => <ErrorFallback onRetry={reset} />}>
            <FeedSection />
          </ErrorBoundary>
        </div>
        <RightRail />
      </div>
    </section>
  );
}
