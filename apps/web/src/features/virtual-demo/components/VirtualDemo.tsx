import { useRef, useState, type ChangeEvent } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Column } from "@/shared/components";
import { DEFAULT_ITEM_COUNT, ITEM_COUNT_OPTIONS, OVERSCAN_ROWS, ROW_HEIGHT_PX } from "../constants";
import DemoRow from "./DemoRow";
import styles from "./VirtualDemo.module.css";

// Same list, two ways: render EVERY row, or render only the rows that are visible ("windowing").
const LIST_LABEL = "Scrollable list of posts";

export default function VirtualDemo() {
  const [count, setCount] = useState<number>(DEFAULT_ITEM_COUNT);
  const [virtualised, setVirtualised] = useState(true);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => scrollerRef.current, // which element scrolls
    estimateSize: () => ROW_HEIGHT_PX, // how tall each row is (so it can compute positions without rendering)
    overscan: OVERSCAN_ROWS,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const rowsInDom = virtualised ? virtualItems.length : count;

  function handleCountChange(e: ChangeEvent<HTMLSelectElement>) {
    setCount(Number(e.currentTarget.value));
  }

  return (
    <Column gap={3}>
      <div className={styles.controls}>
        <label>
          <input
            type="checkbox"
            checked={virtualised}
            onChange={(e) => setVirtualised(e.currentTarget.checked)}
          />{" "}
          Virtualise the list
        </label>
        <label>
          Items{" "}
          <select
            value={count}
            onChange={handleCountChange}
          >
            {ITEM_COUNT_OPTIONS.map((option) => (
              <option
                key={option}
                value={option}
              >
                {option.toLocaleString()}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p
        className={styles.stats}
        data-stat
      >
        Rows in the DOM: {rowsInDom.toLocaleString()} of {count.toLocaleString()}
      </p>

      <div
        ref={scrollerRef}
        className={styles.scroller}
        data-scroller
        // A scrollable box is invisible to keyboard users unless it can take focus (then arrow keys scroll it).
        tabIndex={0}
        role="region"
        aria-label={LIST_LABEL}
      >
        {virtualised ? (
          // A tall empty box gives the scrollbar its true length; only the visible rows are placed inside it.
          <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
            {virtualItems.map((item) => (
              <div
                key={item.key}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: item.size,
                  transform: `translateY(${item.start}px)`,
                }}
              >
                <DemoRow index={item.index} />
              </div>
            ))}
          </div>
        ) : (
          Array.from({ length: count }, (_, index) => (
            <DemoRow
              key={index}
              index={index}
            />
          ))
        )}
      </div>
    </Column>
  );
}
