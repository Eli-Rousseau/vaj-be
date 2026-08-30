import { logger } from "@/src/core/logger";
import { decodeJWTToken, generateJWTToken } from "@/src/core/jwt";
import { postgres } from "@/src/core/postgres";
import {
  ShopRefreshToken,
  ShopUser,
} from "@/src/be/database/classes/transformer-classes";
import { generateGenericToken } from "@/src/core/jwt";
import { HTTPError } from "@/src/core/errors";

const LOGGER = logger.get();

type VAJAuthOptions = {
  email: string;
  password: string;
}

type VAJClientOptions = {
  email: string;
  password: string;
  auth?: VAJAuth;
};

type Tokens = {
  accessToken: string;
  refreshToken: string;
};

type VAJCredentials = {
  email: string;
  password: string;
}

let apiUserVAJAuth: VAJAuth | null = null;
let apiUserVAJClient: VAJClient | null = null;

class VAJAuth {
  protected readonly email: string;
  protected readonly password: string;
  protected tokens: Tokens | null = null;
  protected readonly applicationUrl: string;

  constructor(options: VAJAuthOptions) {
    if (!options.email) throw Error(`Missing value for argument email.`);
    if (!options.password) throw Error(`Missing value for argument password.`);
    this.email = options.email;
    this.password = options.password;

    const applicationUrl = process.env.VAJ_APPLICATION_URL;
    if (!applicationUrl) throw new Error("Missing required environment variable: VAJ_APPLICATION_URL");
    this.applicationUrl = applicationUrl;
  }

  protected async post<TRequest, TResponse>(
    endpoint: string,
    body: TRequest,
  ): Promise<TResponse | null> {
    const url = `${this.applicationUrl}${endpoint}`;
    const request = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    };

    LOGGER.request({url, request});
    const response = await fetch(url, request);
    LOGGER.response({response});

    if (!response.ok) {
      throw new HTTPError(response.status, response.statusText);
    }

    return (await response.json()) as TResponse;
  }

  protected async register(): Promise<Tokens | null> {
    try {
      const tokens = await this.post<{ user: VAJCredentials }, Tokens>(
        "/api/v1/authentication/register",
        {
          user: { email: this.email, password: this.password },
        },
      );

      this.tokens = tokens;
      return tokens;
    } catch (HTTPError) {
      return null;
    }
  }

  protected async login(): Promise<Tokens | null> {
    try {
      const tokens = await this.post<{ user: VAJCredentials }, Tokens>(
        "/api/v1/authentication/login",
        {
          user: { email: this.email, password: this.password },
        },
      );

      this.tokens = tokens;
      return tokens;
    } catch (HTTPError) {
      return null;
    }
    
  }

  protected async refresh(): Promise<Tokens | null> {
    if (!this.tokens?.refreshToken) {
      LOGGER.warn("Missing refresh token.");
      return null;
    }

    try {
      const tokens = await this.post<{ refreshToken: string }, Tokens>(
        "/api/v1/authentication/refresh-token",
        {
          refreshToken: this.tokens.refreshToken,
        },
      );

      this.tokens = tokens;
      return tokens;
    } catch (HTTPError) {
      return null;
    } 
  }

  protected async accessTokenIsValid(): Promise<boolean> {
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
    const accessToken = this.tokens?.accessToken;

    if (!accessToken) return await this.login();

    try {
      if (await this.accessTokenIsValid()) return this.tokens;
      else return await this.refresh();
    } catch {
      return await this.login();
    }
  }

  static async withAPIUser() {
    if (!apiUserVAJAuth) {
      const userName = process.env.VAJ_API_USER_1_NAME;
      const userEmail = process.env.VAJ_API_USER_1_EMAIL;
      const userPassword = process.env.VAJ_API_USER_1_PASSWORD;
      const jwtSecret = process.env.JWT_SECRET;

      if (!userName || !userEmail || !userPassword || !jwtSecret) {
        Error(
          "Missing required environment variables: VAJ_API_USER_1_NAME, VAJ_API_USER_1_EMAIL, VAJ_API_USER_1_PASSWORD, or JWT_SECRET.",
        );
      }

      const pgPool = postgres.getPool("default");

      let user: ShopUser;
      const foundUser = (
        await pgPool.query(
          `
          SELECT 
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
              `
              INSERT INTO shop.user 
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
          `
          SELECT 
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
        expiresAt.setDate(expiresAt.getDate() + 7);
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
            `
            INSERT INTO shop."refreshToken" 
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
        `
        UPDATE shop."refreshToken"
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

      apiUserVAJAuth = new VAJAuth({ 
        email: user.email!, 
        password: user.password! 
      });
      apiUserVAJAuth.tokens = tokens;

      LOGGER.info("New default user connection established.");
    }

    return apiUserVAJAuth;
  }
}

export default class VAJClient {
  auth: VAJAuth;
  protected readonly applicationUrl: string;

  constructor(options: VAJClientOptions) {
    if (options.auth instanceof VAJAuth) this.auth = options.auth;
    else {
      this.auth = new VAJAuth({ 
        email: options.email, 
        password: options.password 
      });
    }

    const applicationUrl = process.env.VAJ_APPLICATION_URL;
    if (!applicationUrl) throw new Error("Missing required environment variable: VAJ_APPLICATION_URL");
    this.applicationUrl = applicationUrl;
  }

  static async withAPIUserAuth() {
    if (!apiUserVAJClient) {
      const userEmail = process.env.VAJ_API_USER_1_EMAIL;
      const userPassword = process.env.VAJ_API_USER_1_PASSWORD;
      if (!userEmail || !userPassword) {
        Error(
          "Missing required environment variables: VAJ_API_USER_1_EMAIL or VAJ_API_USER_1_PASSWORD.",
        );
      }

      const auth = await VAJAuth.withAPIUser();
      apiUserVAJClient = new VAJClient({
        email: userEmail!,
        password: userPassword!,
        auth
      });
    }
    
    return apiUserVAJClient!;
  }

  protected async post(
    endpoint: string,
    headers: any,
    body: any,
  ) {
    const url = `${this.applicationUrl}${endpoint}`;
    const request = {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    };

    LOGGER.request({url, request});
    const response = await fetch(url, request);
    LOGGER.response({response});

    if (!response.ok) {
      throw new HTTPError(response.status, response.statusText);
    }

    return (await response.json());
  }

  async updateSchema() {
    const endpoint = "/api/v1/graphql/update-schema";
    const headers = {
      "Authorization": (await this.auth.connect())!.accessToken
    }
    const body = "";
    await this.post(endpoint, headers, body);
  }
} 

