import type { Notification } from "./types";

// Runtime shape check. TypeScript types disappear after compilation, so data that comes from OUTSIDE the
// program (a socket message, a storage entry) must be checked with real code before we trust it.
export function isNotification(value: unknown): value is Notification {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.title === "string" &&
    typeof v.body === "string" &&
    typeof v.createdAt === "string" &&
    typeof v.read === "boolean"
  );
}
