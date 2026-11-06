import { describe, expect, it } from "vitest";
import { initialNotificationsState, notificationsReducer } from "./reducer";
import type { Notification, NotificationsState } from "./types";

const make = (id: string, over: Partial<Notification> = {}): Notification => ({
  id,
  title: `title ${id}`,
  body: "body",
  createdAt: "2026-10-27T10:00:00.000Z",
  read: false,
  ...over,
});

const ready = (items: Notification[]): NotificationsState => ({
  status: "ready",
  items,
  errorCode: null,
});

describe("notificationsReducer", () => {
  it("load/succeeded stores the items newest first", () => {
    const old = make("old", { createdAt: "2026-10-27T08:00:00.000Z" });
    const fresh = make("fresh", { createdAt: "2026-10-27T09:00:00.000Z" });
    const state = notificationsReducer(initialNotificationsState, {
      type: "load/succeeded",
      items: [old, fresh],
    });
    expect(state.status).toBe("ready");
    expect(state.items.map((n) => n.id)).toEqual(["fresh", "old"]);
  });

  it("a received notification is added at the top", () => {
    const state = notificationsReducer(ready([make("a")]), {
      type: "received",
      notification: make("b", { createdAt: "2026-10-27T11:00:00.000Z" }),
    });
    expect(state.items.map((n) => n.id)).toEqual(["b", "a"]);
  });

  it("a duplicate returns the SAME state object (so nobody is notified)", () => {
    const before = ready([make("a")]);
    const after = notificationsReducer(before, { type: "received", notification: make("a") });
    expect(after).toBe(before); // toBe = same reference, not just equal contents
  });

  it("markRead/optimistic marks one item and leaves the others untouched", () => {
    const before = ready([make("a"), make("b")]);
    const after = notificationsReducer(before, { type: "markRead/optimistic", id: "a" });
    expect(after.items.find((n) => n.id === "a")?.read).toBe(true);
    expect(after.items.find((n) => n.id === "b")).toBe(before.items[1]); // same object: not re-created
  });

  it("marking an already-read item changes nothing", () => {
    const before = ready([make("a", { read: true })]);
    expect(notificationsReducer(before, { type: "markRead/optimistic", id: "a" })).toBe(before);
  });

  it("a failed mark-all restores ONLY the ids that were unread before", () => {
    const before = ready([make("unread"), make("alreadyRead", { read: true })]);
    const optimistic = notificationsReducer(before, { type: "markAllRead/optimistic" });
    const rolledBack = notificationsReducer(optimistic, {
      type: "markAllRead/rolledBack",
      ids: ["unread"],
    });
    expect(rolledBack.items.find((n) => n.id === "unread")?.read).toBe(false);
    expect(rolledBack.items.find((n) => n.id === "alreadyRead")?.read).toBe(true);
  });

  it("hydrated shows the saved items as ready", () => {
    const state = notificationsReducer(initialNotificationsState, {
      type: "hydrated",
      items: [make("a")],
    });
    expect(state).toMatchObject({ status: "ready", errorCode: null });
    expect(state.items).toHaveLength(1);
  });

  it("load/failed keeps the items we already have", () => {
    const state = notificationsReducer(ready([make("a")]), { type: "load/failed", code: "x" });
    expect(state).toMatchObject({ status: "error", errorCode: "x" });
    expect(state.items).toHaveLength(1);
  });

  it("reset returns to the initial state", () => {
    expect(notificationsReducer(ready([make("a")]), { type: "reset" })).toBe(
      initialNotificationsState,
    );
  });
});
