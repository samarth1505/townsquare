import { describe, expect, it } from "vitest";
import { NOTIFICATION_EVENTS } from "./constants";
import { parseNotificationEvent } from "./realtime";

const valid = {
  id: "n1",
  title: "t",
  body: "b",
  createdAt: "2026-10-27T10:00:00.000Z",
  read: false,
};

describe("parseNotificationEvent (socket messages are untrusted)", () => {
  it("accepts a well-formed event", () => {
    const event = { type: NOTIFICATION_EVENTS.created, notification: valid };
    expect(parseNotificationEvent(event)).toEqual(valid);
  });

  it.each([
    ["null", null],
    ["a string", "hello"],
    ["the hello message", { type: "hello", userId: "u1" }],
    ["an unknown type", { type: "other", notification: valid }],
    ["a missing notification", { type: NOTIFICATION_EVENTS.created }],
    [
      "a wrong field type",
      { type: NOTIFICATION_EVENTS.created, notification: { ...valid, read: "no" } },
    ],
    ["a missing field", { type: NOTIFICATION_EVENTS.created, notification: { id: "n1" } }],
  ])("ignores %s", (_name, data) => {
    expect(parseNotificationEvent(data)).toBeNull();
  });
});
