import { describe, expect, it } from "vitest";
import { backoffDelay } from "./backoff";

const options = { baseMs: 1000, maxMs: 30_000 };

describe("backoffDelay", () => {
  it("doubles the ceiling on every attempt (random = 1 gives the ceiling itself)", () => {
    const ceilings = [0, 1, 2, 3, 4].map((attempt) => backoffDelay(attempt, options, () => 1));
    expect(ceilings).toEqual([1000, 2000, 4000, 8000, 16_000]);
  });

  it("never waits longer than the cap, however many attempts have failed", () => {
    expect(backoffDelay(10, options, () => 1)).toBe(30_000);
    expect(backoffDelay(500, options, () => 1)).toBe(30_000);
  });

  it("random = 0 gives half the ceiling (the minimum wait)", () => {
    const floors = [0, 1, 2].map((attempt) => backoffDelay(attempt, options, () => 0));
    expect(floors).toEqual([500, 1000, 2000]);
  });

  it("always lands between half the ceiling and the ceiling (that spread is the jitter)", () => {
    for (let i = 0; i <= 100; i += 1) {
      const delay = backoffDelay(3, options, () => i / 100);
      expect(delay).toBeGreaterThanOrEqual(4000);
      expect(delay).toBeLessThanOrEqual(8000);
    }
  });
});
