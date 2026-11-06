export const config = {
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: process.env.JWT_SECRET ?? "dev-only-secret",
  otpCode: process.env.OTP_CODE ?? "123456",
  accessTtlSeconds: Number(process.env.ACCESS_TOKEN_TTL_SECONDS ?? 30), // short on purpose: you will SEE the refresh flow
  refreshTtlDays: Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? 7),
  webOrigin: process.env.WEB_ORIGIN ?? "http://localhost:5173",
  otpMaxAttempts: 5,
  otpTtlMs: 5 * 60 * 1000,
};
