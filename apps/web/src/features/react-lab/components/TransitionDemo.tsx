import { memo, useDeferredValue, useState, useTransition, type ChangeEvent } from "react";

type Mode = "none" | "transition" | "deferred";

const ITEMS = Array.from({ length: 2000 }, (_, i) => `Item ${i + 1}`);
const ROW_COST_MS = 0.15; // each row takes this long to render ON PURPOSE, so a full list costs ~300 ms

/* oxlint-disable react/purity -- the slowness is the whole point of this demo */
function SlowRow({ text }: { text: string }) {
  const end = performance.now() + ROW_COST_MS;
  while (performance.now() < end) {
    // burn time deliberately: stands in for an expensive chart, table or markdown render
  }
  return <li className="px-2 py-0.5 text-sm">{text}</li>;
}
/* oxlint-enable react/purity */

// memo: skip re-rendering when `query` has not changed. Without it, useDeferredValue could not help, because the
// list would re-render for every keystroke anyway.
const SlowList = memo(function SlowList({ query }: { query: string }) {
  const matches = ITEMS.filter((item) => item.toLowerCase().includes(query.toLowerCase()));
  return (
    <>
      <p
        className="m-0 text-sm"
        data-testid="result-count"
      >
        Showing {matches.length} results
      </p>
      <ul className="m-0 mt-1 max-h-40 list-none overflow-auto p-0">
        {matches.map((item) => (
          <SlowRow
            key={item}
            text={item}
          />
        ))}
      </ul>
    </>
  );
});

export default function TransitionDemo() {
  const [mode, setMode] = useState<Mode>("transition");
  const [text, setText] = useState(""); // what the INPUT shows: must update instantly (URGENT)
  const [query, setQuery] = useState(""); // what the LIST filters by (not urgent) in "transition" mode
  const [isPending, startTransition] = useTransition();
  const deferredText = useDeferredValue(text); // a copy of `text` that is allowed to LAG behind

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.currentTarget.value;
    setText(value); // urgent: the input must follow the keyboard
    // Mark this second update as NOT urgent. React renders the urgent one first, and may interrupt and restart
    // the slow list render if another keystroke arrives.
    if (mode === "transition") startTransition(() => setQuery(value));
  }

  const listQuery = mode === "none" ? text : mode === "transition" ? query : deferredText;
  const isStale = mode === "transition" ? isPending : mode === "deferred" && deferredText !== text;

  return (
    <div>
      <fieldset className="mb-3 flex flex-wrap gap-4 border-0 p-0">
        <legend className="mb-1 text-sm text-app-muted">How the list follows the input</legend>
        {(
          [
            ["none", "Plain state (input lags)"],
            ["transition", "useTransition"],
            ["deferred", "useDeferredValue"],
          ] as const
        ).map(([value, label]) => (
          <label
            key={value}
            className="flex items-center gap-1 text-sm"
          >
            <input
              type="radio"
              name="transition-mode"
              checked={mode === value}
              onChange={() => setMode(value)}
            />
            {label}
          </label>
        ))}
      </fieldset>

      <label
        htmlFor="transition-input"
        className="mr-2 text-sm"
      >
        Filter 2,000 slow rows
      </label>
      <input
        id="transition-input"
        value={text}
        onChange={handleChange}
        className="rounded-lg border border-app-control-border bg-app-surface px-2 py-1"
      />
      {isStale && (
        <span
          role="status"
          className="ml-2 text-sm text-app-muted"
        >
          Updating…
        </span>
      )}

      <div
        className={isStale ? "mt-2 opacity-60" : "mt-2"}
        aria-busy={isStale}
      >
        <SlowList query={listQuery} />
      </div>
    </div>
  );
}
