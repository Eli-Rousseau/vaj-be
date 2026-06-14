import crypto from "crypto";

import { ShopUser } from "@/src/database/classes/transformer-classes";
import { AuthorizationError } from "@/src/utils/errors";

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