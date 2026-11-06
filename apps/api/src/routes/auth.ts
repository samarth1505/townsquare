import { createHash } from "node:crypto";
import { Router, type Response } from "express";
import { isMobileClient } from "../clientType.js";
import { config } from "../config.js";
import { isChannel, sendOtp } from "../services/otpSender.js";
import { consumeRefresh, issueRefresh, signAccess } from "../services/tokens.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();
const otps = new Map<string, { expiresAt: number; attempts: number }>();
const phoneOk = (p: unknown): p is string => typeof p === "string" && /^\+?\d{10,13}$/.test(p);
// An OPAQUE id: it must not contain the phone number, because the id is sent to monitoring/analytics services.
// (A real system uses a random id from the database; hashing is enough for this demo.)
const userIdFor = (phone: string) =>
  "u_" + createHash("sha256").update(phone.replace(/\D/g, "")).digest("hex").slice(0, 12);

// Web: refresh token in an httpOnly cookie (JS can't read it = XSS can't steal it).
// Mobile: no cookie jar, so the client sends header `x-client: mobile` and gets the refresh token in the body (store in SecureStore).
const COOKIE = "hub_refresh";
function respondWithSession(req: any, res: Response, user: { id: string; phone: string }) {
  const refreshToken = issueRefresh(user);
  const accessToken = signAccess({ sub: user.id, phone: user.phone });
  const base = { accessToken, expiresIn: config.accessTtlSeconds, user };
  if (isMobileClient(req)) return res.json({ ...base, refreshToken });
  res.cookie(COOKIE, refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: false /* true in production (HTTPS) */,
    maxAge: config.refreshTtlDays * 864e5,
    path: "/auth",
  });
  res.json(base);
}

router.post("/otp/request", async (req, res) => {
  const { phone, channel = "sms" } = req.body ?? {};
  if (!phoneOk(phone)) return res.status(400).json({ error: "invalid_phone" });
  if (!isChannel(channel)) return res.status(400).json({ error: "invalid_channel" });
  otps.set(phone, { expiresAt: Date.now() + config.otpTtlMs, attempts: 0 });
  await sendOtp(channel, phone);
  res.json({ sent: true, channel, expiresInSeconds: config.otpTtlMs / 1000 });
});

router.post("/otp/verify", (req, res) => {
  const { phone, otp } = req.body ?? {};
  if (!phoneOk(phone) || typeof otp !== "string")
    return res.status(400).json({ error: "invalid_request" });
  const rec = otps.get(phone);
  if (!rec || rec.expiresAt < Date.now())
    return res.status(400).json({ error: "otp_expired_or_not_requested" });
  if (rec.attempts >= config.otpMaxAttempts)
    return res.status(429).json({ error: "too_many_attempts" });
  if (otp !== config.otpCode) {
    rec.attempts++;
    return res.status(400).json({ error: "wrong_otp" });
  }
  otps.delete(phone);
  respondWithSession(req, res, { id: userIdFor(phone), phone });
});

router.post("/refresh", (req, res) => {
  const incoming = req.cookies?.[COOKIE] ?? req.body?.refreshToken;
  const rec = consumeRefresh(incoming);
  if (!rec) return res.status(401).json({ error: "invalid_refresh_token" });
  respondWithSession(req, res, { id: rec.userId, phone: rec.phone });
});

router.post("/logout", (req, res) => {
  consumeRefresh(req.cookies?.[COOKIE] ?? req.body?.refreshToken);
  res.clearCookie(COOKIE, { path: "/auth" });
  res.status(204).end();
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ id: req.user!.sub, phone: req.user!.phone });
});

export default router;
