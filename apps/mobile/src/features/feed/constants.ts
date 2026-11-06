import type { FeedSort } from "@hub/core";
import type { FeedTab, FeedView } from "./types";

export const FEED_TABS = { forYou: "for-you", trending: "trending" } as const;
export const FEED_VIEWS = { list: "list", grid: "grid" } as const;

// "Trending" is the same feed asked for in a different order: the server sorts by likes.
export const SORT_BY_TAB: Record<FeedTab, FeedSort | undefined> = {
  [FEED_TABS.forYou]: undefined,
  [FEED_TABS.trending]: "likes",
};

export const COLUMNS_BY_VIEW: Record<FeedView, number> = {
  [FEED_VIEWS.list]: 1,
  [FEED_VIEWS.grid]: 2,
};

export const SEARCH_DEBOUNCE_MS = 300;
export const SKELETON_CARD_COUNT = 3;

// Start loading the next page when the user is within this many "screen heights" of the end of the list.
// 0.5 = half a screen early, so the next page is usually there before the user reaches the bottom.
export const END_REACHED_THRESHOLD = 0.5;

// FlatList windowing: only rows near the screen are mounted. These numbers are in rows / "screen heights".
export const INITIAL_NUM_TO_RENDER = 4; // rows drawn on the very first frame (enough to fill one screen)
export const WINDOW_SIZE = 7; // keep ~3 screens above and 3 below mounted (the default is 21, which is a lot)
export const MAX_TO_RENDER_PER_BATCH = 4; // rows added per frame while scrolling fast

export const SCREEN_PADDING = 16;
export const CARD_GAP = 12;
export const IMAGE_ASPECT_RATIO = 16 / 9;
export const IMAGE_FADE_MS = 200;

// The image server resizes by ?w=. We ask for a few fixed widths ("buckets"), not the exact pixel width of every phone,
// so many phones share the same cached files (see the CDN notes on the web side).
export const IMAGE_WIDTH_BY_VIEW: Record<FeedView, number> = {
  [FEED_VIEWS.list]: 800,
  [FEED_VIEWS.grid]: 400,
};
