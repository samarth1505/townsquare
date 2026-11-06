import { useCallback } from "react";
import { useSearchParams } from "react-router";
import { DEFAULT_FEED_TAB, FEED_TAB_PARAM, isFeedTab } from "../constants";
import type { FeedTab } from "../types";

// The selected tab is STATE THAT LIVES IN THE URL: ?tab=trending.
// Benefits: shareable links, bookmarks, survives refresh, and the Back button behaves.
export function useFeedTab() {
  const [params, setParams] = useSearchParams();
  const raw = params.get(FEED_TAB_PARAM);
  const tab: FeedTab = isFeedTab(raw) ? raw : DEFAULT_FEED_TAB; // never trust the URL: anything invalid = default

  const setTab = useCallback(
    (next: FeedTab) => {
      setParams(
        (previous) => {
          const copy = new URLSearchParams(previous); // keep other params; never mutate the old object
          if (next === DEFAULT_FEED_TAB) copy.delete(FEED_TAB_PARAM);
          else copy.set(FEED_TAB_PARAM, next);
          return copy;
        },
        { replace: true }, // switching tabs shouldn't fill the history with entries
      );
    },
    [setParams],
  );

  return [tab, setTab] as const;
}
