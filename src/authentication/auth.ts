import path from "path";
import { logger } from "@/src/utils/logger";
import { decodeJWTToken } from "@/src/middleware/authorization";
import { Auth, Tokens } from "@/src/utils/auth";
import * as gql from "@/src/authentication/gql";

const LOGGER = logger.get({
    source: "auth",
    service: "authentication",
    module: path.basename(__filename)
});

type InternalApiCredentials = {
    name: string;
    email: string;
    password: string;
};

export class AuthInternalApi extends Auth<InternalApiCredentials> {

    protected async post<TRequest, TResponse>(
        endpoint: string,
        body: TRequest
    ): Promise<TResponse | null> {
        try {
            const response = await fetch(
                `${this.applicationUrl}${endpoint}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(body)
                }
            );

            if (!response.ok) {
                LOGGER.error(
                    `Request failed: ${response.status} ${response.statusText}`
                );

                return null;
            }

            return (await response.json()) as TResponse;
        } catch (error) {
            LOGGER.error("HTTP request failed.", error);

            return null;
        }
    }

    async register(): Promise<Tokens | null> {
        const tokens = await this.post<
            { user: InternalApiCredentials },
            Tokens
        >("/api/authentication/register", {
            user: this.credentials
        });

        this.tokens = tokens;

        return tokens;
    }

    async login(): Promise<Tokens | null> {
        const tokens = await this.post<
            { user: InternalApiCredentials },
            Tokens
        >("/api/authentication/login", {
            user: this.credentials
        });

        this.tokens = tokens;

        return tokens;
    }

    async refresh(): Promise<Tokens | null> {
        if (!this.tokens?.refreshToken) {
            LOGGER.error("Missing refresh token.");

            return null;
        }

        const tokens = await this.post<
            { refreshToken: string },
            Tokens
        >("/api/authentication/refresh-token", {
            refreshToken: this.tokens.refreshToken
        });

        this.tokens = tokens;

        return tokens;
    }

    async accessTokenIsValid(): Promise<boolean> {
        const accessToken = this.tokens?.accessToken;

        if (!accessToken) return false;

        try {
            const user = decodeJWTToken(accessToken, process.env.JWT_SECRET as string);
            return user ? true : false;
        } catch (error) {
            return false
        }
    }

    async assignUserRole(role: string) {
        const accessToken = this.tokens?.accessToken;

        if (!accessToken) return null;

        const user = decodeJWTToken(accessToken, process.env.JWT_SECRET as string);
        
        if (user.systemRole !== role) {
            user.systemRole = role;
            await gql.updateUserRole(user);
            await this.refresh();
        }
        
        return await this.connect();
    }
}