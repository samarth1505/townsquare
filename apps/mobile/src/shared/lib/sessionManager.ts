import {
  ApiError,
  singleFlight,
  type AuthApi,
  type KeyValueStorage,
  type Session,
  type SessionHolder,
} from "@hub/core";

// Keys may contain letters, digits, ".", "-" and "_" only (a SecureStore rule).
const REFRESH_TOKEN_KEY = "hub.refresh-token";

export type RestoreResult =
  | { status: "signedIn"; session: Session }
  | { status: "signedOut" } // there was no saved session, or the server REFUSED it
  | { status: "unreachable" }; // we could not ask: no network, a timeout, or a server error

type Dependencies = {
  authApi: AuthApi; // the plain client (no token, no interceptor): refreshing must not trigger another refresh
  storage: KeyValueStorage; // secure storage on the phone
  holder: SessionHolder; // where the short-lived access token lives (memory only)
};

// THE LIFECYCLE OF A PHONE SESSION.
//   - The ACCESS token (30 s here, minutes in real systems) lives only in memory.
//   - The REFRESH token (long-lived, single-use, rotated on every use) lives in secure storage, so the user stays
//     signed in after the app is closed and the phone restarted.
// The web app does the same job with an httpOnly cookie that the browser stores and sends for us; a phone has no cookie
// jar, so this class is the "cookie jar".
export function createSessionManager({ authApi, storage, holder }: Dependencies) {
  let onRefreshed: ((session: Session) => void) | null = null;

  // ONE refresh at a time. A refresh token works exactly once, so two overlapping refreshes (the app-start restore AND a
  // request that got 401) would make the second one fail and wrongly sign the user out. Callers share one promise.
  const refreshOnce = singleFlight(async (): Promise<RestoreResult> => {
    const refreshToken = await storage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) return { status: "signedOut" };

    try {
      const session = await authApi.refresh(refreshToken);
      if (!session.refreshToken) throw new ApiError(0, "missing_refresh_token");
      // ROTATION: the old refresh token is dead now. Save the NEW one before doing anything else, or a crash right here
      // would leave the phone holding a dead token (the user would be signed out for no reason).
      await storage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
      holder.setAccessToken(session.accessToken);
      return { status: "signedIn", session };
    } catch (error) {
      // ONLY a 401 means "the server says this login is over". Anything else (airplane mode, a timeout, a 500) says
      // nothing about the token, so we KEEP it and report "unreachable" instead of logging the user out.
      if (error instanceof ApiError && error.status === 401) {
        await storage.removeItem(REFRESH_TOKEN_KEY);
        holder.setAccessToken(null);
        return { status: "signedOut" };
      }
      return { status: "unreachable" };
    }
  });

  return {
    // App start: turn a saved refresh token into a live session (or learn that there is none).
    restore: () => refreshOnce(),

    // Called by the HTTP client when a request got 401 (the access token expired). Returns true if a new token is ready.
    refresh: async (): Promise<boolean> => {
      const result = await refreshOnce();
      if (result.status === "signedIn") {
        onRefreshed?.(result.session);
        return true;
      }
      if (result.status === "signedOut") holder.expire(); // tell the UI: the session is really over
      return false;
    },

    // After a successful login: keep the access token in memory and the refresh token in secure storage.
    persist: async (session: Session): Promise<void> => {
      holder.setAccessToken(session.accessToken); // first, so the very next request is authorised
      if (!session.refreshToken) throw new ApiError(0, "missing_refresh_token");
      await storage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
    },

    // Logout: the phone forgets at once; the server is told afterwards, on a best-effort basis.
    signOut: async (): Promise<void> => {
      const refreshToken = await storage.getItem(REFRESH_TOKEN_KEY);
      await storage.removeItem(REFRESH_TOKEN_KEY);
      holder.setAccessToken(null);
      if (refreshToken) void authApi.logout(refreshToken).catch(() => {}); // offline? the token just expires by itself
    },

    setOnRefreshed: (callback: ((session: Session) => void) | null) => {
      onRefreshed = callback;
    },
  };
}
