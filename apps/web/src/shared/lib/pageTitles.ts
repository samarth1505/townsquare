import { ROUTES } from "./routes";

const APP_NAME = "Hub";
const NOT_FOUND_TITLE = "Page not found";

// What the browser tab (and a screen reader, on every page change) says about each page. Titles must be UNIQUE
// per page: it is the first thing a screen reader announces and what the browser history lists.
const PAGE_TITLES: Record<string, string> = {
  [ROUTES.login]: "Log in",
  [ROUTES.home]: "Your feed",
  [ROUTES.settingsProfile]: "Profile settings",
  [ROUTES.settingsSecurity]: "Security settings",
  [ROUTES.virtualDemo]: "Labs",
  [ROUTES.reactLab]: "React lab",
};

export function getPageTitle(pathname: string): string {
  const title = PAGE_TITLES[pathname] ?? NOT_FOUND_TITLE;
  return `${title} | ${APP_NAME}`;
}
