import { ERROR_CODES } from "../http";
import { AUTH_ERROR_CODES } from "./constants";

// User-facing copy for auth errors, shared by every app (easy to review, translate and reuse).
const ERROR_MESSAGES: Record<string, string> = {
  [AUTH_ERROR_CODES.invalidPhone]: "Enter a valid phone number.",
  [ERROR_CODES.network]: "Can't reach the server. Check your connection and try again.",
  [ERROR_CODES.timeout]: "The request took too long. Please try again.",
  [AUTH_ERROR_CODES.wrongOtp]: "Wrong OTP entered, Retry again.",
  [AUTH_ERROR_CODES.otpExpired]: "OTP Expired, Retry again.",
  [AUTH_ERROR_CODES.tooManyAttempts]: "Too many attempts, Please try later",
};

export function getAuthErrorMessage(code: string): string {
  return ERROR_MESSAGES[code] ?? "Something went wrong. Please try again.";
}
