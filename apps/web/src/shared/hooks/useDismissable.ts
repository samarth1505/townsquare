import { useEffect, useRef, type RefObject } from "react";

type DismissReason = "outside" | "escape";

// Calls `onDismiss` when the user clicks OUTSIDE `ref` or presses Escape. Used by popovers, menus and dialogs.
export function useDismissable(
  ref: RefObject<HTMLElement | null>,
  onDismiss: (reason: DismissReason) => void,
  enabled: boolean,
) {
  // "Latest callback" pattern (same as useOnIntersect): the listeners below are not re-attached on every render.
  const callbackRef = useRef(onDismiss);
  useEffect(() => {
    callbackRef.current = onDismiss;
  });

  useEffect(() => {
    if (!enabled) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (ref.current && !ref.current.contains(target)) callbackRef.current("outside");
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") callbackRef.current("escape");
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [ref, enabled]);
}
