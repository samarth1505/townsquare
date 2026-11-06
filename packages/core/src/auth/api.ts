import type { HttpClient } from "../http";
import { AUTH_ENDPOINTS } from "./constants";
import type { OtpChannel, Session, User } from "./types";

export interface OtpRequestResult {
  sent: boolean;
  channel: OtpChannel;
  expiresInSeconds: number;
}

// Network layer for auth: one function per endpoint. It receives the shared, already-configured client.
export function createAuthApi(http: HttpClient) {
  return {
    requestOtp: (phone: string, channel: OtpChannel) =>
      http.post<OtpRequestResult>(AUTH_ENDPOINTS.requestOtp, { phone, channel }),
    verifyOtp: (phone: string, otp: string) =>
      http.post<Session>(AUTH_ENDPOINTS.verifyOtp, { phone, otp }),
    // Web: no argument (the browser sends the httpOnly cookie). Mobile: pass the token kept in secure storage.
    refresh: (refreshToken?: string) =>
      http.post<Session>(AUTH_ENDPOINTS.refresh, refreshToken ? { refreshToken } : undefined),
    // Needs a logged-in client (one that sends the access token and refreshes it).
    me: () => http.get<User>(AUTH_ENDPOINTS.me),
    logout: (refreshToken?: string) =>
      http.post<void>(AUTH_ENDPOINTS.logout, refreshToken ? { refreshToken } : undefined),
  };
}

export type AuthApi = ReturnType<typeof createAuthApi>;
