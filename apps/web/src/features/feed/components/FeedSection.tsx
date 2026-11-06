import { useState } from "react";
import { Column, Row } from "@/shared/components";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { usePersistentState } from "@/shared/hooks/usePersistentState";
import {
  DEFAULT_FEED_VIEW,
  FEED_TABS,
  FEED_VIEW_STORAGE_KEY,
  SEARCH_DEBOUNCE_MS,
  isFeedView,
} from "../constants";
import { useFeedTab } from "../hooks/useFeedTab";
import { FEED_MESSAGES } from "../messages";
import FeedList from "./FeedList";
import FeedTabs, { FEED_PANEL_ID, feedTabId } from "./FeedTabs";
import SearchBox from "./SearchBox";
import ViewToggle from "./ViewToggle";

// Owns the feed controls:
//   tab    -> in the URL (shareable)        view -> in localStorage (personal preference)
//   search -> two values: the input stays responsive, the debounced one triggers the request
export default function FeedSection() {
  const [tab, setTab] = useFeedTab();
  const [view, setView] = usePersistentState(FEED_VIEW_STORAGE_KEY, DEFAULT_FEED_VIEW, isFeedView);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);

  return (
    <Column gap={4}>
      <Row
        justify="between"
        align="center"
        wrap
      >
        <FeedTabs
          value={tab}
          onChange={setTab}
        />
        <ViewToggle
          value={view}
          onChange={setView}
        />
      </Row>
      <SearchBox
        value={search}
        onChange={setSearch}
        label={FEED_MESSAGES.searchLabel}
      />
      <div
        role="tabpanel"
        id={FEED_PANEL_ID}
        aria-labelledby={feedTabId(tab)}
      >
        <FeedList
          query={debouncedSearch}
          sort={tab === FEED_TABS.trending ? "likes" : undefined}
          view={view}
        />
      </div>
    </Column>
  );
}
