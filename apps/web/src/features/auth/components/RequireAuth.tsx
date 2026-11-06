import { Navigate, Outlet, useLocation } from "react-router";
import { Splash } from "@/shared/components";
import { ROUTES } from "@/shared/lib/routes";
import { useAuth } from "../context/authContext";
import type { LoginRedirectState } from "../types";

// Route guard: wraps the private routes. Logged in -> render the child route; otherwise -> /login.
export default function RequireAuth() {
  const { session, isRestoring } = useAuth();
  const location = useLocation();

  // Wait for the startup check before deciding, otherwise a logged-in user would be bounced to /login.
  if (isRestoring) return <Splash />;

  if (session === null) {
    // `replace` swaps the history entry so Back doesn't return to the guarded page.
    // `state.from` remembers where the user was going, so login can send them back there.
    return (
      <Navigate
        to={ROUTES.login}
        replace
        state={{ from: location.pathname } satisfies LoginRedirectState}
      />
    );
  }

  return <Outlet />;
}
