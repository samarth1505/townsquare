import type { FEED_TABS, FEED_VIEWS } from "./constants";

export type FeedTab = (typeof FEED_TABS)[keyof typeof FEED_TABS];
export type FeedView = (typeof FEED_VIEWS)[keyof typeof FEED_VIEWS];
