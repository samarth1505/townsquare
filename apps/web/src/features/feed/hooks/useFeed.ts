import { useFeed as useSharedFeed, type FeedSort } from "@hub/core";
import { feedApi } from "@/shared/lib/api";

// The query logic is shared with the phone app and lives in @hub/core; this wrapper only supplies THIS app's api.
export function useFeed(query: string, sort?: FeedSort) {
  return useSharedFeed(feedApi, query, sort);
}
