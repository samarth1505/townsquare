import type { ReactNode } from "react";
import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import ErrorBoundary from "./ErrorBoundary";
import ErrorFallback from "./ErrorFallback";

type QueryBoundaryProps = {
  children: ReactNode;
  message?: string;
};

// An error boundary that also understands data-fetching errors.
// Queries with `throwOnError: true` throw their async error DURING RENDER, so this boundary can catch it.
// "Try again" must reset BOTH the query's error state and the boundary, otherwise the query would not retry.
export default function QueryBoundary({ children, message }: QueryBoundaryProps) {
  const { reset: resetQueries } = useQueryErrorResetBoundary();

  return (
    <ErrorBoundary
      fallback={({ reset }) => (
        <ErrorFallback
          message={message}
          onRetry={() => {
            resetQueries();
            reset();
          }}
        />
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
