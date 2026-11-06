import { useNotificationsLifecycle } from "@/features/notifications";
import { useMonitoringIdentity } from "./useMonitoringIdentity";

// App-wide side effects that must outlive any single page. It renders nothing ("headless component").
// It is mounted ABOVE the router and the auth guard, so it keeps running when the user logs out:
// a hook inside AppLayout would be UNMOUNTED at logout and never see "no user" (it would not clean up).
export default function AppEffects() {
  useNotificationsLifecycle();
  useMonitoringIdentity();
  return null;
}
