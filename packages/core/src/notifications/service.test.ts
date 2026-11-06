import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../http";
import { createStore } from "../store";
import type { NotificationsApi } from "./api";
import { NOTIFICATION_CACHE } from "./constants";
import { createNotificationCache } from "./persistence";
import type { KeyValueStorage } from "./persistence";
import { initialNotificationsState, notificationsReducer } from "./reducer";
import { createNotificationService } from "./service";
import type { Notification, NotificationsResponse } from "./types";

const make = (id: string, read = false): Notification => ({
  id,
  title: `title ${id}`,
  body: "b",
  createdAt: "2026-10-27T10:00:00.000Z",
  read,
});

// Lets the test decide WHEN (and how) a request finishes, so we can inspect the in-between moments.
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function setup() {
  const data = new Map<string, string>();
  const setItem = vi.fn(async (key: string, value: string) => void data.set(key, value));
  const storage: KeyValueStorage = {
    getItem: async (key) => data.get(key) ?? null,
    setItem,
    removeItem: async (key) => void data.delete(key),
  };
  const cache = createNotificationCache(storage);
  const store = createStore(notificationsReducer, initialNotificationsState);

  const listRequests: Array<ReturnType<typeof deferred<NotificationsResponse>>> = [];
  const api: NotificationsApi = {
    list: () => {
      const request = deferred<NotificationsResponse>();
      listRequests.push(request);
      return request.promise;
    },
    markRead: vi.fn(async (id: string) => {
      if (id === "bad") throw new ApiError(500, "could_not_save");
    }),
    markAllRead: vi.fn(async () => {}),
    registerDevice: async () => {},
    unregisterDevice: async () => {},
  };

  const service = createNotificationService({ api, store, cache });
  return { service, store, cache, data, setItem, api, listRequests };
}

const key = (userId: string) => NOTIFICATION_CACHE.keyPrefix + userId;
const settle = () => vi.advanceTimersByTimeAsync(0); // run pending promise callbacks
const pastDebounce = () => vi.advanceTimersByTimeAsync(NOTIFICATION_CACHE.saveDebounceMs + 1);

describe("notification service", () => {
  beforeEach(() => void vi.useFakeTimers());
  afterEach(() => void vi.useRealTimers());

  it("first visit: shows loading, then the list, and saves it once", async () => {
    const t = setup();
    const opening = t.service.open("u1");
    await settle();
    expect(t.store.getState().status).toBe("loading");

    t.listRequests[0]!.resolve({ items: [make("a"), make("b")] });
    await opening;
    expect(t.store.getState().status).toBe("ready");

    await pastDebounce();
    expect(t.data.has(key("u1"))).toBe(true);
    expect(t.setItem).toHaveBeenCalledTimes(1);
  });

  it("returning visit: shows the saved copy BEFORE the network answers, then replaces it", async () => {
    const t = setup();
    await t.cache.save("u1", [make("old1"), make("old2"), make("old3")]);

    const opening = t.service.open("u1");
    await settle();
    expect(t.store.getState().items).toHaveLength(3); // already on screen...
    expect(t.listRequests).toHaveLength(1); // ...while the request is still pending

    t.listRequests[0]!.resolve({ items: [make("fresh")] });
    await opening;
    expect(t.store.getState().items.map((n) => n.id)).toEqual(["fresh"]);
  });

  it("offline: a failed refresh keeps the saved copy and shows no error", async () => {
    const t = setup();
    await t.cache.save("u1", [make("saved")]);

    const opening = t.service.open("u1");
    await settle();
    t.listRequests[0]!.reject(new TypeError("Failed to fetch"));
    await opening;

    expect(t.store.getState()).toMatchObject({ status: "ready", errorCode: null });
    expect(t.store.getState().items).toHaveLength(1);
  });

  it("a successful optimistic mark-read is saved; a failed one is rolled back and saved", async () => {
    const t = setup();
    const opening = t.service.open("u1");
    await settle();
    t.listRequests[0]!.resolve({ items: [make("a"), make("bad")] });
    await opening;

    expect(await t.service.markRead("a")).toBe(true);
    expect(await t.service.markRead("bad")).toBe(false); // server refuses -> rolled back
    expect(t.store.getState().items.find((n) => n.id === "a")?.read).toBe(true);
    expect(t.store.getState().items.find((n) => n.id === "bad")?.read).toBe(false);

    await pastDebounce();
    const saved = JSON.parse(t.data.get(key("u1"))!);
    expect(saved.items.find((n: Notification) => n.id === "bad").read).toBe(false);
  });

  it("logout deletes the saved copy and discards a response that arrives late", async () => {
    const t = setup();
    await t.cache.save("u1", [make("old")]);
    const opening = t.service.open("u1");
    await settle(); // saved copy shown, refresh request in flight

    t.service.reset(); // the user logs out right now
    expect(t.data.has(key("u1"))).toBe(false);

    t.listRequests[0]!.resolve({ items: [make("late")] }); // the old session's response arrives
    await opening;
    await pastDebounce();

    expect(t.store.getState()).toBe(initialNotificationsState); // not refilled
    expect(t.data.has(key("u1"))).toBe(false); // not re-saved
  });

  it("receive() is true for a new notification and false for a duplicate", async () => {
    const t = setup();
    const opening = t.service.open("u1");
    await settle();
    t.listRequests[0]!.resolve({ items: [make("a")] });
    await opening;

    expect(t.service.receive(make("fresh"))).toBe(true);
    expect(t.service.receive(make("fresh"))).toBe(false);
  });

  it("opening twice in a row (React StrictMode) ends in one working session with one writer", async () => {
    const t = setup();
    const first = t.service.open("u1");
    const second = t.service.open("u1");
    await settle();
    // the first open was superseded; only the second one asks the server
    t.listRequests.at(-1)!.resolve({ items: [make("a")] });
    await Promise.all([first, second]);
    await pastDebounce();

    expect(t.store.getState().status).toBe("ready");
    expect(t.setItem).toHaveBeenCalledTimes(1);
  });
});
