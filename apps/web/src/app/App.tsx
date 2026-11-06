import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router";
import { AuthProvider } from "@/features/auth";
import { ErrorBoundary, ErrorFallback } from "@/shared/components";
import { COMMON_MESSAGES } from "@/shared/messages";
import { queryClient } from "@/shared/lib/queryClient";
import AppEffects from "./AppEffects";
import AppRoutes from "./AppRoutes";
import RouteAccessibility from "./RouteAccessibility";
import RouteTracker from "./RouteTracker";

// app/ = wiring only. Order matters: the router and the guard both read the auth context,
// so AuthProvider sits outside them. QueryClientProvider holds the server-data cache.
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppEffects />
        <BrowserRouter>
          <RouteTracker />
          <RouteAccessibility />
          {/* App-level boundary: the last line of defence, so a crash never leaves a blank white page. */}
          <ErrorBoundary
            fallback={() => (
              <ErrorFallback
                message={COMMON_MESSAGES.somethingWentWrong}
                onRetry={() => window.location.reload()}
              />
            )}
          >
            <AppRoutes />
          </ErrorBoundary>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
