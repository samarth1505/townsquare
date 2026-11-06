import { describe, expect, it, vi } from "vitest";
import { createSentryReporter } from "./sentry";

// A fake SDK whose loading the TEST controls, so we can look at the moment BEFORE it has loaded.
function fakeSdk() {
  return {
    init: vi.fn(),
    captureException: vi.fn(),
    setUser: vi.fn(),
    addBreadcrumb: vi.fn(),
  };
}

function deferredLoad() {
  const sdk = fakeSdk();
  let finish!: () => void;
  let fail!: () => void;
  const promise = new Promise<typeof sdk>((resolve, reject) => {
    finish = () => resolve(sdk);
    fail = () => reject(new Error("blocked by an ad blocker"));
  });
  return { sdk, promise, finish, fail };
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0)); // let promise callbacks run

describe("createSentryReporter (lazy)", () => {
  it("queues calls until the SDK has loaded, then replays them in order", async () => {
    const { sdk, promise, finish } = deferredLoad();
    const reporter = createSentryReporter({ dsn: "d", environment: "test", load: () => promise });

    reporter.setUser({ id: "u1" });
    reporter.addBreadcrumb("navigate", { path: "/" });
    const error = new Error("boom");
    reporter.captureError(error, { a: 1 });
    expect(sdk.captureException).not.toHaveBeenCalled(); // not loaded yet: nothing sent

    finish();
    await flush();
    expect(sdk.init).toHaveBeenCalledWith(
      expect.objectContaining({ dsn: "d", environment: "test" }),
    );
    expect(sdk.setUser).toHaveBeenCalledWith({ id: "u1" });
    expect(sdk.addBreadcrumb).toHaveBeenCalledWith({
      category: "app",
      message: "navigate",
      data: { path: "/" },
    });
    expect(sdk.captureException).toHaveBeenCalledWith(error, { extra: { a: 1 } });
  });

  it("calls the SDK directly once it has loaded", async () => {
    const { sdk, promise, finish } = deferredLoad();
    const reporter = createSentryReporter({ dsn: "d", environment: "test", load: () => promise });
    finish();
    await flush();

    reporter.captureError(new Error("later"));
    expect(sdk.captureException).toHaveBeenCalledTimes(1);
  });

  it("initialises once, and filters out Sentry's own global handlers", async () => {
    const { sdk, promise, finish } = deferredLoad();
    createSentryReporter({ dsn: "d", environment: "test", load: () => promise });
    finish();
    await flush();

    expect(sdk.init).toHaveBeenCalledTimes(1);
    const { integrations } = sdk.init.mock.calls[0]![0] as {
      integrations: (defaults: Array<{ name: string }>) => Array<{ name: string }>;
    };
    const kept = integrations([{ name: "GlobalHandlers" }, { name: "Dedupe" }]);
    expect(kept.map((i) => i.name)).toEqual(["Dedupe"]);
  });

  it("if the SDK cannot load (ad blocker), nothing throws and the app keeps working", async () => {
    const { promise, fail } = deferredLoad();
    const reporter = createSentryReporter({ dsn: "d", environment: "test", load: () => promise });
    fail();
    await flush();
    expect(() => reporter.captureError(new Error("x"))).not.toThrow();
  });

  it("does not queue without limit while the SDK is still loading", () => {
    const { sdk, promise, finish } = deferredLoad();
    const reporter = createSentryReporter({ dsn: "d", environment: "test", load: () => promise });
    for (let i = 0; i < 500; i += 1) reporter.captureError(new Error(`e${i}`));
    finish();
    return flush().then(() =>
      expect(sdk.captureException.mock.calls.length).toBeLessThanOrEqual(50),
    );
  });
});
