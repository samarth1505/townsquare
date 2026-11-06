import { useEffect, useState } from "react";

// Returns `value`, but only after it has stopped changing for `delayMs`.
// While the user keeps typing, the timer keeps being reset and the old value is returned.
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id); // cleanup cancels the previous timer on every new keystroke
  }, [value, delayMs]);

  return debounced;
}
