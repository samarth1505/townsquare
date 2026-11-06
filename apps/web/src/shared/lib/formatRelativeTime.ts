const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" }); // created once

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const JUST_NOW_SECONDS = 45;

// "just now", "5 minutes ago", "3 hours ago", "yesterday"
export function formatRelativeTime(isoDate: string, now: number = Date.now()): string {
  const seconds = Math.round((new Date(isoDate).getTime() - now) / 1000); // negative = in the past
  const abs = Math.abs(seconds);
  if (abs < JUST_NOW_SECONDS) return "just now";
  if (abs < HOUR) return formatter.format(Math.round(seconds / MINUTE), "minute");
  if (abs < DAY) return formatter.format(Math.round(seconds / HOUR), "hour");
  return formatter.format(Math.round(seconds / DAY), "day");
}
