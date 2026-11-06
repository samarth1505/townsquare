import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRealtimeClient } from "./client";
import type { RealtimeConfig } from "./client";
import { REALTIME_CLOSE_CODES } from "./constants";

// A stand-in for the browser's WebSocket. The TEST plays the server: it decides when to open, send, or close.
class FakeSocket {
  static all: FakeSocket[] = [];
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  onclose: ((event: { code: number }) => void) | null = null;
  closedByClientWith: number | undefined;

  constructor(public url: string) {
    FakeSocket.all.push(this);
  }
  close(code?: number) {
    this.closedByClientWith = code; // a real socket fires `close` LATER; the test triggers it by hand
  }
  serverOpens() {
    this.onopen?.();
  }
  serverSends(data: unknown) {
    this.onmessage?.({ data: typeof data === "string" ? data : JSON.stringify(data) });
  }
  serverCloses(code: number) {
    this.onclose?.({ code });
  }
}

const latest = () => FakeSocket.all.at(-1)!;

function setup(overrides: Partial<RealtimeConfig> = {}) {
  const messages: unknown[] = [];
  const retries: number[] = [];
  const onReconnected = vi.fn();
  const refreshSession = vi.fn(async () => true);
  const client = createRealtimeClient({
    url: "ws://test/ws",
    getToken: () => "tok en",
    refreshSession,
    onMessage: (data) => messages.push(data),
    onReconnected,
    onRetry: ({ delayMs }) => retries.push(delayMs),
    createSocket: (url) => new FakeSocket(url) as unknown as WebSocket,
    random: () => 1, // jitter off: the delay equals the ceiling, so the numbers are exact
    ...overrides,
  });
  return { client, messages, retries, onReconnected, refreshSession };
}

