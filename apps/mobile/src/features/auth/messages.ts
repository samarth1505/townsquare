// User-facing copy for the phone app's auth screens (kept out of the components: easy to review and translate).
export const AUTH_MESSAGES = {
  loginTitle: "Log in to Hub",
  phoneLabel: "Phone number",
  channelLabel: "Send code via",
  channels: { sms: "SMS", whatsapp: "WhatsApp", call: "Call" },
  sendCode: "Send code",
  sendingCode: "Sending code…",
  otpTitle: (maskedPhone: string) => `Enter the code sent to ${maskedPhone}`,
  otpLabel: "Verification code",
  verify: "Verify",
  verifying: "Verifying…",
  resend: "Resend code",
  resendIn: (seconds: number) => `Resend code in ${seconds}s`,
  changeNumber: "Change number",
  offlineTitle: "Can't reach Hub",
  offlineBody:
    "We couldn't check your sign-in. You are still signed in. Check your connection and try again.",
  retry: "Try again",
} as const;
