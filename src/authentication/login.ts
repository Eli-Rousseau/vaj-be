import { BadRequestError, ConfigError, DatabaseError, DataInconsistencyError } from "../api/error-classes";
import { ShopRefreshToken, ShopUser } from "../database/classes/transformer-classes";
import { isValidEmail } from "../utils/validators";
import { generateGenericToken, generateJWTToken } from "./common";
import * as gql from "./gql";

type LoginEvent = {
  user: unknown;
  jwtSecret: string;
};

type LoginResult = {
  accessToken: string;
  refreshToken: ShopRefreshToken
};

async function findUserByEmail(email: string) {
    let users;
    try {
        users = await gql.findUsersByEmail(email);
    } catch (error) {
        throw new DatabaseError(`FIND_USERS_FAILED:${error}`);
    }

    if (users.length > 1) throw new DataInconsistencyError("MULTIPLE_USERS_WITH_SAME_EMAIL");
    else if (users.length === 0) throw new BadRequestError("EMAIL_IS_NOT_ASSIGNED_TO_USER");
    return users[0];
}

export async function loginUser(input: LoginEvent): Promise<LoginResult> {
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

    if (!user.password) {
        throw new BadRequestError(`INVALID_PASSWORD:${user.password}`);
    }

    user = await findUserByEmail(user.email);

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

    const refreshTokensToRevoke = user.refreshTokens!.filter(token => !token.revokedAt);

    const accessToken = generateJWTToken(user, jwtSecret, 30 * 60);

    return {
        accessToken,
        refreshToken
    };
}