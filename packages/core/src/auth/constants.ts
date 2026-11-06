// Endpoint paths and backend error codes live here, once. Never type them inline.

// How long the user must wait before asking for another one-time code.
export const RESEND_COOLDOWN_SECONDS = 30;
export const AUTH_ENDPOINTS = {
  requestOtp: "/auth/otp/request",
  verifyOtp: "/auth/otp/verify",
  refresh: "/auth/refresh",
  logout: "/auth/logout",
  me: "/auth/me",
} as const; // `as const` makes the values exact literal types and read-only

// Codes the backend returns in { error: "<code>" }.
export const AUTH_ERROR_CODES = {
  invalidPhone: "invalid_phone",
  invalidChannel: "invalid_channel",
  wrongOtp: "wrong_otp",
  otpExpired: "otp_expired_or_not_requested",
  tooManyAttempts: "too_many_attempts",
  invalidRefreshToken: "invalid_refresh_token",
} as const;
