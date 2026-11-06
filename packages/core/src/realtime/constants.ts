export const REALTIME_PATH = "/ws";
export const REALTIME_TOKEN_PARAM = "token";

// Close codes 4000-4999 are free for applications to define. 4401 mirrors HTTP 401.
// (A browser hides the HTTP status of a rejected WebSocket handshake, so the server accepts the
// connection and then closes it with this code. That is how the client learns "your token is bad".)
export const REALTIME_CLOSE_CODES = {
  normal: 1000,
  unauthorized: 4401,
} as const;

// Reconnect delays: 1 s, 2 s, 4 s, 8 s ... capped at 30 s (before jitter).
export const REALTIME_BACKOFF = {
  baseMs: 1000,
  maxMs: 30_000,
} as const;
