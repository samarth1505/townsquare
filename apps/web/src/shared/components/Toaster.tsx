import { useEffect, useState } from "react";
import { useStoreSelector } from "@/shared/hooks/useStoreSelector";
import { COMMON_MESSAGES } from "@/shared/messages";
import { dismissToast, TOAST_DURATION_MS, toastStore } from "@/shared/lib/toasts";
import type { Toast } from "@/shared/lib/toasts";

function ToastItem({ toast }: { toast: Toast }) {
  // Hovering or focusing a toast PAUSES its countdown (people need time to read; this is also an
  // accessibility rule: time limits must be adjustable).
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(() => dismissToast(toast.id), TOAST_DURATION_MS);
    return () => clearTimeout(timer); // cleanup: pausing, or unmounting, cancels the pending dismissal
  }, [paused, toast.id]);

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="pointer-events-auto flex items-start gap-3 rounded-lg border border-app-border bg-app-surface p-3 shadow-lg"
    >
      <div className="min-w-0 flex-1">
        <p className="m-0 text-sm font-semibold">{toast.title}</p>
        {toast.body && <p className="m-0 mt-0.5 text-xs text-app-muted">{toast.body}</p>}
      </div>
      <button
        type="button"
        aria-label={COMMON_MESSAGES.dismiss}
        onClick={() => dismissToast(toast.id)}
        className="text-app-muted hover:text-app-text"
      >
        <span aria-hidden="true">×</span>
      </button>
    </div>
  );
}

// A screen-reader "live region". It is ALWAYS in the page (even when empty): assistive tech only announces
// changes inside a live region that already existed, so one inserted together with its content is often missed.
export default function Toaster() {
  const toasts = useStoreSelector(toastStore, (state) => state);

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-80 max-w-[90vw] flex-col gap-2"
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
        />
      ))}
    </div>
  );
}
