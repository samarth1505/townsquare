import { useState } from "react";
import { ApiError, ERROR_CODES } from "../http";
import type { AuthApi } from "./api";
import type { SendState, VerifyState } from "./loginFlowTypes";
import type { OtpChannel, Session } from "./types";

type LoginFlowDependencies = {
  authApi: AuthApi; // the network layer, already configured by the app (web: cookies; mobile: tokens)
  onSignedIn: (session: Session, channel: OtpChannel) => void; // what the APP does with a new session
};

// THE LOGIN FLOW'S STATE MACHINE, written once and shared by the web app and the React Native app.
// It knows nothing about the DOM, about React Native components, or about how a session is stored: those are the
// app's job and arrive through `authApi` and `onSignedIn`. Only the screens (JSX) differ between platforms.
export function useLoginFlow({ authApi, onSignedIn }: LoginFlowDependencies) {
  // null = OTP not requested yet; a string = the number the code was sent to.
  const [phone, setPhone] = useState<string | null>(null);
  // Remembered so "Resend" can use the same channel the user originally picked.
  const [channel, setChannel] = useState<OtpChannel>("sms");
  const [sendState, setSendState] = useState<SendState>({ status: "idle" });
  const [verifyState, setVerifyState] = useState<VerifyState>({ status: "idle" });
  // Changing this number changes the phone form's key, so React mounts a fresh, empty form.
  const [phoneFormKey, setPhoneFormKey] = useState(0);

  async function sendCode(enteredPhone: string, selectedChannel: OtpChannel) {
    setSendState({ status: "sending" });
    try {
      await authApi.requestOtp(enteredPhone, selectedChannel);
      setPhone(enteredPhone);
      setChannel(selectedChannel);
      setSendState({ status: "idle" });
    } catch (err) {
      const code = err instanceof ApiError ? err.code : ERROR_CODES.network;
      setSendState({ status: "error", code });
    }
  }

  async function resendCode() {
    if (phone === null) return; // nothing to resend before the first request
    setVerifyState({ status: "idle" }); // clear an old "wrong OTP" message
    await sendCode(phone, channel);
  }

  async function verifyCode(otp: string) {
    if (phone === null) return; // can't verify before a code was requested
    setVerifyState({ status: "verifying" });
    try {
      const session = await authApi.verifyOtp(phone, otp);
      setVerifyState({ status: "success", session });
      onSignedIn(session, channel); // hand the session to the app (store it, publish it, track it)
    } catch (err) {
      const code = err instanceof ApiError ? err.code : ERROR_CODES.network;
      setVerifyState({ status: "error", code });
    }
  }

  function changeNumber() {
    setPhone(null);
    setPhoneFormKey((key) => key + 1);
    setVerifyState({ status: "idle" }); // clear any old "wrong OTP" message
  }

  return {
    phone,
    phoneFormKey,
    sendState,
    verifyState,
    sendCode,
    resendCode,
    verifyCode,
    changeNumber,
  };
}
