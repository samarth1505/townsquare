export type OtpChannel = "sms" | "whatsapp" | "call";

export interface User {
  id: string;
  phone: string;
}

// Shape returned by POST /auth/otp/verify and POST /auth/refresh
export interface Session {
  accessToken: string;
  expiresIn: number; // seconds
  user: User;
  // Only sent to MOBILE clients (they have no cookie jar; they keep it in secure storage). The web gets an httpOnly cookie.
  refreshToken?: string;
}
