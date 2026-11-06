import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { config } from "../config.js";

export interface AccessPayload {
  sub: string;
  phone: string;
}

export const signAccess = (user: AccessPayload) =>
  jwt.sign(user, config.jwtSecret, { expiresIn: config.accessTtlSeconds });

export const verifyAccess = (token: string): AccessPayload =>
  jwt.verify(token, config.jwtSecret) as AccessPayload & jwt.JwtPayload;

// Refresh tokens are opaque and stored server-side, so they can be revoked and rotated.
const refreshStore = new Map<string, { userId: string; phone: string; expiresAt: number }>();

export function issueRefresh(user: { id: string; phone: string }) {
  const token = randomUUID();
  refreshStore.set(token, {
    userId: user.id,
    phone: user.phone,
    expiresAt: Date.now() + config.refreshTtlDays * 864e5,
  });
  return token;
}

// Rotation: a refresh token works exactly once; using it returns the record and deletes it.
export function consumeRefresh(token: string | undefined) {
  if (!token) return null;
  const rec = refreshStore.get(token);
  refreshStore.delete(token);
  return rec && rec.expiresAt > Date.now() ? rec : null;
}
