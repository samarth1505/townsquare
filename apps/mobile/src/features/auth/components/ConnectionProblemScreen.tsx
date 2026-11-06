import AppText from "@/shared/components/AppText";
import Button from "@/shared/components/Button";
import Screen from "@/shared/components/Screen";
import { AUTH_MESSAGES } from "../messages";

// Shown at app start when a saved login exists but the server cannot be reached. The user is NOT logged out (the saved
// token is kept): a train tunnel or flaky Wi-Fi must not throw away someone's session.
export default function ConnectionProblemScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <Screen>
      <AppText variant="title">{AUTH_MESSAGES.offlineTitle}</AppText>
      <AppText variant="muted">{AUTH_MESSAGES.offlineBody}</AppText>
      <Button
        label={AUTH_MESSAGES.retry}
        onPress={onRetry}
      />
    </Screen>
  );
}
