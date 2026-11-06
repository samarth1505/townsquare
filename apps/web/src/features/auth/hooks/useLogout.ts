import { useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/shared/lib/api";
import { analytics } from "@/shared/lib/monitoring";
import { useAuth } from "../context/authContext";

// Business layer for logging out.
export function useLogout() {
  const { signOut } = useAuth();
  const queryClient = useQueryClient();

  async function logout() {
    analytics.track("logout", {}); // recorded BEFORE sign-out, while the event can still carry the user id
    try {
      await authApi.logout(); // asks the server to revoke the refresh token + clear its cookie
    } finally {
      signOut(); // runs whether the request worked or failed: the user must end up logged out locally
      queryClient.clear(); // drop cached private data so the next user on this browser can't see it
    }
  }

  return logout;
}
