// Every URL path in the app, once. Used by <Route>, <Link>, <NavLink> and <Navigate>.
export const ROUTES = {
  home: "/",
  login: "/login",
  settings: "/settings",
  settingsProfile: "/settings/profile",
  settingsSecurity: "/settings/security",
  virtualDemo: "/virtual-demo",
  reactLab: "/react-lab",
} as const;

// Nested <Route path> values are RELATIVE to their parent (settings), so they are separate constants.
export const SETTINGS_SEGMENTS = {
  profile: "profile",
  security: "security",
} as const;
