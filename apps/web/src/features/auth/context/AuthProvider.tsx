import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@hub/core";
import { authApi } from "@/shared/lib/api";
import { authSession } from "@/shared/lib/authSession";
import { AuthContext } from "./authContext";

type AuthProviderProps = {
  children: ReactNode;
};

// Restore the session at most ONCE per page load. React StrictMode runs effects twice in development,
// and refresh tokens are single-use (rotated): a second request would be rejected and log the user out.
// Both effect runs share this one promise (a tiny "single-flight").
let restorePromise: Promise<Session | null> | null = null;
function restoreSessionOnce(): Promise<Session | null> {
  restorePromise ??= authApi.refresh().catch(() => null); // no cookie / expired -> not logged in
  return restorePromise;
}

// Owns the session state and publishes it to everything rendered inside it.
// The access token lives in memory only (not localStorage), so an XSS script can't read it from storage.
export default function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  // On startup: the httpOnly refresh cookie (if any) is sent automatically; the server returns a new session.
  useEffect(() => {
    let cancelled = false;
    restoreSessionOnce().then((restored) => {
      if (cancelled) return; // the component was unmounted (or this effect run was cleaned up)
      authSession.setAccessToken(restored?.accessToken ?? null);
      setSession(restored);
      setIsRestoring(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // The HTTP client calls this when a refresh fails (cookie gone/expired): drop the session so the guard sends us to /login.
  useEffect(() => {
    authSession.setOnExpired(() => setSession(null));
    return () => authSession.setOnExpired(null);
  }, []);

  // Memoised so consumers re-render only when the session or restoring flag really changes.
  const value = useMemo(
    () => ({
      session,
      isRestoring,
      signIn: (newSession: Session) => {
        authSession.setAccessToken(newSession.accessToken); // set synchronously so the very next request is authorised
        setSession(newSession);
      },
      signOut: () => {
        authSession.setAccessToken(null);
        setSession(null);
      },
    }),
    [session, isRestoring],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
