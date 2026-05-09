import type { NextFunction, Request, Response } from "express";
import type { IncomingMessage } from "http";
import { verifyAuthToken, type AuthUser } from "./service.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

function extractBearer(header: string | undefined): string | null {
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractBearer(req.headers.authorization);
  if (!token) {
    res.status(401).json({ error: "missing token" });
    return;
  }
  try {
    const payload = verifyAuthToken(token);
    req.user = { username: payload.username };
    next();
  } catch {
    res.status(401).json({ error: "invalid token" });
  }
}

export function authenticateUpgrade(req: IncomingMessage): AuthUser | null {
  const url = new URL(req.url ?? "", "http://localhost");
  const token =
    url.searchParams.get("token") ?? extractBearer(req.headers.authorization);
  if (!token) return null;
  try {
    const payload = verifyAuthToken(token);
    return { username: payload.username };
  } catch {
    return null;
  }
}
