import { AuthenticationError, BadRequestError, ConfigError, DatabaseError, DataInconsistencyError } from "../api/error-classes";
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

export async function loginUser(event: LoginEvent): Promise<LoginResult> {
    const { user: rawUser, jwtSecret } = event;

    if (!jwtSecret) throw new ConfigError("CONFIG_MISSING_JWT_SECRET");

    let inputUser: ShopUser;
    try {
        inputUser = ShopUser.fromPlain(rawUser);
    } catch (error) {
        throw new TypeError(`UNABLE_TO_TRANSFORM_USER_TYPE:${error}`);
    }

    if (!inputUser.email || !isValidEmail(inputUser.email)) throw new BadRequestError(`INVALID_EMAIL:${inputUser.email}`);

    if (!inputUser.password) throw new BadRequestError(`MISSING_PASSWORD:${inputUser.password}`);

    const user = await findUserByEmail(inputUser.email);

    if (inputUser.password !== user?.password) throw new AuthenticationError(`INCORRECT_USER_PASSWORD`);

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
    
    const refreshTokensToRevoke = user.nonRevokedRefreshTokens;

    if (refreshTokensToRevoke && refreshTokensToRevoke.length > 0) {
        const revokedAt = new Date(Date.now());
        const replacedBy = refreshToken.reference;
        refreshTokensToRevoke?.forEach((token) => {
            token.revokedAt = revokedAt;
            token.replacedBy = replacedBy;
        });

        try {
            await gql.revokeRefreshTokens(refreshTokensToRevoke);
        } catch (error) {
            throw new DatabaseError(`REVOKE_REFRESH_TOKENS_FAILED:${error}`);
        }
    }

    const accessToken = generateJWTToken(user, jwtSecret, 30 * 60);

    return {
        accessToken,
        refreshToken
    };
}