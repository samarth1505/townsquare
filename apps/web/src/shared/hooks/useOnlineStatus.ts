import { useSyncExternalStore } from "react";

// The browser is itself an "external store": navigator.onLine is the value, and the window fires
// "online"/"offline" events when it changes. So useSyncExternalStore is the right tool, no useState + useEffect.
function subscribe(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

// Caveat to say out loud: navigator.onLine === true only means "connected to a network", not "the server is
// reachable". It can say true on Wi-Fi with no internet; treat it as a hint, and let real requests decide.
export function useOnlineStatus(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true, // server snapshot (SSR): assume online
  );
}
