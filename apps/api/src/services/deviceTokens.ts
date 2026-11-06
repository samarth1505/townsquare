// Which push tokens belong to which user (in memory here; a real server keeps them in a database).
// A token identifies ONE phone. If a different person logs in on that phone, the token MOVES to them, so the previous
// user can never receive the new user's notifications (and vice versa).
const tokensByUser = new Map<string, Set<string>>();

export function registerDeviceToken(userId: string, token: string): void {
  for (const [otherUserId, tokens] of tokensByUser) {
    if (otherUserId !== userId) tokens.delete(token);
  }
  let tokens = tokensByUser.get(userId);
  if (!tokens) {
    tokens = new Set();
    tokensByUser.set(userId, tokens);
  }
  tokens.add(token);
}

export function unregisterDeviceToken(userId: string, token: string): void {
  tokensByUser.get(userId)?.delete(token);
}

export const deviceTokensFor = (userId: string): string[] => [...(tokensByUser.get(userId) ?? [])];
