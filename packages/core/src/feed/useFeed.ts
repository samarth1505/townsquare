import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import type { FeedApi } from "./api";
import { FEED_PAGE_SIZE, FEED_QUERY_KEY } from "./constants";
import type { FeedSort } from "./types";

// Server state in TanStack Query, shared by the web and the phone app. An "infinite query" stores a list of PAGES under
// one key. Search text AND sort are part of the key, so every distinct combination has its own pages in the cache.
// The app passes its own `feedApi` (built on its own HTTP client): this hook never knows where the server lives.
export function useFeed(feedApi: FeedApi, query: string, sort?: FeedSort) {
  return useInfiniteQuery({
    queryKey: [...FEED_QUERY_KEY, { q: query, sort: sort ?? null }],
    // pageParam is the cursor for the page being fetched (undefined = the first page)
    queryFn: ({ pageParam }) =>
      feedApi.list({ q: query, sort, cursor: pageParam, limit: FEED_PAGE_SIZE }),
    initialPageParam: undefined as string | undefined,
    // "What cursor fetches the page after this one?"  undefined means: there is no next page.
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    placeholderData: keepPreviousData,
  });
}
