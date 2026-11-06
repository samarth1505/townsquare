import type { NextFunction, Request, Response } from "express";
import { verifyAccess, type AccessPayload } from "../services/tokens.js";

declare module "express-serve-static-core" {
  interface Request {
    user?: AccessPayload;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token) return res.status(401).json({ error: "missing_token" });
  try {
    req.user = verifyAccess(token);
    next();
  } catch {
    res.status(401).json({ error: "invalid_or_expired_token" });
  }
}
