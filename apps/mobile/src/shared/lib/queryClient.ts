import { AppState } from "react-native";
import { focusManager, QueryClient } from "@tanstack/react-query";

const STALE_TIME_MS = 30_000; // data counts as fresh for 30 s: no refetch while it is fresh

export const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: STALE_TIME_MS, retry: 1 } },
});

// TanStack Query refetches stale data when the user "comes back" to the app. In a browser it learns that from the
// window's focus event. A phone has no such event, so we tell it ourselves: the app counts as focused when its
// AppState is "active" (and not "background" or "inactive"). Without this, returning from another app would not refresh.
focusManager.setEventListener((handleFocus) => {
  const subscription = AppState.addEventListener("change", (state) => {
    handleFocus(state === "active");
  });
  return () => subscription.remove();
});
