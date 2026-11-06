import { useEffect, useState } from "react";

// Counts down from `seconds` to 0. Returns the seconds left and a restart function.
export function useCountdown(seconds: number) {
  // We store WHEN the countdown ends, not "how many seconds are left".
  // Browsers and phones slow down timers in the background, so counting ticks would drift;
  // the clock never lies.
  const [endAt, setEndAt] = useState(() => Date.now() + seconds * 1000);
  const [now, setNow] = useState(() => Date.now());

  // Derived data: computed every render from the two states above, never stored.
  const secondsLeft = Math.max(0, Math.ceil((endAt - now) / 1000));
  const running = secondsLeft > 0;

  useEffect(() => {
    if (!running) return; // nothing to tick once we reach 0
    const id = setInterval(() => setNow(Date.now()), 1000); // only refreshes "now"
    return () => clearInterval(id); // cleanup: runs when `running` changes or on unmount
  }, [running]);

  function restart() {
    const t = Date.now();
    setNow(t);
    setEndAt(t + seconds * 1000);
  }

  return { secondsLeft, restart };
}
