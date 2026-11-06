import { useCallback, useState } from "react";

// useState that remembers its value in localStorage (a UI PREFERENCE such as grid/list view).
// `isValid` guards against stale or tampered values: anything unexpected falls back to `initial`.
export function usePersistentState<T extends string>(
  key: string,
  initial: T,
  isValid: (value: string) => value is T,
) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null && isValid(stored) ? stored : initial;
    } catch {
      return initial; // storage blocked (private mode) or unavailable: just use the default
    }
  });

  const set = useCallback(
    (next: T) => {
      setValue(next);
      try {
        localStorage.setItem(key, next);
      } catch {
        // ignore: the preference simply won't persist
      }
    },
    [key],
  );

  return [value, set] as const;
}
