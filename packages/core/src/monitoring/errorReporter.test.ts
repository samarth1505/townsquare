import { describe, expect, it, vi } from "vitest";
import {
  combineErrorReporters,
  createConsoleErrorReporter,
  withDedupe,
  withRedaction,
} from "./errorReporter";
import type { ErrorReporter } from "./types";

function spyReporter(): ErrorReporter & { calls: unknown[][] } {
  const calls: unknown[][] = [];
  return {
    calls,
    captureError: (error, context) => void calls.push(["captureError", error, context]),
    setUser: (user) => void calls.push(["setUser", user]),
    addBreadcrumb: (message, data) => void calls.push(["addBreadcrumb", message, data]),
  };
}

describe("combineErrorReporters", () => {
  it("sends every call to every reporter", () => {
    const a = spyReporter();
    const b = spyReporter();
    combineErrorReporters([a, b]).captureError(new Error("x"), { k: 1 });
    expect(a.calls).toHaveLength(1);
    expect(b.calls).toHaveLength(1);
  });

  it("a reporter that throws affects neither the others nor the caller", () => {
    const broken: ErrorReporter = {
      captureError: () => {
        throw new Error("vendor down");
      },
      setUser: () => {
        throw new Error("vendor down");
      },
      addBreadcrumb: () => {
        throw new Error("vendor down");
      },
    };
    const healthy = spyReporter();
    const all = combineErrorReporters([broken, healthy]);
    expect(() => all.captureError(new Error("x"))).not.toThrow();
    expect(() => all.setUser({ id: "u" })).not.toThrow();
    expect(healthy.calls).toHaveLength(2);
  });
});

describe("withRedaction", () => {
  it("cleans the error, the context and breadcrumbs before they reach the reporter", () => {
    const inner = spyReporter();
    const safe = withRedaction(inner);
    safe.captureError(new Error("bad OTP for 9876543210"), {
      phone: "9876543210",
      route: "/login",
    });
    safe.addBreadcrumb("typed 9876543210", { token: "abc" });

    const [, error, context] = inner.calls[0] as [string, Error, Record<string, unknown>];
    expect(error.message).not.toContain("9876543210");
    expect(context).toEqual({ phone: "[redacted]", route: "/login" });
    const [, message, data] = inner.calls[1] as [string, string, Record<string, unknown>];
    expect(message).not.toContain("9876543210");
    expect(data).toEqual({ token: "[redacted]" });
  });
});

describe("withDedupe", () => {
  it("reports the same error only once inside the window, and again after it", () => {
    const inner = spyReporter();
    let time = 0;
    const reporter = withDedupe(inner, { windowMs: 1000, now: () => time });

    reporter.captureError(new Error("boom"));
    reporter.captureError(new Error("boom"));
    time = 500;
    reporter.captureError(new Error("boom"));
    expect(inner.calls).toHaveLength(1);

    time = 1500;
    reporter.captureError(new Error("boom"));
    expect(inner.calls).toHaveLength(2);
  });

  it("different errors are not merged", () => {
    const inner = spyReporter();
    const reporter = withDedupe(inner);
    reporter.captureError(new Error("one"));
    reporter.captureError(new Error("two"));
    reporter.captureError(new TypeError("one")); // same message, different type
    expect(inner.calls).toHaveLength(3);
  });

  it("passes setUser and breadcrumbs straight through", () => {
    const inner = spyReporter();
    const reporter = withDedupe(inner);
    reporter.setUser({ id: "u1" });
    reporter.addBreadcrumb("clicked");
    expect(inner.calls).toHaveLength(2);
  });
});

describe("createConsoleErrorReporter", () => {
  it("prints errors with their context", () => {
    const log = { error: vi.fn(), debug: vi.fn() };
    const error = new Error("x");
    createConsoleErrorReporter(log).captureError(error, { a: 1 });
    expect(log.error).toHaveBeenCalledWith("[error]", error, { a: 1 });
  });
});
