import { useEffect } from "react";
import { useLocation } from "react-router";
import { analytics, errorReporter } from "@/shared/lib/monitoring";

// Records every navigation twice: as a page view (analytics) and as a breadcrumb (so an error report can show
// "the user went /login -> / -> /settings and then it crashed"). Only the PATHNAME is used, never the query string.
// (In development StrictMode runs effects twice, so you will see each view twice; production sends it once.)
export default function RouteTracker() {
  const { pathname } = useLocation();

  useEffect(() => {
    analytics.track("page_viewed", { path: pathname });
    errorReporter.addBreadcrumb("navigate", { path: pathname });
  }, [pathname]);

  return null;
}
