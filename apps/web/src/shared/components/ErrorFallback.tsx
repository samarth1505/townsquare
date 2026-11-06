import { COMMON_MESSAGES } from "@/shared/messages";
import Button from "./Button";

type ErrorFallbackProps = {
  message?: string;
  onRetry?: () => void;
};

// A small, reusable "this part failed" message with an optional retry.
export default function ErrorFallback({
  message = COMMON_MESSAGES.sectionFailed,
  onRetry,
}: ErrorFallbackProps) {
  return (
    <div role="alert">
      <p>{message}</p>
      {onRetry && <Button onClick={onRetry}>{COMMON_MESSAGES.tryAgain}</Button>}
    </div>
  );
}
