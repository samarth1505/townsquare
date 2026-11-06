import { useState } from "react";
import { ApiError, ERROR_CODES, getAuthErrorMessage, maskPhone } from "@hub/core";
import { useAuth } from "@/features/auth";
import AppText from "@/shared/components/AppText";
import Button from "@/shared/components/Button";
import Screen from "@/shared/components/Screen";
import { accountApi } from "@/shared/lib/apiClient";
import { HOME_MESSAGES } from "../messages";

// A placeholder home screen that PROVES the session machinery: it makes an authenticated request. If the 30-second
// access token has expired, the shared HTTP client renews it by itself (using the refresh token from secure storage)
// and the user never notices.
export default function HomeScreen() {
  const { session, signOut, refreshCount } = useAuth();
  const [asking, setAsking] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);

  async function whoAmI() {
    setAsking(true);
    try {
      const me = await accountApi.me();
      setAnswer(HOME_MESSAGES.serverSays(maskPhone(me.phone)));
    } catch (error) {
      setAnswer(getAuthErrorMessage(error instanceof ApiError ? error.code : ERROR_CODES.network));
    } finally {
      setAsking(false);
    }
  }

  return (
    <Screen>
      <AppText variant="title">{HOME_MESSAGES.title}</AppText>
      <AppText variant="muted">
        {HOME_MESSAGES.signedInAs(session ? maskPhone(session.user.phone) : "")}
      </AppText>
      <AppText variant="muted">{HOME_MESSAGES.explainer}</AppText>
      <Button
        label={asking ? HOME_MESSAGES.asking : HOME_MESSAGES.whoAmI}
        onPress={() => void whoAmI()}
        loading={asking}
      />
      {answer !== null && (
        <AppText
          accessibilityLiveRegion="polite"
          testID="who-am-i-answer"
        >
          {answer}
        </AppText>
      )}
      <AppText
        variant="muted"
        testID="refresh-count"
      >
        {HOME_MESSAGES.refreshes(refreshCount)}
      </AppText>
      <Button
        label={HOME_MESSAGES.logout}
        variant="secondary"
        onPress={() => void signOut()}
      />
    </Screen>
  );
}
