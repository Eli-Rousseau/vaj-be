import { ShopUser } from "@/src/database/classes/transformer-classes";
import { decodeJWTToken } from "@/src/utils/jwt";
import { AuthorizationError, ConfigError } from "@/src/utils/errors";

type ValidateAccessTokenEvent = {
  accessToken: string;
  jwtSecret: string;
};

type ValidateAccessTokenResult = {
  user: ShopUser;
};

export function validateAccessToken(
  event: ValidateAccessTokenEvent,
): ValidateAccessTokenResult {
  const { accessToken, jwtSecret } = event;

  if (!jwtSecret) throw new ConfigError("CONFIG_MISSING_JWT_SECRET");

  let user = ShopUser.fromPlain({
    systemRole: "DEFAULT",
    systemAuthentication: "INTERNAL",
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

  if (!userRole || typeof userRole !== "string")
    throw new ConfigError("INCORRECT_USER_ROLE");
  if (
    !authorizedRoles ||
    !Array.isArray(authorizedRoles) ||
    !authorizedRoles.every((_role) => typeof _role === "string")
  )
    throw new ConfigError("INCORECT_AUTHORIZATION_ROLES");

  if (!authorizedRoles.includes(userRole))
    throw new AuthorizationError("UNAUTHORIZED_REQUEST");
}
