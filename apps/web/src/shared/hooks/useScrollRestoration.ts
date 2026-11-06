import { useEffect, useLayoutEffect } from "react";
import { useLocation, useNavigationType } from "react-router";
import { throttle } from "@/shared/lib/throttle";

const STORAGE_KEY = "hub.scrollPositions";
const SAVE_EVERY_MS = 150;

function readPositions(): Record<string, number> {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {}; // storage can be blocked or corrupted: never crash because of it
  }
}

function savePosition(key: string, y: number) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...readPositions(), [key]: y }));
  } catch {
    // ignore: restoring scroll is a nicety, not a requirement
  }
}

// Back/forward restores where you were; a normal link click starts at the top.
// (<ScrollRestoration/> from React Router needs a "data router"; this is the same idea for our <BrowserRouter>.)
export function useScrollRestoration() {
  const location = useLocation();
  const navigationType = useNavigationType(); // "POP" = back/forward, "PUSH" = link click, "REPLACE"

  // We manage scrolling ourselves, so the browser's own restoration must not fight us.
  useEffect(() => {
    const previous = history.scrollRestoration;
    history.scrollRestoration = "manual";
    return () => {
      history.scrollRestoration = previous;
    };
  }, []);

  // Remember the scroll position of THIS history entry while the user scrolls (throttled: scroll fires constantly).
  useEffect(() => {
    const save = throttle(() => savePosition(location.key, window.scrollY), SAVE_EVERY_MS);
    window.addEventListener("scroll", save, { passive: true });
    return () => {
      window.removeEventListener("scroll", save);
      save.cancel();
    };
  }, [location.key]);

  // After the new page is in the DOM and BEFORE the browser paints: restore (POP) or go to the top.
  useLayoutEffect(() => {
    const target = navigationType === "POP" ? (readPositions()[location.key] ?? 0) : 0;
    window.scrollTo(0, target);
  }, [location.key, navigationType]);
}
