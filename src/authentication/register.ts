import { BadRequestError, ConfigError, DatabaseError } from "../api/error-classes";
import { ShopUser, ShopRefreshToken } from "../database/classes/transformer-classes";
import { isValidEmail } from "../utils/validators";
import { generateGenericToken, generateJWTToken } from "./common";
import * as gql from "./gql";

type RegisterEvent = {
  user: unknown;
  jwtSecret: string;
};

type RegisterResult = {
  accessToken: string;
  refreshToken: ShopRefreshToken
};

async function isEmailAlreadyAssigned(email: string) {
    let users;
    try {
      users = await gql.findUsersByEmail(email);
    } catch (error) {
      throw new DatabaseError(`FIND_USERS_FAILED:${error}`);
    }
    
    return users.length > 0;
}

export async function registerUser(input: RegisterEvent): Promise<RegisterResult> {
  const { user: rawUser, jwtSecret } = input;

  if (!jwtSecret) {
    throw new ConfigError("CONFIG_MISSING_JWT_SECRET");
  }

  let user: ShopUser;
  try {
    user = ShopUser.fromPlain(rawUser);
  } catch (error) {
    throw new TypeError(`UNABLE_TO_TRANSFORM_USER_TYPE:${error}`);
  }

  if (!user.email || !isValidEmail(user.email)) {
    throw new BadRequestError(`INVALID_EMAIL:${user.email}`);
  }

  if (!user.name) {
    throw new BadRequestError(`INVALID_NAME:${user.name}`);
  }

  if (!user.password) {
    throw new BadRequestError(`INVALID_PASSWORD:${user.password}`);
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
    user = await gql.createUser(user);
  } catch (error) {
    throw new DatabaseError(`CREATE_USER_FAILED:${error}`);
  }

  const expiration = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // One week
  let refreshToken = ShopRefreshToken.fromPlain({
    user: user.reference,
    tokenHash: generateGenericToken(),
    expiresAt: expiration
  });

  try {
    refreshToken = await gql.createRefreshToken(refreshToken);
  } catch (error) {
    throw new DatabaseError(`CREATE_REFRESH_TOKEN_FAILED:${error}`);
  }

  const accessToken = generateJWTToken(user, jwtSecret, 30 * 60);

  return {
    accessToken,
    refreshToken
  };
}