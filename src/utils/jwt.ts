import crypto from "crypto";

import { ShopUser } from "@/src/database/classes/transformer-classes";
import { AuthorizationError } from "@/src/utils/errors";

export function generateJWTToken(user: ShopUser, secret: string, expirationInSeconds: number): string {
    const header = {
        alg: "HS256",
        typ: "JWT"
    };

    const encodedHeader = Buffer
        .from(JSON.stringify(header))
        .toString("base64url");

    const now = Math.floor(Date.now() / 1000);
    const payload = {
        reference: user.reference,
        sequentialId: user.sequentialId,
        email: user.email,
        systemRole: user.systemRole,
        systemAuthentication: user.systemAuthentication,
        iat: now,
        exp: now + expirationInSeconds
    } as Record<string, any>;

    const encodedPayload = Buffer
        .from(JSON.stringify(payload))
        .toString("base64url");

    const signature = crypto
        .createHmac("sha256", secret)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest("base64url");

    const token = `${encodedHeader}.${encodedPayload}.${signature}`;

    return token;
}

export function decodeJWTToken(token: string, secret: string) {
  const parts = token.split(".");

  if (parts.length !== 3) {
    throw new AuthorizationError("INVALID_ACCESS_TOKEN");
  }

  const [encodedHeader, encodedPayload, signature] = parts;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");

  const isValid = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );

  if (!isValid) {
    throw new AuthorizationError("INCORRECT_REFRESH_TOKEN_SIGNATURE");
  }

  const payload = JSON.parse(
    Buffer.from(encodedPayload, "base64url").toString("utf-8")
  );

  if (payload.exp) {
    const now = Math.floor(Date.now() / 1000);
    if (now >= payload.exp) {
      throw new AuthorizationError("TOKEN_EXPIRED");
    }
  }

  const user = ShopUser.fromPlain({
    reference: payload.reference,
    sequentialId: payload.sequentialId,
    email: payload.email,
    systemRole: payload.systemRole,
    systemAuthentication: payload.systemAuthentication,
  });

  return user;
}