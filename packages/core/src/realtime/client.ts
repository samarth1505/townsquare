import { createStore } from "../store";
import type { Store } from "../store";
import { backoffDelay } from "./backoff";
import type { BackoffOptions } from "./backoff";
import { REALTIME_BACKOFF, REALTIME_CLOSE_CODES, REALTIME_TOKEN_PARAM } from "./constants";

// idle         = not running (before start, after stop, or after the session died)
// connecting   = first connection attempt
// open         = connected, messages flow
// reconnecting = the connection dropped; waiting to retry (or retrying)
export type ConnectionStatus = "idle" | "connecting" | "open" | "reconnecting";

export interface RealtimeConfig {
  url: string; // ws://host/ws  (no token: the client appends it)
  getToken: () => string | null;
  // Called when the server rejects our token (close code 4401). Return true if a fresh token is now available.
  refreshSession: () => Promise<boolean>;
  onMessage: (data: unknown) => void; // already JSON-parsed; validate it before trusting it
  // Fires when a connection opens AGAIN after a drop: the place to re-fetch what we missed while offline.
  onReconnected?: () => void;
  onRetry?: (info: { attempt: number; delayMs: number }) => void;
  backoff?: BackoffOptions;
  createSocket?: (url: string) => WebSocket; // injectable for tests; defaults to the platform WebSocket
  random?: () => number;
}

// A framework-free WebSocket client with auto-reconnect. Web and React Native both have a global
// `WebSocket`, so this file is shared as is. The connection status is a store, so UIs can subscribe.
export function createRealtimeClient(config: RealtimeConfig) {
  const {
    url,
    getToken,
    refreshSession,
    onMessage,
    onReconnected,
    onRetry,
    backoff = REALTIME_BACKOFF,
    createSocket = (target: string) => new WebSocket(target),
    random = Math.random,
  } = config;

  // The status store's "reducer" just takes the new status.
  const statusStore: Store<ConnectionStatus, ConnectionStatus> = createStore(
    (_current: ConnectionStatus, next: ConnectionStatus) => next,
    "idle",
  );

  let running = false;
  let runId = 0; // bumped on every start/stop, so late async results from an OLD run can be ignored
  let socket: WebSocket | null = null;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;
  let attempt = 0; // consecutive failed attempts, drives the backoff
  let hasOpenedBefore = false;
  let authRetried = false; // true after we refreshed once for a 4401; cleared when the server talks to us

  function clearRetryTimer() {
    if (retryTimer) clearTimeout(retryTimer);
    retryTimer = null;
  }

  function connect() {
    clearRetryTimer();
    const token = getToken();
    if (!token) {
      void recoverFromUnauthorized(); // no token at all: try to get one before connecting
      return;
    }

    const ws = createSocket(`${url}?${REALTIME_TOKEN_PARAM}=${encodeURIComponent(token)}`);
    socket = ws;

    // Every handler first checks `socket !== ws`: events from a socket we already abandoned are ignored.
    ws.onopen = () => {
      if (socket !== ws) return;
      attempt = 0; // a good connection resets the backoff
      statusStore.dispatch("open");
      if (hasOpenedBefore) onReconnected?.();
      hasOpenedBefore = true;
    };
    ws.onmessage = (event) => {
      if (socket !== ws) return;
      authRetried = false; // the server accepted us and is talking
      let data: unknown;
      try {
        data = JSON.parse(String(event.data));
      } catch {
        return; // ignore a malformed frame; one bad message must not kill the connection
      }
      onMessage(data);
    };
    ws.onerror = () => {
      // Nothing to do: the browser always fires `close` right after `error`, and we handle it there.
    };
    ws.onclose = (event) => {
      if (socket !== ws) return;
      socket = null;
      if (!running) return;
      if (event.code === REALTIME_CLOSE_CODES.unauthorized) void recoverFromUnauthorized();
      else scheduleReconnect();
    };
  }

  // The token was rejected (it lives only 30 s). Refresh it ONCE and reconnect straight away.
  // If we are rejected again right after refreshing, the problem is not an old token: stop instead of looping.
  async function recoverFromUnauthorized() {
    if (authRetried) {
      stop();
      return;
    }
    authRetried = true;
    statusStore.dispatch("reconnecting");
    const thisRun = runId;
    const refreshed = await refreshSession();
    if (!running || thisRun !== runId) return; // stopped while we were refreshing
    if (refreshed) connect();
    else stop(); // session is dead: the HTTP layer already sends the user to login
  }

  function scheduleReconnect() {
    statusStore.dispatch("reconnecting");
    const delayMs = backoffDelay(attempt, backoff, random);
    attempt += 1;
    onRetry?.({ attempt, delayMs });
    retryTimer = setTimeout(connect, delayMs);
  }

  function start() {
    if (running) return;
    running = true;
    runId += 1;
    attempt = 0;
    hasOpenedBefore = false;
    authRetried = false;
    statusStore.dispatch("connecting");
    connect();
  }

  function stop() {
    running = false;
    runId += 1;
    clearRetryTimer();
    const ws = socket;
    socket = null; // clear FIRST so the close event of this socket is ignored
    ws?.close(REALTIME_CLOSE_CODES.normal);
    statusStore.dispatch("idle");
  }

  // "The network is back": skip the remaining wait and try right now.
  function retryNow() {
    if (!running || !retryTimer) return;
    attempt = 0;
    connect();
  }

  return { start, stop, retryNow, status: statusStore };
}

export type RealtimeClient = ReturnType<typeof createRealtimeClient>;

// http://host -> ws://host, https://host -> wss://host (secure sockets for secure pages).
export const toWebSocketUrl = (httpUrl: string) => httpUrl.replace(/^http/, "ws");
