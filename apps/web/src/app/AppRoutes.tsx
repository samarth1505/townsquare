import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router";
import { RequireAuth } from "@/features/auth";
import { AppLayout } from "@/features/shell";
import LobbyPage from "@/pages/LobbyPage";
import LoginPage from "@/pages/LoginPage";
import { Splash } from "@/shared/components";
import { ROUTES, SETTINGS_SEGMENTS } from "@/shared/lib/routes";

// Code-splitting: these pages are downloaded only when the user first visits them (each becomes its own JS file).
// The main paths (login, lobby) stay in the main bundle because almost every visit needs them.
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const ProfileSettingsPage = lazy(() => import("@/pages/settings/ProfileSettingsPage"));
const SecuritySettingsPage = lazy(() => import("@/pages/settings/SecuritySettingsPage"));
const VirtualDemoPage = lazy(() => import("@/pages/VirtualDemoPage"));
const ReactLabPage = lazy(() => import("@/pages/ReactLabPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

// The route table: which URL shows which page. Routes NEST, and each level renders its child through <Outlet />:
//   RequireAuth (guard)  >  AppLayout (chrome)  >  page  >  (for Settings) a child page
export default function AppRoutes() {
  return (
    // Outer Suspense: covers the pages that sit outside the layout (login, not-found).
    <Suspense fallback={<Splash />}>
      <Routes>
        <Route
          path={ROUTES.login}
          element={<LoginPage />}
        />

        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route
              path={ROUTES.home}
              element={<LobbyPage />}
            />
            <Route
              path={ROUTES.settings}
              element={<SettingsPage />}
            >
              {/* Child routes use RELATIVE paths and render inside SettingsPage's <Outlet /> */}
              <Route
                index
                element={
                  <Navigate
                    to={ROUTES.settingsProfile}
                    replace
                  />
                }
              />
              <Route
                path={SETTINGS_SEGMENTS.profile}
                element={<ProfileSettingsPage />}
              />
              <Route
                path={SETTINGS_SEGMENTS.security}
                element={<SecuritySettingsPage />}
              />
            </Route>
            <Route
              path={ROUTES.virtualDemo}
              element={<VirtualDemoPage />}
            />
            <Route
              path={ROUTES.reactLab}
              element={<ReactLabPage />}
            />
          </Route>
        </Route>

        {/* "*" matches any URL nothing above matched. */}
        <Route
          path="*"
          element={<NotFoundPage />}
        />
      </Routes>
    </Suspense>
  );
}
