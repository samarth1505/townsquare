import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@hub/core";
import { authSession } from "@/shared/lib/authSession";
import { unregisterFromPush } from "@/shared/lib/pushRegistration";
import { sessionManager, type RestoreResult } from "@/shared/lib/session";

// One of four situations, and impossible combinations cannot be written (a `session` exists only when signed in).
type AuthState =
  | { status: "restoring" } // app just started: checking the saved login (the native splash screen stays up)
  | { status: "signedOut" }
  | { status: "signedIn"; session: Session }
  | { status: "unreachable" }; // a saved login exists but the server could not be asked (offline, down)

type AuthContextValue = {
  status: AuthState["status"];
  session: Session | null;
  refreshCount: number; // how many times the access token was renewed silently (shown on the home screen as a demo)
  signIn: (session: Session) => Promise<void>;
  signOut: () => Promise<void>;
  retryRestore: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const toState = (result: RestoreResult): AuthState =>
  result.status === "signedIn"
    ? { status: "signedIn", session: result.session }
    : { status: result.status };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "restoring" });
  const [refreshCount, setRefreshCount] = useState(0);

  const restore = useCallback(() => {
    setState({ status: "restoring" });
    void sessionManager.restore().then((result) => setState(toState(result)));
  }, []);

  // At app start: use the saved refresh token to get a fresh session. A ref makes it run ONCE even when development
  // mode runs effects twice (a second run would spend the single-use token again).
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    restore();
  }, [restore]);

  // The HTTP layer reports two things back to the UI:
  //   - a silent token renewal succeeded (we count it, and keep the session object current)
  //   - the session is really over (the server refused the refresh token): show the login screen
  useEffect(() => {
    authSession.setOnExpired(() => setState({ status: "signedOut" }));
    sessionManager.setOnRefreshed((session) => {
      setRefreshCount((count) => count + 1);
      setState({ status: "signedIn", session });
    });
    return () => {
      authSession.setOnExpired(null);
      sessionManager.setOnRefreshed(null);
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status: state.status,
      session: state.status === "signedIn" ? state.session : null,
      refreshCount,
      signIn: async (session) => {
        setState({ status: "signedIn", session }); // the user is in immediately...
        try {
          await sessionManager.persist(session); // ...and the login is saved for the next app start
        } catch {
          // The keychain refused the write: the user stays signed in for this run, but will have to log in again next time.
        }
      },
      signOut: async () => {
        void unregisterFromPush(); // must START before the token is cleared below; not awaited, logout stays instant
        setState({ status: "signedOut" }); // logged out on screen immediately
        await sessionManager.signOut();
      },
      retryRestore: restore,
    }),
    [state, refreshCount, restore],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}
