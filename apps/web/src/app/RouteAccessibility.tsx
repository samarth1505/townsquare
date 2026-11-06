import { useEffect, useRef } from "react";
import { useLocation } from "react-router";
import { MAIN_CONTENT_ID } from "@/shared/lib/a11y";
import { getPageTitle } from "@/shared/lib/pageTitles";

// In a single-page app the browser does NOT do what it does for a real page load: the tab title stays the same and
// keyboard focus stays on the link you clicked (which may even be gone). A screen-reader user then hears nothing
// and has no idea the page changed. So on every navigation we (1) update the title and (2) move focus to <main>.
export default function RouteAccessibility() {
  const { pathname } = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    document.title = getPageTitle(pathname);
    if (isFirstRender.current) {
      isFirstRender.current = false; // first load: the browser already handles focus; do not steal it
      return;
    }
    document.getElementById(MAIN_CONTENT_ID)?.focus({ preventScroll: true });
  }, [pathname]); // keyed on the PATH only: changing a tab or a search term does not move focus

  return null;
}
