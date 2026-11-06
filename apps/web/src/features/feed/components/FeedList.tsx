import { memo, useCallback, useMemo, useState } from "react";
import type { FeedSort } from "@hub/core";
import { Button } from "@/shared/components";
import { useOnIntersect } from "@/shared/hooks/useOnIntersect";
import { countEvent, useRenderCount } from "@/shared/hooks/useRenderCount";
import { cx } from "@/shared/lib/cx";
import { FEED_VIEWS, PRIORITY_IMAGE_COUNT } from "../constants";
import { useFeed } from "../hooks/useFeed";
import { FEED_MESSAGES } from "../messages";
import FeedCard from "./FeedCard";
import type { FeedView } from "../types";
import FeedFooter from "./FeedFooter";
import FeedSkeleton from "./FeedSkeleton";
import styles from "./Feed.module.css";

type FeedListProps = {
  query: string; // the DEBOUNCED search text
  sort?: FeedSort; // server-side ordering (the "Trending" tab)
  view: FeedView; // grid or list layout
};

function FeedList({ query, sort, view }: FeedListProps) {
  useRenderCount("FeedList");
  const {
    data,
    isPending,
    isError,
    isPlaceholderData,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = useFeed(query, sort);

  // CLIENT state (bookmarks): lives in React, not in the query cache. Hooks must stay above the early returns.
  const [savedIds, setSavedIds] = useState<ReadonlySet<string>>(new Set());

  // useCallback keeps the SAME function object between renders (new one only if the dependencies change).
  // No dependencies are needed: setSavedIds is stable and we use the functional update (prev => ...).
  const handleToggleSave = useCallback((id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev); // never mutate state: copy, then change the copy
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const [sortByLikes, setSortByLikes] = useState(false);

  // useMemo caches the sorted list. It only recomputes when `items` or `sortByLikes` change,
  // so re-renders caused by Save clicks reuse the cached array.
  // (The hook sits above the early returns, so `data` can still be undefined here.)
  // All loaded pages flattened into one list. useMemo keeps the SAME array between renders,
  // otherwise the sort memo below would see a "new" array on every render.
  const items = useMemo(() => data?.pages.flatMap((page) => page.items), [data]);
  const visiblePosts = useMemo(() => {
    countEvent("feedSort"); // dev-only counter: how often does this calculation really run?
    if (!items) return [];
    return sortByLikes ? [...items].sort((a, b) => b.likes - a.likes) : items; // copy first: sort() mutates
  }, [items, sortByLikes]);

  // Load the next page when the sentinel below the list scrolls into view.
  const canLoadMore =
    hasNextPage && !isFetchingNextPage && !isFetchNextPageError && !isPlaceholderData;
  const sentinelRef = useOnIntersect(() => void fetchNextPage(), canLoadMore);

  // The four states every data-driven list needs: loading, error, empty, data.
  if (isPending) return <FeedSkeleton />;

  if (isError) {
    return (
      <div
        className={styles.state}
        role="alert"
      >
        <p>{FEED_MESSAGES.loadError}</p>
        <Button onClick={() => refetch()}>{FEED_MESSAGES.retry}</Button>
      </div>
    );
  }

  if (visiblePosts.length === 0) {
    const message = query ? FEED_MESSAGES.noMatches(query) : FEED_MESSAGES.empty;
    return <p className={styles.state}>{message}</p>;
  }

  return (
    <>
      <label>
        <input
          type="checkbox"
          checked={sortByLikes}
          onChange={(e) => setSortByLikes(e.currentTarget.checked)}
        />{" "}
        {FEED_MESSAGES.sortByLikes}
      </label>
      <ul
        className={cx(
          styles.grid,
          view === FEED_VIEWS.list && styles.list,
          isPlaceholderData && styles.stale,
        )}
        aria-busy={isPlaceholderData}
      >
        {visiblePosts.map((post, index) => (
          <li key={post.id}>
            <FeedCard
              post={post}
              saved={savedIds.has(post.id)}
              onToggleSave={handleToggleSave}
              priority={index < PRIORITY_IMAGE_COUNT}
            />
          </li>
        ))}
      </ul>

      {/* Sentinel: an invisible marker. When it scrolls into view, we fetch the next page. */}
      <div
        ref={sentinelRef}
        aria-hidden="true"
      />
      <FeedFooter
        isLoadingMore={isFetchingNextPage}
        hasMore={hasNextPage}
        hasError={isFetchNextPageError}
        onRetry={() => void fetchNextPage()}
        onLoadMore={() => void fetchNextPage()}
      />
    </>
  );
}

// memo: skip re-rendering the list when its `query` prop is unchanged (FeedSection re-renders on every keystroke).
export default memo(FeedList);
