import { Link } from "react-router";
import { maskPhone } from "@hub/core";
import { useAuth, useLogout } from "@/features/auth";
import { NotificationMenu } from "@/features/notifications";
import { Button, Row } from "@/shared/components";
import { ROUTES } from "@/shared/lib/routes";
import { SHELL_MESSAGES } from "../messages";
import styles from "./Shell.module.css";

export default function TopBar() {
  const { session } = useAuth();
  const logout = useLogout();

  return (
    <header className={styles.topBar}>
      <Row
        justify="between"
        align="center"
        wrap
      >
        <Link
          to={ROUTES.home}
          className={styles.brand}
        >
          {SHELL_MESSAGES.brand}
        </Link>
        <Row
          gap={3}
          align="center"
        >
          <NotificationMenu />
          {session && <span className={styles.user}>{maskPhone(session.user.phone)}</span>}
          <Button
            variant="secondary"
            onClick={logout}
          >
            {SHELL_MESSAGES.logout}
          </Button>
        </Row>
      </Row>
    </header>
  );
}