describe("realtime client", () => {
  beforeEach(() => {
    FakeSocket.all = [];
    vi.useFakeTimers();
  });
  afterEach(() => void vi.useRealTimers());

  it("connects with the (URL-encoded) token and reports its status", () => {
    const { client } = setup();
    client.start();
    expect(client.status.getState()).toBe("connecting");
    expect(latest().url).toBe("ws://test/ws?token=tok%20en");
    latest().serverOpens();
    expect(client.status.getState()).toBe("open");
  });

  it("passes parsed messages on and ignores a malformed frame", () => {
    const { client, messages } = setup();
    client.start();
    latest().serverOpens();
    latest().serverSends({ type: "hello" });
    latest().serverSends("{not json");
    latest().serverSends({ type: "second" });
    expect(messages).toEqual([{ type: "hello" }, { type: "second" }]);
  });

  it("after a drop it retries with growing delays: 1 s, 2 s, 4 s", async () => {
    const { client, retries } = setup();
    client.start();
    latest().serverCloses(1006); // never opened, dropped
    expect(client.status.getState()).toBe("reconnecting");
    await vi.advanceTimersByTimeAsync(1000);
    latest().serverCloses(1006);
    await vi.advanceTimersByTimeAsync(2000);
    latest().serverCloses(1006);
    expect(retries).toEqual([1000, 2000, 4000]);
    expect(FakeSocket.all).toHaveLength(3); // initial + two retries so far
  });

  it("a successful open resets the backoff", async () => {
    const { client, retries } = setup();
    client.start();
    latest().serverCloses(1006);
    await vi.advanceTimersByTimeAsync(1000);
    latest().serverOpens();
    latest().serverCloses(1006); // drops again after a good connection
    expect(retries).toEqual([1000, 1000]); // back to the shortest wait, not 2000
  });

  it("onReconnected fires on a re-open, never on the first open", async () => {
    const { client, onReconnected } = setup();
    client.start();
    latest().serverOpens();
    expect(onReconnected).not.toHaveBeenCalled();
    latest().serverCloses(1006);
    await vi.advanceTimersByTimeAsync(1000);
    latest().serverOpens();
    expect(onReconnected).toHaveBeenCalledTimes(1);
  });

  it("4401: refreshes the token once and reconnects immediately (no backoff wait)", async () => {
    const { client, refreshSession, retries } = setup();
    client.start();
    latest().serverOpens();
    latest().serverCloses(REALTIME_CLOSE_CODES.unauthorized);
    await vi.advanceTimersByTimeAsync(0); // let the refresh promise settle; NO timer time passes
    expect(refreshSession).toHaveBeenCalledTimes(1);
    expect(FakeSocket.all).toHaveLength(2); // already reconnecting
    expect(retries).toEqual([]);
  });

  it("4401 again right after a refresh: gives up instead of looping", async () => {
    const { client, refreshSession } = setup();
    client.start();
    latest().serverCloses(REALTIME_CLOSE_CODES.unauthorized);
    await vi.advanceTimersByTimeAsync(0);
    latest().serverCloses(REALTIME_CLOSE_CODES.unauthorized); // fresh token rejected too
    await vi.advanceTimersByTimeAsync(0);
    expect(refreshSession).toHaveBeenCalledTimes(1);
    expect(client.status.getState()).toBe("idle");
    expect(FakeSocket.all).toHaveLength(2);
  });

  it("allows another refresh later, once the server has accepted us again", async () => {
    const { client, refreshSession } = setup();
    client.start();
    latest().serverCloses(REALTIME_CLOSE_CODES.unauthorized);
    await vi.advanceTimersByTimeAsync(0);
    latest().serverOpens();
    latest().serverSends({ type: "hello" }); // proof the server accepted the new token
    latest().serverCloses(REALTIME_CLOSE_CODES.unauthorized); // token expires hours later
    await vi.advanceTimersByTimeAsync(0);
    expect(refreshSession).toHaveBeenCalledTimes(2);
    expect(client.status.getState()).not.toBe("idle");
  });

  it("stops when the refresh itself fails (the session is dead)", async () => {
    const { client } = setup({ refreshSession: async () => false });
    client.start();
    latest().serverCloses(REALTIME_CLOSE_CODES.unauthorized);
    await vi.advanceTimersByTimeAsync(0);
    expect(client.status.getState()).toBe("idle");
  });

  it("stop() closes the socket normally and never reconnects", async () => {
    const { client } = setup();
    client.start();
    const socket = latest();
    socket.serverOpens();
    client.stop();
    expect(socket.closedByClientWith).toBe(REALTIME_CLOSE_CODES.normal);
    socket.serverCloses(1000); // the late close event arrives afterwards
    await vi.advanceTimersByTimeAsync(60_000);
    expect(client.status.getState()).toBe("idle");
    expect(FakeSocket.all).toHaveLength(1);
  });

  it("the late close event of an OLD socket cannot disturb the new one (StrictMode: start, stop, start)", async () => {
    const { client } = setup();
    client.start();
    const old = latest();
    client.stop();
    client.start();
    const current = latest();
    current.serverOpens();

    old.serverCloses(1006); // arrives late, after the new socket is already open

    expect(client.status.getState()).toBe("open");
    await vi.advanceTimersByTimeAsync(60_000);
    expect(FakeSocket.all).toHaveLength(2); // no extra reconnect was scheduled
  });

  it("retryNow() skips the wait", async () => {
    const { client } = setup();
    client.start();
    latest().serverCloses(1006);
    expect(FakeSocket.all).toHaveLength(1);
    client.retryNow();
    expect(FakeSocket.all).toHaveLength(2); // reconnected without waiting the 1 s
  });

  it("with no token at all it tries to get one first", async () => {
    let token: string | null = null;
    const refreshSession = vi.fn(async () => {
      token = "fresh";
      return true;
    });
    const { client } = setup({ getToken: () => token, refreshSession });
    client.start();
    await vi.advanceTimersByTimeAsync(0);
    expect(refreshSession).toHaveBeenCalledTimes(1);
    expect(latest().url).toBe("ws://test/ws?token=fresh");
  });
});
