// WHERE a tapped push notification may take the user. The payload comes from outside the app (the server, and in
// the worst case anyone who can craft a push), so it is UNTRUSTED input: we never navigate to whatever string it
// contains, only to routes we list here. This is the same idea as validating a socket message before trusting it.
export const PUSH_TARGETS = ["/", "/notifications", "/account"] as const;
export type PushTarget = (typeof PUSH_TARGETS)[number];

export function parsePushTarget(data: unknown): PushTarget | null {
  if (typeof data !== "object" || data === null) return null;
  const url = (data as Record<string, unknown>).url;
  return PUSH_TARGETS.find((target) => target === url) ?? null;
}
