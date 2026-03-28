import { BadRequestError, ConfigError, DatabaseError } from "../api/error-classes";
import { ShopUser } from "../database/classes/transformer-classes";
import { isValidEmail } from "../utils/validators";
import { encrypt, generateGenericToken, generateJWTToken } from "./common";
import { createUser, findUsersByEmail, updateUserRefreshToken } from "./gql";

type RegisterInput = {
  user: unknown;
  jwtSecret: string;
  refreshTokenSecret: string;
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
  const { user: rawUser, jwtSecret, refreshTokenSecret } = input;

  if (!jwtSecret) {
    throw new ConfigError("CONFIG_MISSING_JWT_SECRET");
  }

  if (!refreshTokenSecret) {
    throw new ConfigError("CONFIG_MISSING_REFRESH_TOKEN_SECRET");
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

  user.systemRole = "USER";
  user.systemAuthentication = "INTERNAL";

  try {
    user = await createUser(user);
  } catch (error) {
    throw new DatabaseError(`CREATE_USER_FAILED:${error}`);
  }

  const refreshToken = encrypt(user.reference!, refreshTokenSecret);
  user.refreshToken = refreshToken;

  try {
    await updateUserRefreshToken(user);
  } catch (error) {
    throw new DatabaseError(`UPDATE_USER_TOKEN_FAILED:${error}`);
  }

  const accessToken = generateJWTToken(user, jwtSecret, 30 * 60);

  return {
    accessToken,
    refreshToken,
  };
}