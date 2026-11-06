import { useCallback, useMemo, useState } from "react";
import { useWindowDimensions } from "react-native";
import { useDebouncedValue, useFeed } from "@hub/core";
import { feedApi } from "@/shared/lib/apiClient";
import {
  CARD_GAP,
  COLUMNS_BY_VIEW,
  FEED_TABS,
  FEED_VIEWS,
  SCREEN_PADDING,
  SEARCH_DEBOUNCE_MS,
  SORT_BY_TAB,
} from "../constants";
import type { FeedTab, FeedView } from "../types";

// Everything the feed screen NEEDS TO KNOW, in one place; the screen component only draws it.
//   tab / view / search / saved ->  local UI state (lost when the screen unmounts, on purpose)
//   pages of posts              ->  SERVER state, owned by TanStack Query (cache, loading, errors, pagination)
export function useFeedScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const [tab, setTab] = useState<FeedTab>(FEED_TABS.forYou);
  const [view, setView] = useState<FeedView>(FEED_VIEWS.list);
  const [search, setSearch] = useState("");
  const [savedIds, setSavedIds] = useState<ReadonlySet<string>>(new Set());
  const [pullRefreshing, setPullRefreshing] = useState(false);

  // Two values for search: `search` keeps the text box responsive on every key, `debouncedSearch` is what asks the server.
  const debouncedSearch = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);
  const feed = useFeed(feedApi, debouncedSearch, SORT_BY_TAB[tab]);
  // Pull out the pieces the callbacks use: `feed` is a NEW object on every render, but fetchNextPage and refetch are stable.
  const { hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage, refetch } = feed;

  // The query keeps a list of PAGES; a FlatList wants ONE flat array.
  const posts = useMemo(() => feed.data?.pages.flatMap((page) => page.items) ?? [], [feed.data]);

  const columns = COLUMNS_BY_VIEW[view];
  const cardWidth = (screenWidth - SCREEN_PADDING * 2 - CARD_GAP * (columns - 1)) / columns;

  // useCallback keeps the SAME function between renders, so the memoized cards are not re-rendered by a new prop.
  const toggleSave = useCallback((id: string) => {
    setSavedIds((previous) => {
      const next = new Set(previous); // never mutate state: copy, change the copy
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Called by the FlatList when the user scrolls near the end. It can fire several times, so every guard matters:
  //  - no next page   -> nothing to load
  //  - already loading -> do not start a second request for the same page
  //  - the last load failed -> do NOT retry by ourselves, or a dead network becomes an endless loop; the footer's
  //    "Try again" button retries on purpose
  const loadMore = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage || isFetchNextPageError) return;
    void fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage]);

  const retryLoadMore = useCallback(() => void fetchNextPage(), [fetchNextPage]);

  // Pull-to-refresh has its OWN flag. If we used the query's isRefetching, the spinner would also appear whenever the
  // user types in the search box or the app returns from the background, which are not pull gestures.
  const pullToRefresh = useCallback(async () => {
    setPullRefreshing(true);
    try {
      await refetch();
    } finally {
      setPullRefreshing(false);
    }
  }, [refetch]);

  return {
    tab,
    setTab,
    view,
    setView,
    search,
    setSearch,
    debouncedSearch,
    posts,
    columns,
    cardWidth,
    savedIds,
    toggleSave,
    isLoading: feed.isPending, // first load, nothing to show yet
    isError: feed.isError && posts.length === 0, // failed and there is nothing cached to keep showing
    isSearching: feed.isPlaceholderData, // showing the previous results while the new ones load
    hasNextPage,
    isFetchingNextPage,
    isLoadMoreError: isFetchNextPageError,
    loadMore,
    retryLoadMore,
    retry: () => void refetch(),
    pullToRefresh,
    pullRefreshing,
  };
}
