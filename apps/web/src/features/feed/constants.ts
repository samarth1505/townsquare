import type { FeedTab, FeedView } from "./types";

export const SKELETON_CARD_COUNT = 6;
export const SEARCH_DEBOUNCE_MS = 300;

// The first cards are above the fold: their images load immediately (they are the LCP candidate). The rest load lazily.
export const PRIORITY_IMAGE_COUNT = 3;
export const IMAGE_WIDTH = 640;
export const IMAGE_HEIGHT = 360;

// The card is ~240-300px wide on desktop (grid columns), a third of the screen on tablets, full width on phones.
export const FEED_IMAGE_SIZES = "(min-width: 960px) 300px, (min-width: 600px) 33vw, 100vw";

// Tabs live in the URL (?tab=trending) so they can be shared, bookmarked and survive a refresh.
export const FEED_TAB_PARAM = "tab";
export const FEED_TABS = { forYou: "for-you", trending: "trending" } as const;
export const DEFAULT_FEED_TAB: FeedTab = FEED_TABS.forYou;

// The layout preference is personal, not shareable, so it lives in localStorage instead of the URL.
export const FEED_VIEWS = { grid: "grid", list: "list" } as const;
export const DEFAULT_FEED_VIEW: FeedView = FEED_VIEWS.grid;
export const FEED_VIEW_STORAGE_KEY = "hub.feedView";

// Type guards: validate untrusted strings (URL, localStorage) before using them as our union types.
export const isFeedTab = (value: string | null): value is FeedTab =>
  value === FEED_TABS.forYou || value === FEED_TABS.trending;
export const isFeedView = (value: string | null): value is FeedView =>
  value === FEED_VIEWS.grid || value === FEED_VIEWS.list;
