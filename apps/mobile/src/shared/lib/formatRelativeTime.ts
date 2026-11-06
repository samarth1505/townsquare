const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const JUST_NOW_SECONDS = 45;

const plural = (count: number, unit: string) => `${count} ${unit}${count === 1 ? "" : "s"} ago`;

// "just now", "5 minutes ago", "3 hours ago", "yesterday". Written by hand on purpose: the web version uses
// Intl.RelativeTimeFormat, but React Native's JS engine (Hermes) ships only part of Intl, so we do not depend on it.
export function formatRelativeTime(isoDate: string, now: number = Date.now()): string {
  const seconds = Math.max(0, Math.round((now - new Date(isoDate).getTime()) / 1000));
  if (seconds < JUST_NOW_SECONDS) return "just now";
  if (seconds < HOUR) return plural(Math.round(seconds / MINUTE), "minute");
  if (seconds < DAY) return plural(Math.round(seconds / HOUR), "hour");
  const days = Math.round(seconds / DAY);
  return days === 1 ? "yesterday" : plural(days, "day");
}
