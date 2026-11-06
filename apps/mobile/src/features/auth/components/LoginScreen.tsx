import { getAuthErrorMessage, useLoginFlow } from "@hub/core";
import AppText from "@/shared/components/AppText";
import Screen from "@/shared/components/Screen";
import { authApi } from "@/shared/lib/api";
import { useAuth } from "../context/AuthContext";
import OtpStep from "./OtpStep";
import PhoneStep from "./PhoneStep";
import { AUTH_MESSAGES } from "../messages";

// This screen is WIRING: it connects the shared login state machine (in @hub/core, identical to the web app's) to the
// phone's components. All the rules (when a code can be sent, what a wrong code does) are already in the shared hook.
export default function LoginScreen() {
  const { signIn } = useAuth();
  const flow = useLoginFlow({ authApi, onSignedIn: (session) => signIn(session) });
  const verifyBusy =
    flow.verifyState.status === "verifying" || flow.verifyState.status === "success";

  return (
    <Screen>
      <PhoneStep
        key={flow.phoneFormKey} // a new key mounts a fresh, empty form (same trick as on the web)
        locked={flow.phone !== null || flow.sendState.status === "sending"}
        sending={flow.sendState.status === "sending"}
        onSubmit={flow.sendCode}
      />
      {flow.sendState.status === "sending" && (
        <AppText variant="muted">{AUTH_MESSAGES.sendingCode}</AppText>
      )}
      {flow.sendState.status === "error" && (
        <AppText
          variant="error"
          accessibilityRole="alert"
        >
          {getAuthErrorMessage(flow.sendState.code)}
        </AppText>
      )}

      {flow.phone !== null && (
        <OtpStep
          phone={flow.phone}
          submitting={verifyBusy}
          errorMessage={
            flow.verifyState.status === "error"
              ? getAuthErrorMessage(flow.verifyState.code)
              : undefined
          }
          onVerify={flow.verifyCode}
          onResend={flow.resendCode}
          onBack={flow.changeNumber}
        />
      )}
    </Screen>
  );
}
