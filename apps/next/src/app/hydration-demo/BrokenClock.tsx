"use client";

import { timeWithMilliseconds } from "./time";
// BUG ON PURPOSE. This renders the time DURING RENDER. The server runs it at one moment and writes that time into
// the HTML; the browser runs it again a little later while hydrating and gets a DIFFERENT time. React expected the
// HTML and its own output to match, finds a difference, and reports a "hydration mismatch" (and may re-render).
// The same happens with Math.random(), `window`/`localStorage` checks, and locale/timezone formatting.
export default function BrokenClock() {
  return <p data-testid="broken">Time: {timeWithMilliseconds()}</p>;
}
