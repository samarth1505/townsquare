import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createAnalytics } from "./analytics";
import type { AnalyticsEvent } from "./types";

function setup(overrides: Partial<Parameters<typeof createAnalytics>[0]> = {}) {
  const sent: AnalyticsEvent[][] = [];
  let sessionCounter = 0;
  const analytics = createAnalytics({
    transport: { send: (events) => void sent.push(events) },
    consent: true,
    now: () => 1000,
    createSessionId: () => `session-${++sessionCounter}`,
    ...overrides,
  });
  return { analytics, sent };
}

describe("analytics", () => {
  beforeEach(() => void vi.useFakeTimers());
  afterEach(() => void vi.useRealTimers());

  it("sends nothing immediately: events wait in a batch", () => {
    const { analytics, sent } = setup();
    analytics.track("page_viewed", { path: "/" });
    expect(sent).toHaveLength(0);
  });

  it("sends the whole batch in ONE call after the flush interval", async () => {
    const { analytics, sent } = setup({ flushIntervalMs: 5000 });
    analytics.track("page_viewed", { path: "/" });
    analytics.track("logout", {});
    await vi.advanceTimersByTimeAsync(5000);
    expect(sent).toHaveLength(1);
    expect(sent[0]!.map((e) => e.name)).toEqual(["page_viewed", "logout"]);
  });

  it("sends early when the batch is full", () => {
    const { analytics, sent } = setup({ maxBatchSize: 3 });
    for (let i = 0; i < 3; i += 1) analytics.track("page_viewed", { path: `/${i}` });
    expect(sent).toHaveLength(1);
    expect(sent[0]).toHaveLength(3);
  });

  it("flush() sends what is waiting (used when the page is being hidden)", () => {
    const { analytics, sent } = setup();
    analytics.track("page_viewed", { path: "/" });
    analytics.flush();
    expect(sent).toHaveLength(1);
    analytics.flush(); // nothing left: no empty request
    expect(sent).toHaveLength(1);
  });

  it("stamps each event with the user and the session at the time it happened", () => {
    const { analytics, sent } = setup();
    analytics.track("page_viewed", { path: "/a" }); // anonymous
    analytics.identify("u1");
    analytics.track("page_viewed", { path: "/b" });
    analytics.flush();
    expect(sent[0]!.map((e) => e.userId)).toEqual([null, "u1"]);
    expect(sent[0]![0]).toMatchObject({ sessionId: "session-1", timestamp: 1000 });
  });

  it("reset() sends pending events under the OLD user, then starts a new anonymous session", () => {
    const { analytics, sent } = setup();
    analytics.identify("u1");
    analytics.track("logout", {});
    analytics.reset();
    expect(sent[0]![0]).toMatchObject({ userId: "u1", sessionId: "session-1" });

    analytics.track("page_viewed", { path: "/login" });
    analytics.flush();
    expect(sent[1]![0]).toMatchObject({ userId: null, sessionId: "session-2" });
  });

  it("records nothing without consent", () => {
    const { analytics, sent } = setup({ consent: false });
    analytics.track("page_viewed", { path: "/" });
    analytics.flush();
    expect(sent).toHaveLength(0);
    analytics.setConsent(true);
    analytics.track("page_viewed", { path: "/" });
    analytics.flush();
    expect(sent).toHaveLength(1);
  });

  it("withdrawing consent drops everything not yet sent", () => {
    const { analytics, sent } = setup();
    analytics.track("page_viewed", { path: "/" });
    analytics.setConsent(false);
    analytics.flush();
    expect(sent).toHaveLength(0);
  });

  it("cleans personal data out of event properties", () => {
    const { analytics, sent } = setup();
    analytics.track("page_viewed", { path: "/search/9876543210" });
    analytics.flush();
    expect(JSON.stringify(sent[0])).not.toContain("9876543210");
  });

  it("a failing transport never throws into the app", () => {
    const { analytics } = setup({
      transport: {
        send: () => {
          throw new Error("network");
        },
      },
    });
    analytics.track("logout", {});
    expect(() => analytics.flush()).not.toThrow();
  });
});
