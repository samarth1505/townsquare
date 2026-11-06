import { describe, expect, it } from "vitest";
import { NOTIFICATION_CACHE } from "./constants";
import { createNotificationCache } from "./persistence";
import type { KeyValueStorage } from "./persistence";
import type { Notification } from "./types";

const make = (id: string): Notification => ({
  id,
  title: "t",
  body: "b",
  createdAt: "2026-10-27T10:00:00.000Z",
  read: false,
});

// An in-memory stand-in for localStorage / AsyncStorage. This is what dependency injection buys us.
function fakeStorage() {
  const data = new Map<string, string>();
  const storage: KeyValueStorage = {
    getItem: async (key) => data.get(key) ?? null,
    setItem: async (key, value) => void data.set(key, value),
    removeItem: async (key) => void data.delete(key),
  };
  return { storage, data };
}

const keyFor = (userId: string) => NOTIFICATION_CACHE.keyPrefix + userId;

describe("createNotificationCache", () => {
  it("saves and loads a user's list", async () => {
    const { storage } = fakeStorage();
    const cache = createNotificationCache(storage);
    await cache.save("u1", [make("a"), make("b")]);
    expect((await cache.load("u1"))?.map((n) => n.id)).toEqual(["a", "b"]);
  });

  it("keeps users apart (one key per user)", async () => {
    const { storage } = fakeStorage();
    const cache = createNotificationCache(storage);
    await cache.save("u1", [make("a")]);
    expect(await cache.load("u2")).toBeNull();
  });

  it("clear removes the entry", async () => {
    const { storage, data } = fakeStorage();
    const cache = createNotificationCache(storage);
    await cache.save("u1", [make("a")]);
    await cache.clear("u1");
    expect(data.has(keyFor("u1"))).toBe(false);
  });

  it("ignores an entry older than the max age", async () => {
    const { storage } = fakeStorage();
    let now = 1_000_000;
    const cache = createNotificationCache(storage, () => now);
    await cache.save("u1", [make("a")]);
    now += NOTIFICATION_CACHE.maxAgeMs + 1;
    expect(await cache.load("u1")).toBeNull();
  });

  it("ignores corrupt JSON", async () => {
    const { storage, data } = fakeStorage();
    data.set(keyFor("u1"), "{not json");
    expect(await createNotificationCache(storage).load("u1")).toBeNull();
  });

  it("ignores an entry written by another version of the app", async () => {
    const { storage, data } = fakeStorage();
    data.set(keyFor("u1"), JSON.stringify({ v: 999, savedAt: Date.now(), items: [make("a")] }));
    expect(await createNotificationCache(storage).load("u1")).toBeNull();
  });

  it("drops items that are not valid notifications", async () => {
    const { storage, data } = fakeStorage();
    const entry = {
      v: NOTIFICATION_CACHE.version,
      savedAt: Date.now(),
      items: [make("a"), { id: 5 }, "junk", null],
    };
    data.set(keyFor("u1"), JSON.stringify(entry));
    const loaded = await createNotificationCache(storage).load("u1");
    expect(loaded?.map((n) => n.id)).toEqual(["a"]);
  });

  it("never throws when storage is broken (the cache is only an optimisation)", async () => {
    const broken: KeyValueStorage = {
      getItem: async () => {
        throw new Error("blocked");
      },
      setItem: async () => {
        throw new Error("full");
      },
      removeItem: async () => {
        throw new Error("blocked");
      },
    };
    const cache = createNotificationCache(broken);
    await expect(cache.save("u1", [make("a")])).resolves.toBeUndefined();
    await expect(cache.load("u1")).resolves.toBeNull();
    await expect(cache.clear("u1")).resolves.toBeUndefined();
  });
});
