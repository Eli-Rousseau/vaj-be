import { BadRequestError, ConfigError, DatabaseError } from "../api/error-classes";
import { ShopUser } from "../database/classes/transformer-classes";
import { isValidEmail } from "../utils/validators";
import { generateGenericToken, generateJWTToken } from "./common";
import { createUser, findUsersByEmail } from "./gql";

type RegisterInput = {
  user: unknown;
  jwtSecret: string;
};

type RegisterResult = {
  accessToken: string;
  refreshToken: string;
};

async function isEmailAlreadyAssigned(email: string) {
    const users = await findUsersByEmail(email);
    return users.length > 0;
}

export async function registerUser(input: RegisterInput): Promise<RegisterResult> {
  const { user: rawUser, jwtSecret } = input;

  if (!jwtSecret) {
    throw new ConfigError("CONFIG_MISSING_JWT_SECRET");
  }

  let user: ShopUser;
  try {
    user = ShopUser.fromPlain(rawUser);
  } catch (error) {
    throw new BadRequestError(`INVALID_USER:${error}`);
  }

  if (!user.email || !isValidEmail(user.email)) {
    throw new BadRequestError(`INVALID_EMAIL:${user.email}`);
  }

  try {
    if (await isEmailAlreadyAssigned(user.email)) {
      throw new BadRequestError("EMAIL_ALREADY_IN_USE");
    }
  } catch (error) {
    throw new DatabaseError(`FIND_USER_EMAIL_FAILED:${error}`);
  }
  
  const refreshToken = generateGenericToken();
  user.refreshtoken = refreshToken;
  user.systemRole = "USER";
  user.systemAuthentication = "INTERNAL";

  try {
    // @ts-ignore
    user = await createUser(user);
  } catch (error) {
    throw new DatabaseError(`CREATE_USER_FAILED:${error}`);
  }

  const payload = {
    reference: user.reference,
    sequentialId: user.sequentialId,
    email: user.email,
    systemRole: user.systemRole,
    systemAuthentication: user.systemAuthentication,
  };

  const accessToken = generateJWTToken(payload, jwtSecret, 30 * 60);

  return {
    accessToken,
    refreshToken,
  };
}