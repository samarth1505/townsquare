// Sends JSON to a URL in a way that SURVIVES the page closing.
//
// A normal fetch is cancelled when the tab closes or navigates away, which is exactly when we want to send the last
// events. navigator.sendBeacon hands the request to the BROWSER, which finishes it even after the page is gone.
// We send "text/plain" (not application/json) because that is a "simple" content type: no CORS preflight request,
// which a beacon cannot wait for. The server parses the text as JSON.
export function sendJson(url: string, payload: unknown): void {
  const body = JSON.stringify(payload);
  try {
    if (typeof navigator.sendBeacon === "function") {
      if (navigator.sendBeacon(url, new Blob([body], { type: "text/plain" }))) return;
    }
    // Fallback (no sendBeacon, or the browser refused the beacon, e.g. payload too large): fetch with `keepalive`,
    // which also lets the request outlive the page.
    void fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body,
      keepalive: true,
      credentials: "include",
    }).catch(() => {});
  } catch {
    // telemetry must never throw into the app
  }
}
