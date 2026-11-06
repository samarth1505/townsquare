import { useLoginFlow as useSharedLoginFlow } from "@hub/core";
import { authApi } from "@/shared/lib/api";
import { analytics } from "@/shared/lib/monitoring";
import { useAuth } from "../context/authContext";

// The login flow's state machine is shared with the mobile app (in @hub/core). THIS file is only the web's wiring:
// which network layer to use, how a new session is published, and what to track.
export function useLoginFlow() {
  const { signIn } = useAuth();

  return useSharedLoginFlow({
    authApi,
    onSignedIn: (session, channel) => {
      signIn(session); // publish the session to the whole app via the auth context
      analytics.track("login_succeeded", { channel });
    },
  });
}
