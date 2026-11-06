import { AUTH_ERROR_IDS } from "../constants";
import { getErrorMessage } from "../messages";
import { useLoginFlow } from "../hooks/useLoginFlow";
import PhoneStep from "./PhoneStep";
import OtpStep from "./OtpStep";
import styles from "./AuthForm.module.css";

export default function LoginFlow() {
  const {
    phone,
    phoneFormKey,
    sendState,
    verifyState,
    sendCode,
    resendCode,
    verifyCode,
    changeNumber,
  } = useLoginFlow();

  const verifyBusy = verifyState.status === "verifying" || verifyState.status === "success";

  return (
    <>
      <PhoneStep
        key={phoneFormKey}
        locked={phone !== null || sendState.status === "sending"}
        errorId={sendState.status === "error" ? AUTH_ERROR_IDS.send : undefined}
        onSubmit={sendCode}
      />

      {sendState.status === "sending" && <p className={styles.message}>Sending code…</p>}
      {sendState.status === "error" && (
        <p
          id={AUTH_ERROR_IDS.send}
          className={styles.error}
          role="alert"
        >
          {getErrorMessage(sendState.code)}
        </p>
      )}

      {phone !== null && (
        <OtpStep
          phone={phone}
          submitting={verifyBusy}
          errorId={verifyState.status === "error" ? AUTH_ERROR_IDS.verify : undefined}
          onBack={changeNumber}
          onVerify={verifyCode}
          onResend={resendCode}
        />
      )}

      {verifyState.status === "verifying" && <p className={styles.message}>Verifying…</p>}
      {verifyState.status === "error" && (
        <p
          id={AUTH_ERROR_IDS.verify}
          className={styles.error}
          role="alert"
        >
          {getErrorMessage(verifyState.code)}
        </p>
      )}
    </>
  );
}
