import { NavLink } from "react-router";
import { ROUTES } from "@/shared/lib/routes";
import { SHELL_MESSAGES } from "../messages";
import styles from "./Shell.module.css";

// `end` = "active ONLY on the exact path". Parents like Settings must NOT use it, otherwise they would lose
// their highlight on /settings/profile. (React Router already treats a link to "/" as `end`, so Home's is just explicit.)
const NAV_ITEMS = [
  { to: ROUTES.home, label: SHELL_MESSAGES.home, end: true },
  { to: ROUTES.settings, label: SHELL_MESSAGES.settings, end: false },
  { to: ROUTES.virtualDemo, label: SHELL_MESSAGES.labs, end: false },
  { to: ROUTES.reactLab, label: SHELL_MESSAGES.reactLab, end: false },
] as const;

export default function SideNav() {
  return (
    <nav
      className={styles.sideNav}
      aria-label={SHELL_MESSAGES.mainNav}
    >
      <ul className={styles.navList}>
        {NAV_ITEMS.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={styles.link}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
