import { useEffect, useRef } from "react";
import { useAuth } from "@/features/auth";
import { analytics, errorReporter } from "@/shared/lib/monitoring";

// Tells the monitoring tools WHO is logged in (an opaque id only) so reports can be grouped per user,
// and tells them to forget the user at logout.
export function useMonitoringIdentity() {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;
  const previousUserId = useRef<string | null>(null);

  useEffect(() => {
    if (userId) {
      errorReporter.setUser({ id: userId });
      analytics.identify(userId);
    } else {
      errorReporter.setUser(null);
      // Only a real logout starts a new session. (At first load there is nobody yet: nothing to reset.)
      if (previousUserId.current) analytics.reset();
    }
    previousUserId.current = userId;
  }, [userId]);
}
