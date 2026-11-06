import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { installGlobalErrorHandlers } from "./globalHandlers";

describe("installGlobalErrorHandlers", () => {
  const report = vi.fn();
  let remove: () => void;

  beforeEach(() => {
    report.mockClear();
    remove = installGlobalErrorHandlers(report);
  });
  afterEach(() => remove());

  it("reports an error thrown outside React (window 'error' event)", () => {
    const error = new Error("thrown in a click handler");
    window.dispatchEvent(
      new ErrorEvent("error", { error, message: error.message, filename: "app.js", lineno: 7 }),
    );
    expect(report).toHaveBeenCalledWith(error, {
      source: "window.onerror",
      file: "app.js",
      line: 7,
    });
  });

  it("wraps a non-Error thrown value so there is always a stack to look at", () => {
    window.dispatchEvent(new ErrorEvent("error", { message: "Script error." }));
    expect(report.mock.calls[0]![0]).toBeInstanceOf(Error);
  });

  it("reports a promise that failed with nobody handling it", () => {
    const reason = new Error("fetch failed");
    const event = Object.assign(new Event("unhandledrejection"), { reason });
    window.dispatchEvent(event);
    expect(report).toHaveBeenCalledWith(reason, { source: "unhandledrejection" });
  });

  it("turns a rejected non-Error value into an Error", () => {
    window.dispatchEvent(
      Object.assign(new Event("unhandledrejection"), { reason: "just a string" }),
    );
    const [error] = report.mock.calls[0]!;
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toContain("just a string");
  });

  it("stops reporting once removed", () => {
    remove();
    // Nothing handles this event any more, so the test runner would treat it as a real crash:
    // mark it as expected with a throwaway listener that "handles" (cancels) it.
    const expected = (event: Event) => event.preventDefault();
    window.addEventListener("error", expected, { once: true });
    window.dispatchEvent(
      new ErrorEvent("error", { error: new Error("late"), message: "late", cancelable: true }),
    );
    expect(report).not.toHaveBeenCalled();
  });
});
