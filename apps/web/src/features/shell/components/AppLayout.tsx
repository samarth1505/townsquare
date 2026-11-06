import { Suspense } from "react";
import { Outlet } from "react-router";
import { Main, Splash, Toaster } from "@/shared/components";
import { MAIN_CONTENT_ID } from "@/shared/lib/a11y";
import { COMMON_MESSAGES } from "@/shared/messages";
import { useScrollRestoration } from "@/shared/hooks/useScrollRestoration";
import SideNav from "./SideNav";
import TopBar from "./TopBar";
import styles from "./Shell.module.css";

// A LAYOUT ROUTE: the chrome (top bar + side nav) stays mounted while <Outlet /> swaps the page inside it.
export default function AppLayout() {
  useScrollRestoration();

  return (
    <div className={styles.shell}>
      {/* The FIRST thing a keyboard user reaches with Tab: invisible until focused, then jumps past the header and nav. */}
      <a
        href={`#${MAIN_CONTENT_ID}`}
        className={styles.skipLink}
      >
        {COMMON_MESSAGES.skipToContent}
      </a>
      <TopBar />
      <SideNav />
      <Main className={styles.main}>
        {/* Suspense INSIDE the layout: while a lazy page downloads, only this area shows the fallback; the chrome stays. */}
        <Suspense fallback={<Splash />}>
          <Outlet />
        </Suspense>
      </Main>
      <Toaster />
    </div>
  );
}
