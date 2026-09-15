import { SignJWT, jwtVerify } from "jose";

import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from "@/api/auth/env";

export const ACCESS_TOKEN_SECRET = new TextEncoder().encode(
  JWT_ACCESS_SECRET,
);
export const REFRESH_TOKEN_SECRET = new TextEncoder().encode(
  JWT_REFRESH_SECRET,
);

export type TokenPayload = {
  sub: string;
};

export const signToken = (userId: string, ttl: string, secret: Uint8Array) =>
  new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ttl)
    .sign(secret);

