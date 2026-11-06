import { Navigate, useLocation } from "react-router";
import { LoginFlow, useAuth, type LoginRedirectState } from "@/features/auth";
import { Main, Splash } from "@/shared/components";
import { ROUTES } from "@/shared/lib/routes";

export default function LoginPage() {
  const { session, isRestoring } = useAuth();
  const location = useLocation();

  if (isRestoring) return <Splash />; // avoid flashing the login form before we know

  if (session !== null) {
    // Send the user where they were going before the guard bounced them here (if anywhere).
    // We only accept paths inside our own app ("/..." and not "//..."), never a full URL.
    const from = (location.state as LoginRedirectState | null)?.from;
    const target = from?.startsWith("/") && !from.startsWith("//") ? from : ROUTES.home;
    return (
      <Navigate
        to={target}
        replace
      />
    );
  }

  return (
    <Main>
      <LoginFlow />
    </Main>
  );
}
