import path from "path";
import { logger } from "@/src/utils/logger";
import { decodeJWTToken, generateJWTToken } from "@/src/utils/jwt";
import { postgres } from "../utils/postgres";
import {
  ShopRefreshToken,
  ShopUser,
} from "../database/classes/transformer-classes";
import { generateGenericToken } from "../authentication/common";

const LOGGER = logger.get({
  source: "auth",
  service: "authentication",
  module: path.basename(__filename),
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

let defaultUserAuthVAJ: AuthVAJ | null = null;

export class AuthVAJ {
  protected readonly credentials: InternalApiCredentials;
  protected tokens: Tokens | null = null;
  protected readonly applicationUrl: string;

  constructor(credentials: InternalApiCredentials) {
    this.credentials = credentials;

    const applicationUrl = process.env.APPLICATION_URL;

    if (!applicationUrl) {
      throw new Error("Missing required environment variable: APPLICATION_URL");
    }

    this.applicationUrl = applicationUrl;
  }

  protected async post<TRequest, TResponse>(
    endpoint: string,
    body: TRequest,
  ): Promise<TResponse | null> {
    try {
      const response = await fetch(`${this.applicationUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        LOGGER.warn(
          `Request failed: ${response.status} ${response.statusText}`,
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
    const tokens = await this.post<{ user: InternalApiCredentials }, Tokens>(
      "/api/authentication/register",
      {
        user: this.credentials,
      },
    );

    this.tokens = tokens;

    return tokens;
  }

  async login(): Promise<Tokens | null> {
    const tokens = await this.post<{ user: InternalApiCredentials }, Tokens>(
      "/api/authentication/login",
      {
        user: this.credentials,
      },
    );

    this.tokens = tokens;

    return tokens;
  }

  async refresh(): Promise<Tokens | null> {
    if (!this.tokens?.refreshToken) {
      LOGGER.warn("Missing refresh token.");

      return null;
    }

    const tokens = await this.post<{ refreshToken: string }, Tokens>(
      "/api/authentication/refresh-token",
      {
        refreshToken: this.tokens.refreshToken,
      },
    );

    this.tokens = tokens;

    return tokens;
  }

  async accessTokenIsValid(): Promise<boolean> {
    const accessToken = this.tokens?.accessToken;

    if (!accessToken) return false;

    try {
      const user = decodeJWTToken(
        accessToken,
        process.env.JWT_SECRET as string,
      );
      return user ? true : false;
    } catch {
      return false;
    }
  }

  async connect(): Promise<Tokens | null> {
    let tokens: Tokens | null;

    const accessToken = this.tokens?.accessToken;

    if (!accessToken) {
      tokens = await this.login();
    } else {
      if (await this.accessTokenIsValid()) tokens = this.tokens;
      else tokens = await this.refresh();
    }

    return tokens;
  }

  static async connectAsDefaultUser() {
    if (!defaultUserAuthVAJ) {
      const userName = process.env.DEFAULT_USER_NAME;
      const userEmail = process.env.DEFAULT_USER_EMAIL;
      const userPassword = process.env.DEFAULT_USER_PASSWORD;
      const jwtSecret = process.env.JWT_SECRET;

      if (!userName || !userEmail || !userPassword || !jwtSecret) {
        Error(
          "Missing required environment variables: DEFAULT_USER_NAME, DEFAULT_USER_EMAIL, DEFAULT_USER_PASSWORD, or JWT_SECRET.",
        );
      }

      const pgPool = postgres.getPool("default");

      let user: ShopUser;
      const foundUser = (
        await pgPool.query(
          `SELECT 
                        reference, 
                        "sequentialId",
                        name,
                        email,
                        password,
                        "systemAuthentication",
                        "systemRole" 
                    FROM shop.user
                    WHERE name = $1
                        AND email = $2
                        AND password = $3
                    ;`,
          [userName, userEmail, userPassword],
        )
      )?.rows?.[0];
      if (foundUser) {
        user = ShopUser.fromPlain(foundUser);
      } else {
        user = ShopUser.fromPlain({
          name: userName,
          email: userEmail,
          password: userPassword,
          systemAuthentication: "INTERNAL",
          systemRole: "DEVELOPER",
        });
        const { reference: userReference, sequentialId: userSequentialId } =
          (
            await pgPool.query(
              `INSERT INTO shop.user 
                        (name, email, password, "systemAuthentication", "systemRole") 
                        VALUES ($1, $2, $3, $4, $5)
                        RETURNING reference, "sequentialId";`,
              [
                user.name,
                user.email,
                user.password,
                user.systemAuthentication,
                user.systemRole,
              ],
            )
          ).rows?.[0] || null;
        user.reference = userReference;
        user.sequentialId = userSequentialId;
      }

      let refreshToken;
      const foundRefreshToken = (
        await pgPool.query(
          `SELECT 
                        reference,
                        "sequentialId",
                        "user",
                        "tokenHash",
                        "expiresAt"
                    FROM shop."refreshToken"
                    WHERE "user" = $1
                        AND "revokedAt" IS NULL
                        AND "replacedBy" IS NULL
                        AND "expiresAt" > CURRENT_TIMESTAMP
                    ;`,
          [user.reference],
        )
      )?.rows?.[0];

      if (foundRefreshToken) {
        refreshToken = ShopRefreshToken.fromPlain(foundRefreshToken);
      } else {
        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 100);
        refreshToken = ShopRefreshToken.fromPlain({
          user: user.reference,
          tokenHash: generateGenericToken(),
          expiresAt: expiresAt,
        });
        const {
          reference: refreshTokenReference,
          sequentialId: refreshTokenSequentialId,
        } = 
          // eslint-disable-next-line  no-unsafe-optional-chaining
        (
          await pgPool.query(
            `INSERT INTO shop."refreshToken" 
                        ("user", "tokenHash", "expiresAt")
                        VALUES ($1, $2, $3)
                        RETURNING reference, "sequentialId"
                        ;`,
            [
              refreshToken.user,
              refreshToken.tokenHash,
              refreshToken
                .expiresAt!.toISOString()
                .replace("T", " ")
                .replace("Z", ""),
            ],
          )
        )?.rows?.[0];
        refreshToken.reference = refreshTokenReference;
        refreshToken.sequentialId = refreshTokenSequentialId;
      }

      await pgPool.query(
        `UPDATE shop."refreshToken"
                SET "revokedAt" = CURRENT_TIMESTAMP, "replacedBy" = $2
                WHERE "user" = $1
                    AND reference <> $2
                    AND (
                        "revokedAt" IS NULL
                        OR "replacedBy" IS NULL
                    )
                RETURNING reference
                ;
                `,
        [refreshToken.user, refreshToken.reference],
      );
      const accessToken = generateJWTToken(user, jwtSecret!, 30 * 60);
      const tokens = {
        accessToken,
        refreshToken: `${refreshToken.reference}.${refreshToken.tokenHash}`,
      };

      const loginUser = {
        name: user.name,
        email: user.email,
        password: user.password,
      } as InternalApiCredentials;
      defaultUserAuthVAJ = new AuthVAJ(loginUser);
      defaultUserAuthVAJ.tokens = tokens;

      LOGGER.info("New default user connection established.");
    }

    return defaultUserAuthVAJ.connect();
  }
}
