import { useRef, type KeyboardEvent } from "react";
import { cx } from "@/shared/lib/cx";
import { FEED_TABS } from "../constants";
import { FEED_MESSAGES } from "../messages";
import type { FeedTab } from "../types";
import styles from "./Feed.module.css";

type FeedTabsProps = {
  value: FeedTab;
  onChange: (tab: FeedTab) => void;
};

const TABS = [
  { value: FEED_TABS.forYou, label: FEED_MESSAGES.tabForYou },
  { value: FEED_TABS.trending, label: FEED_MESSAGES.tabTrending },
] as const;

export const feedTabId = (tab: FeedTab) => `feed-tab-${tab}`;
export const FEED_PANEL_ID = "feed-panel";

// ARIA "tabs" pattern: role=tablist > role=tab (aria-selected), only the selected tab is in the Tab order
// (roving tabindex), and ArrowLeft/ArrowRight move between tabs.
export default function FeedTabs({ value, onChange }: FeedTabsProps) {
  const buttons = useRef<Record<string, HTMLButtonElement | null>>({});

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const index = TABS.findIndex((tab) => tab.value === value);
    const step = e.key === "ArrowRight" ? 1 : -1;
    const next = TABS[(index + step + TABS.length) % TABS.length];
    if (!next) return;
    onChange(next.value);
    buttons.current[next.value]?.focus();
  }

  return (
    <div
      role="tablist"
      aria-label={FEED_MESSAGES.tabsLabel}
      className={styles.tabs}
      onKeyDown={handleKeyDown}
    >
      {TABS.map((tab) => {
        const selected = tab.value === value;
        return (
          <button
            key={tab.value}
            ref={(node) => {
              buttons.current[tab.value] = node;
            }}
            type="button"
            role="tab"
            id={feedTabId(tab.value)}
            aria-selected={selected}
            aria-controls={FEED_PANEL_ID}
            tabIndex={selected ? 0 : -1}
            className={cx(styles.tab, selected && styles.tabSelected)}
            onClick={() => onChange(tab.value)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
