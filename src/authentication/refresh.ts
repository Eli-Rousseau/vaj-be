import { AuthenticationError, BadRequestError, ConfigError, DatabaseError } from "../api/error-classes";
import { ShopRefreshToken } from "../database/classes/transformer-classes";
import { generateGenericToken, generateJWTToken } from "./common";
import * as gql from "./gql";

type RefreshTokenEvent = {
    tokenReferenceAndHash: string;
    jwtSecret: string;
}

type RefreshTokenResult = {
    accessToken: string;
    refreshToken: ShopRefreshToken;
}

export async function refreshToken(event: RefreshTokenEvent): Promise<RefreshTokenResult> {
    const { tokenReferenceAndHash, jwtSecret } = event;

    if (!jwtSecret) throw new ConfigError("CONFIG_MISSING_JWT_SECRET");

    if (!tokenReferenceAndHash) throw new BadRequestError(`INVALID_REFRESH_TOKEN.`);

    const [ tokenReference, tokenHash ] = tokenReferenceAndHash.split(".");

    if (!tokenReference || !tokenHash) throw new BadRequestError(`INVALID_REFRESH_TOKEN.`);

    let refreshToken;
    try {
        refreshToken = await gql.findRefreshTokenByReference(tokenReference);
    } catch (error) {
        throw new DatabaseError(`FIND_REFRESH_TOKEN_FAILED:${error}`);
    }

    const expiration = new Date(Date.now())
    if (
        refreshToken.tokenHash !== tokenHash
        || refreshToken.revokedAt !== null
        || refreshToken.replacedBy !== null
        || refreshToken.expiresAt! < expiration
    ) {

        const refreshTokensToRevoke = refreshToken.userByReference?.nonRevokedRefreshTokens;

        if (refreshTokensToRevoke) {

            const lastRefreshToken = refreshTokensToRevoke.sort((token1, token2) => { 
                return token1.expiresAt! > token2.expiresAt! ? 1 : -1 
            })[0];
            refreshTokensToRevoke.forEach((token) => {
                token.revokedAt = expiration;
                token.replacedBy = lastRefreshToken.reference!;
            });

            try {
                await gql.revokeRefreshTokens(refreshTokensToRevoke);
            } catch (error) {
                throw new DatabaseError(`REVOKE_REFRESH_TOKENS_FAILED:${error}`);
            }
        }

        throw new AuthenticationError(`INCORRECT_REFRESH_TOKEN`);
    }

    const user = refreshToken.userByReference!;

    let newRefreshToken = ShopRefreshToken.fromPlain({
        user: user.reference,
        tokenHash: generateGenericToken(),
        expiresAt: expiration
    });

    try {
        newRefreshToken = await gql.createRefreshToken(newRefreshToken);
    } catch (error) {
        throw new DatabaseError(`CREATE_REFRESH_TOKEN_FAILED:${error}`);
    }

    const refreshTokensToRevoke = user.nonRevokedRefreshTokens;

    if (refreshTokensToRevoke && refreshTokensToRevoke.length > 0) {
        refreshTokensToRevoke.forEach((token) => {
            token.revokedAt = expiration;
            token.replacedBy = newRefreshToken.reference;
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
        refreshToken: newRefreshToken
    }
}