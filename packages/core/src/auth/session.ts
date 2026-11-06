// A tiny in-memory holder for the access token and the "session expired" signal, readable OUTSIDE React.
// The HTTP client is not a component, so it cannot call useAuth(); the app's auth provider keeps this in sync instead.
// It is a FACTORY (not a global) so each app creates its own, and it contains nothing platform-specific:
// the web and the React Native app both use it.
export function createSessionHolder() {
  let accessToken: string | null = null;
  let onExpired: (() => void) | null = null;

  return {
    getAccessToken: () => accessToken,
    setAccessToken: (token: string | null) => {
      accessToken = token;
    },
    // The auth provider registers this so the HTTP client can tell React "the session is dead".
    setOnExpired: (callback: (() => void) | null) => {
      onExpired = callback;
    },
    expire: () => onExpired?.(),
  };
}

export type SessionHolder = ReturnType<typeof createSessionHolder>;
