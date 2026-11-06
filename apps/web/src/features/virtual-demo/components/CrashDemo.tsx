import { useState } from "react";
import { Button, ErrorBoundary, ErrorFallback } from "@/shared/components";

// A component that deliberately throws while rendering.
function Bomb(): never {
  throw new Error("Boom: this widget crashed while rendering");
}

// Demo: a crash inside the boundary shows the fallback, and the rest of the page keeps working.
export default function CrashDemo() {
  const [crashed, setCrashed] = useState(false);

  return (
    <section>
      <h2>Error boundary demo</h2>
      <ErrorBoundary
        resetKeys={[crashed]}
        fallback={({ reset }) => (
          <ErrorFallback
            onRetry={() => {
              setCrashed(false);
              reset();
            }}
          />
        )}
      >
        {crashed ? <Bomb /> : <p>This widget is healthy.</p>}
      </ErrorBoundary>
      <Button
        variant="secondary"
        onClick={() => setCrashed(true)}
      >
        Crash this widget
      </Button>
    </section>
  );
}
