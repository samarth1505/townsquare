import { useEffect } from "react";

declare global {
  interface Window {
    __renderCounts?: Record<string, number>;
  }
}

// DEV-ONLY teaching tools: prove an optimisation works by reading window.__renderCounts in the browser console.

// Records one named event (e.g. "an expensive calculation ran").
export function countEvent(name: string) {
  if (!import.meta.env.DEV) return;
  const counts = (window.__renderCounts ??= {});
  counts[name] = (counts[name] ?? 0) + 1;
}

// Counts how many times a component has re-rendered and committed.
// An effect without a dependency array runs after every committed render.
export function useRenderCount(name: string) {
  useEffect(() => {
    countEvent(name);
  });
}
