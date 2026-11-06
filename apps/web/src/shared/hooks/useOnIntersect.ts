import { useEffect, useRef } from "react";

// Calls `onIntersect` whenever the returned ref's element scrolls into view (IntersectionObserver).
// Used for infinite scroll: put the ref on an invisible "sentinel" element below the list.
export function useOnIntersect(onIntersect: () => void, enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null);

  // "Latest callback" pattern: keep the newest callback in a ref, so the observer below
  // doesn't have to be torn down and rebuilt every time the parent passes a new function.
  const callbackRef = useRef(onIntersect);
  useEffect(() => {
    callbackRef.current = onIntersect;
  });

  useEffect(() => {
    const node = ref.current;
    if (!node || !enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) callbackRef.current();
      },
      { rootMargin: "200px" }, // start loading a little BEFORE the sentinel is actually visible
    );
    observer.observe(node);
    return () => observer.disconnect(); // cleanup
  }, [enabled]);

  return ref;
}
