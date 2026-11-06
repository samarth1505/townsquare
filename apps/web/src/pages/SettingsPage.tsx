import { NavLink, Outlet } from "react-router";
import { Row } from "@/shared/components";
import { ROUTES } from "@/shared/lib/routes";

// A NESTED layout: Settings has its own sub-navigation, and <Outlet /> shows the matched child page
// (Profile or Security) under /settings/profile or /settings/security.
export default function SettingsPage() {
  return (
    <section>
      <h1>Settings</h1>
      <nav aria-label="Settings sections">
        <Row gap={3}>
          <NavLink to={ROUTES.settingsProfile}>Profile</NavLink>
          <NavLink to={ROUTES.settingsSecurity}>Security</NavLink>
        </Row>
      </nav>
      <Outlet />
    </section>
  );
}
