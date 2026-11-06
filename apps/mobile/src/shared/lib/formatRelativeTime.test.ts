import { formatRelativeTime } from "./formatRelativeTime";

const NOW = Date.parse("2026-10-29T12:00:00.000Z");
const ago = (seconds: number) => new Date(NOW - seconds * 1000).toISOString();

describe("formatRelativeTime", () => {
  it.each([
    [0, "just now"],
    [44, "just now"],
    [45, "1 minute ago"],
    [5 * 60, "5 minutes ago"],
    [59 * 60, "59 minutes ago"],
    [60 * 60, "1 hour ago"],
    [3 * 3600, "3 hours ago"],
    [24 * 3600, "yesterday"],
    [3 * 24 * 3600, "3 days ago"],
  ])("%i seconds ago reads %s", (seconds, expected) => {
    expect(formatRelativeTime(ago(seconds), NOW)).toBe(expected);
  });

  it("treats a time slightly in the future (clock skew) as just now", () => {
    expect(formatRelativeTime(ago(-30), NOW)).toBe("just now");
  });
});
