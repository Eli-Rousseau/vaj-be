import path from "path";
import { logger } from "@/src/utils/logger";
import { decodeJWTToken } from "@/src/utils/jwt";
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

type Tokens = {
    accessToken: string;
    refreshToken: string;
};

export class AuthVAJ {

    protected readonly credentials: InternalApiCredentials;
    protected tokens: Tokens | null = null;
    protected readonly applicationUrl: string;

    constructor(credentials: InternalApiCredentials) {
        this.credentials = credentials;

        const applicationUrl = process.env.APPLICATION_URL;

        if (!applicationUrl) {
            throw new Error(
                "Missing required environment variable: APPLICATION_URL"
            );
        }

        this.applicationUrl = applicationUrl;
    }

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
                LOGGER.warn(
                    `Request failed: ${response.status} ${response.statusText}`
                );

                return null;
            }

            return (await response.json()) as TResponse;
        } catch (error) {
            LOGGER.warn("HTTP request failed.", error);

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
            LOGGER.warn("Missing refresh token.");

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

    async connect(): Promise<Tokens | null> {
        let tokens: Tokens | null = null;

        const accessToken = this.tokens?.accessToken;

        if (!accessToken) {

            tokens = await this.login();

        } else {

            if (await this.accessTokenIsValid()) tokens = this.tokens;
            else tokens = await this.refresh();
        }

        return tokens;
    };

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
}