import jwt from "jsonwebtoken";
import { config } from "../config.js";

export type AuthUser = { username: string };

export type AuthTokenPayload = AuthUser & {
  iat: number;
  exp: number;
};

export function signAuthToken(user: AuthUser): string {
  return jwt.sign({ username: user.username }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  const decoded = jwt.verify(token, config.JWT_SECRET);
  if (typeof decoded === "string" || typeof decoded.username !== "string") {
    throw new Error("invalid token payload");
  }
  return decoded as AuthTokenPayload;
}
