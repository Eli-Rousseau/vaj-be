import { AuthorizationError, ConfigError } from "@/src/core/errors";

///////////
// TYPES //
///////////
type AuthorizationEvent = {
  userRole: string;
  authorizedRoles: string[];
};

//////////
// MAIN //
//////////
export function authorize(event: AuthorizationEvent) {
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
