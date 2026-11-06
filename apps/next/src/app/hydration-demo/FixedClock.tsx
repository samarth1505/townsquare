"use client";

import { useEffect, useState } from "react";
import { timeWithMilliseconds } from "./time";

// FIX: the first render (on the server AND in the browser) is identical: a placeholder. Effects run only in the
// browser, after hydration, so the real time is filled in afterwards. The HTML and the first client render match.
export default function FixedClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    setTime(timeWithMilliseconds());
  }, []);

  return <p data-testid="fixed">Time: {time ?? "…"}</p>;
}
