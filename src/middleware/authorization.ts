import crypto from "crypto";

import { ShopUser } from "../database/classes/transformer-classes";
import { AuthorizationError, ConfigError } from "../api/error-classes";

type ValidateAccessTokenEvent = {
    accessToken: string;
    jwtSecret: string
}

type ValidateAccessTokenResult = {
    user: ShopUser;
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

export function validateAccessToken(event: ValidateAccessTokenEvent): ValidateAccessTokenResult {
  const { accessToken, jwtSecret } = event;

  if (!jwtSecret) throw new ConfigError("CONFIG_MISSING_JWT_SECRET");

  let user = ShopUser.fromPlain({
    systemRole: "DEFAULT",
    systemAuthentication: "INTERNAL"
  });
  if (accessToken && typeof accessToken === "string") {
    try {
        user = decodeJWTToken(accessToken, jwtSecret);
    } catch {
        // Do nothing
    }
  }

  return { user };
}

type AuthorizationEvent = {
    userRole: string;
    authorizedRoles: string[];
};

export function authorization(event: AuthorizationEvent) {
    const { userRole, authorizedRoles } = event;

    if (!userRole || typeof userRole !== "string") throw new ConfigError("INCORRECT_USER_ROLE");
    if (!authorizedRoles || !Array.isArray(authorizedRoles) || !authorizedRoles.every(_role => typeof _role === "string")) throw new ConfigError("INCORECT_AUTHORIZATION_ROLES");

    if (!authorizedRoles.includes(userRole)) throw new AuthorizationError("UNAUTHORIZED_REQUEST");
}