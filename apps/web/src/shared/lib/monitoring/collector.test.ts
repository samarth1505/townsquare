import { describe, expect, it, vi } from "vitest";
import { createCollectorAnalyticsTransport, createCollectorErrorReporter } from "./collector";

describe("createCollectorErrorReporter", () => {
  it("sends the error with the user and the breadcrumbs that led to it", () => {
    const send = vi.fn();
    const reporter = createCollectorErrorReporter("http://x/errors", send);
    reporter.setUser({ id: "u1" });
    reporter.addBreadcrumb("navigate", { path: "/" });
    reporter.addBreadcrumb("navigate", { path: "/settings" });
    reporter.captureError(new TypeError("boom"), { source: "test" });

    const [url, payload] = send.mock.calls[0] as [string, Record<string, unknown>];
    expect(url).toBe("http://x/errors");
    expect(payload).toMatchObject({
      name: "TypeError",
      message: "boom",
      context: { source: "test" },
      user: { id: "u1" },
    });
    expect((payload.breadcrumbs as unknown[]).length).toBe(2);
    expect(payload.stack).toEqual(expect.any(String));
  });

  it("keeps only the latest 20 breadcrumbs", () => {
    const send = vi.fn();
    const reporter = createCollectorErrorReporter("u", send);
    for (let i = 0; i < 30; i += 1) reporter.addBreadcrumb(`step ${i}`);
    reporter.captureError(new Error("x"));
    const { breadcrumbs } = send.mock.calls[0]![1] as { breadcrumbs: Array<{ message: string }> };
    expect(breadcrumbs).toHaveLength(20);
    expect(breadcrumbs[0]!.message).toBe("step 10");
  });

  it("wraps a thrown non-Error", () => {
    const send = vi.fn();
    createCollectorErrorReporter("u", send).captureError("just text");
    expect(send.mock.calls[0]![1]).toMatchObject({ name: "Error", message: "just text" });
  });
});

describe("createCollectorAnalyticsTransport", () => {
  it("posts the batch as { events }", () => {
    const send = vi.fn();
    const events = [
      { name: "logout", props: {}, timestamp: 1, sessionId: "s", userId: null },
    ] as const;
    createCollectorAnalyticsTransport("http://x/events", send).send([...events]);
    expect(send).toHaveBeenCalledWith("http://x/events", { events });
  });
});
