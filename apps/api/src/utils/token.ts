import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "../config/env.js";
import type { Role } from "@aisaf/shared";

export type AuthTokenPayload = {
  sub: string;
  email: string;
  role: Role;
  name: string | null;
  exp: number;
};

function b64url(input: Buffer | string): string {
  const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return buf.toString("base64url");
}

function sign(payloadB64: string): string {
  return createHmac("sha256", env.JWT_SECRET).update(payloadB64).digest("base64url");
}

export function signAuthToken(
  payload: Omit<AuthTokenPayload, "exp">,
  ttlSeconds = 60 * 60 * 24 * 7,
): string {
  const full: AuthTokenPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const payloadB64 = b64url(JSON.stringify(full));
  return `${payloadB64}.${sign(payloadB64)}`;
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) {
    throw new Error("Malformed token");
  }
  const expected = sign(payloadB64);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new Error("Invalid token signature");
  }
  const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8")) as AuthTokenPayload;
  if (payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Token expired");
  }
  return payload;
}
