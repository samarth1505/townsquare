import { describe, expect, it } from "vitest";
import { singleFlight } from "./singleFlight";

describe("singleFlight", () => {
  it("callers who arrive while the task runs share ONE run and ONE result", async () => {
    let runs = 0;
    let finish!: (value: string) => void;
    const refresh = singleFlight(() => {
      runs += 1;
      return new Promise<string>((resolve) => (finish = resolve));
    });

    const first = refresh();
    const second = refresh(); // arrives while the first is still running
    finish("new-token");

    expect(await first).toBe("new-token");
    expect(await second).toBe("new-token");
    expect(runs).toBe(1);
  });

  it("starts a fresh run once the previous one has finished", async () => {
    let runs = 0;
    const refresh = singleFlight(async () => ++runs);
    expect(await refresh()).toBe(1);
    expect(await refresh()).toBe(2);
  });

  it("a failed run does not get stuck: the next call tries again", async () => {
    let runs = 0;
    const refresh = singleFlight(async () => {
      runs += 1;
      if (runs === 1) throw new Error("boom");
      return "ok";
    });
    await expect(refresh()).rejects.toThrow("boom");
    expect(await refresh()).toBe("ok");
  });
});
